import { createRequest, ensureSuccess, handleError, idbListPassThrough, idbItemPassThrough, idbDeleteItem, handleOfflineFallback } from './api.js';
import store from '../store.js';
import { query, isLocalChange, htmlDecode } from '../assets/js/idbQl.js';

export async function getActivity(id) {
  if(store.getters.isOnline){
    return query({
      query: `query {
        auditActivity(filter:{id:"${id}"}) {
          id
          externalId
          name
          effectiveWorkload:activityEffectiveWorkloadHours
          estimatedWorkloadHours
          beginDate
          endDate:activityEndDate
          detailedDescription:comment(format:HTML)
          activityStatus,
          finding_ActivityFinding {
            id
            externalId
            name
            findingImpact
            detailedDescription
            businessDocument_ReferredToDocument {
              id
              externalId
              name
              creatorName
              creationDate
              downloadUrl
            }
            recommendation {
              id
              externalId
              name
              recommendationPriority
              details
            }
          }
        }
      }`
    })
    .then(ensureSuccess)
    .then(async ({ data }) => {
      let activity = data.data.auditActivity[0];
      const localData = await idbItemPassThrough({ id: id }, 'activity', false) || {};
      const { finding_ActivityFinding, ...activityData } = activity;

      if (localData && !await isLocalChange(activityData.id, activityData.externalId, 'activity')) {
        idbItemPassThrough({ ...activityData, detailedDescription: htmlDecode(activityData.detailedDescription), parentId: localData.parentId, synced: 'true', toDelete: 'false' }, 'activity');
      } else {
        idbItemPassThrough({ ...localData, detailedDescription: htmlDecode(localData.detailedDescription), synced: 'false', toDelete: 'false' }, 'activity');
      }

      // Finding
      finding_ActivityFinding.map(async finding => {
        const { recommendation, businessDocument_ReferredToDocument, ...findingData } = finding;
        if (await isLocalChange(findingData.id, findingData.externalId,'finding')) return;
        await idbItemPassThrough({ ...findingData, parentId: activityData.id, synced: 'true', toDelete: 'false' }, 'finding');

        // Recommendation
        recommendation.map(async recommendation => {
          if (await isLocalChange(recommendation.id, recommendation.externalId, 'recommendation')) return;
          // If we do have an external ID, parent ID should be an external ID
          await idbItemPassThrough({ ...recommendation, parentId: findingData.externalId || findingData.id, synced: 'true', toDelete: 'false' }, 'recommendation');
        });

        // Attachment
        businessDocument_ReferredToDocument.map(async attachment => {
          if (await isLocalChange(attachment.id, attachment.externalId, 'attachment')) return;
          // If we do have an external ID, parent ID should be an external ID
          await idbItemPassThrough({ ...attachment, parentId: findingData.externalId || findingData.id, synced: 'true', toDelete: 'false', uploaded: 'true' }, 'attachment');
        });
      });

      return await idbItemPassThrough(activity, 'activity', false);
    })
    .then(result => result)
    .catch(async error => {
      // In case of network error, we return the new local activity,
      // Note : Use await due to async behaviour, with the update of the local data
      if (await handleOfflineFallback(error)) {
        const activity = await idbItemPassThrough({ id }, 'activity', false);
        return activity;  
      }
      Promise.reject(error);
    })
    .catch(handleError);
  }
  else{
    const activity = await idbItemPassThrough({ id }, 'activity', false);
    return activity;    
  }
}

export function editActivity(activities) {

  const edititedActivities = activities.map(activity => {
    return {
      ...activity,
      synced: 'true',
      updateid: Date.now()
    };
  });

  // Locally save activity changes
  edititedActivities.forEach(activity => localUpdateActivity(activity));

  // If connection is too slow, return the temp activity
  if (!store.getters.isOnline || edititedActivities.length < 1) {
    for (let activity of edititedActivities) {
      activity.synced = 'false';
      idbItemPassThrough(activity, 'activity');
    }
    return true;
  }
  return query({
    query: `mutation {
      ${edititedActivities.map(activity => `
        activity_${activity.updateid}:createUpdateAuditActivity(id: "${activity.id}" idType:INTERNAL auditActivity: {
          ${ getFormatedDate(activity.beginDate) ? `beginDate: "${getFormatedDate(activity.beginDate)}"` : '' }
          ${ getFormatedDate(activity.endDate) ? `activityEndDate: "${getFormatedDate(activity.endDate)}"` : '' }
          ${ parseInt(activity.estimatedWorkloadHours) ? `estimatedWorkloadHours: ${parseInt(activity.estimatedWorkloadHours)}` : '' }
          ${ parseInt(activity.effectiveWorkload) ? `computedActivityEffectiveWorkloadHours: ${parseInt(activity.effectiveWorkload)}` : '' }
          comment: "${(activity.detailedDescription)}"
        }) {
          id
          name
          estimatedWorkloadHours
          activityEffectiveWorkloadHours
          beginDate
          activityEndDate
          detailedDescription:comment
        }`)
      }
    }`,
    async: true
  })
  .then(async response => {
    // If the API respond with HTTP code 206, this mean the task have not been completed before the timeout exceed
    // In that case, we recover a sessionToken, and a taskId
    // NOTE : x-hopex-task and x-hopex-sessiontoken must be allow to read in the response in server config
    if (response.status === 206) {
      return {
        async: true,
        task: response.headers['x-hopex-task'] ? response.headers['x-hopex-task'] : false,
        sessiontoken: response.headers['x-hopex-sessiontoken'] ? response.headers['x-hopex-sessiontoken'] : false,
      };
    }
    return response;
  })
  .catch(error => {
    if (error.message === 'Network Error') {
      return edititedActivities.map(async activity => await idbItemPassThrough({ ...activity, synced: 'false' }, 'activity'));
    }
    Promise.reject(error);
  })
  .then(ensureSuccess)
  .then(result => {
    // Check if we directly get a response from the API
    if (result && result.data && result.data.data && !result.async) {
      // The sync local data with API response, we need to retrieve the local data ID from que response query
      // Create an array containing all the keys of the given object
      return Object.keys(result.data.data)
        .map(key => {
          const tempId = key.split('_')[1];
          const localActivity = edititedActivities.find(activity => activity.updateid == tempId);
          const activity = {
            ...localActivity,
            ...result.data.data[key],
            parentId: localActivity.parentId,
            asyncTask: {
              task: 'false',
              sessiontoken: 'false'
            },
            synced: 'true',
            toDelete: 'false'
          };
          localUpdateActivity(activity);
        });
    }
    return edititedActivities.forEach(activity => {
      const temp = {
        ...activity,
        synced: 'false',
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        }
      };
      localUpdateActivity(temp);
    });
  })
  .catch(handleError);
}

function getFormatedDate(value) {
  if (!value) return null;
  let date = new Date(value);
  let dd = date.getDate();
  let mm = date.getMonth() + 1; //January is 0!
  
  let yyyy = date.getFullYear();
  if (dd < 10) {
    dd = '0' + dd;
  } 
  if (mm < 10) {
    mm = '0' + mm;
  } 
  return `${yyyy}-${mm}-${dd}`;
}

async function localUpdateActivity(activity) {
  return await idbItemPassThrough(activity, 'activity');
}
