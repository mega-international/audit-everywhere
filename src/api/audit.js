import { ensureSuccess, handleError, idbListPassThrough, idbItemPassThrough, idbDeleteItem, handleOfflineFallback } from './api.js';
import store from '../store.js';
import { getDB, query, isUnsync, isToDelete, isLocalChange, syncResult, tableNames } from '../assets/js/idbQl.js';

export async function initialLoad() {
  const user = store.getters.getUser;
  return query({
    query: `query {
      audit(filter: {missionStatus_in: [InProgress, Published ] auditorinAudit_PersonSystem_some: { id: "${user}" } }) {
        id
        name
        comment
        missionPlannedBeginDate
        missionPlannedEndDate
        auditTheme {
          id
          name
          auditActivity_ActivitywithTheme(filter: { activityOwner_PersonSystem_some: { id: "${user}" }}) {
            id
            name
            effectiveWorkload:activityEffectiveWorkloadHours
            estimatedWorkloadHours
            beginDate
            endDate:activityEndDate
            detailedDescription:comment
            activityStatus
          }
        }
        auditActivity(filter: { activityOwner_PersonSystem_some: { id: "${user}" }}) {
          id
          name
          effectiveWorkload:activityEffectiveWorkloadHours
          estimatedWorkloadHours
          beginDate
          endDate:activityEndDate
          detailedDescription:comment
          activityStatus
          auditTheme_ActivityTheme {
            id
            name
          }
          finding_ActivityFinding {
            id
            externalId
            name
            findingImpact
            detailedDescription
            businessDocument_ReferredtoDocument {
              id
              name
              creatorName
              creationDate
              downloadUrl
            }
            recommendation {
              id
              name
              recommendationPriority
              details
            }
          }
        }
      }
    }`
  })
  .then(ensureSuccess)
  .then(async ({ data }) => {
    // Audit
    const audits = data.data.audit;
    for (let audit of audits) {
      const { auditActivity, ...auditData } = audit;
      if (await isLocalChange(auditData.id, null, 'audit')) continue;
      await idbItemPassThrough({ ...audit, synced: 'true', toDelete: 'false' }, 'audit');

      // Activity
      if (!auditActivity) continue;
      for (let activity of auditActivity) {
        const { finding_ActivityFinding, ...activityData } = activity;
        if (await isLocalChange(activityData.id, null, 'activity')) continue;
        await idbItemPassThrough({ ...activityData, parentId: auditData.id, synced: 'true', toDelete: 'false' }, 'activity');

        // Finding
        if (!finding_ActivityFinding) continue;
        for (let finding of finding_ActivityFinding) {
          const { recommendation, businessDocument_ReferredtoDocument, ...findingData } = finding;
          if (await isLocalChange(findingData.id, findingData.externalId, 'finding')) continue;
          await idbItemPassThrough({ ...findingData, parentId: activityData.id, synced: 'true', toDelete: 'false' }, 'finding');

          if (recommendation) {
            for (let recommendationData of recommendation) {
              if (await isLocalChange(recommendationData.id, recommendationData.externalId, 'recommendation')) continue;
              await idbItemPassThrough({ ...recommendationData, parentId: findingData.id, synced: 'true', toDelete: 'false' }, 'recommendation');
            }
          }
          if (businessDocument_ReferredtoDocument) {
            for (let attachment of businessDocument_ReferredtoDocument) {
              if (await isLocalChange(attachment.id, attachment.externalId, 'attachment')) continue;
              await idbItemPassThrough({ ...attachment, parentId: findingData.id, synced: 'true', toDelete: 'false', uploaded: 'true' }, 'attachment');
            }
          }
        }
      }
    }
    const idb = await getDB();
    return await idb.getAllFromIndex('audit', 'id');
  })
  .catch(async error => {
    if (await handleOfflineFallback(error)) {
      const idb = await getDB();
      return await idb.getAllFromIndex('audit', 'id');
    }
    Promise.reject(error);
  })
  .catch(handleError);
}

export async function getAudits() {
  const user = store.getters.getUser;
  if(store.getters.isOnline){
    return query({
      query: `query {
        audit(filter: { missionStatus_in: [ InProgress, Published ] }) {
          id
          name
          comment
          missionPlannedBeginDate
          missionPlannedEndDate
          auditActivity(filter: { activityOwner_PersonSystem_some: { id: "${user}" }}) {
            id
            name
            effectiveWorkload:activityEffectiveWorkloadHours
            estimatedWorkloadHours
            beginDate
            endDate:activityEndDate
            detailedDescription:comment
            activityStatus
          }
        }
      }`
    })
    .then(ensureSuccess)
    .then(async ({ data }) => {
      // Audit
      const audits = data.data.audit;
      for (let audit of audits) {
        const { auditActivity, ...auditData } = audit;

        if (await isLocalChange(auditData.id, null, 'audit')) continue;
        idbItemPassThrough({ ...auditData, synced: 'true', toDelete: 'false' }, 'audit');
        // Activity
        for (let activity of auditActivity) {
          const { finding_ActivityFinding, ...activityData } = activity;
          if (await isLocalChange(activityData.id, null, 'activity')) continue;
          idbItemPassThrough({ ...activityData, parentId: auditData.id, synced: 'true', toDelete: 'false' }, 'activity');
        }
        const idb = await getDB();
        return await idb.getAllFromIndex('audit', 'id');
      }
    })
    .catch(async error => {
      if (await handleOfflineFallback(error)) {
        const idb = await getDB();
        return await idb.getAllFromIndex('audit', 'id');
      }
      Promise.reject(error);
    })
    .catch(handleError);
  }
  else{
    const idb = await getDB();
    return await idb.getAllFromIndex('audit', 'id');    
  }  
}

export function getAudit(id) {
  const user = store.getters.getUser; 
  if(store.getters.isOnline){
    return query({
      query: `query {
        audit(filter: { id: "${id}" }) {
          id
          name
          auditTheme {
            id
            name
            auditActivity_ActivitywithTheme(filter: { activityOwner_PersonSystem_some: { id: "${user}" }}) {
              id
              name
              effectiveWorkload:activityEffectiveWorkloadHours
              estimatedWorkloadHours
              beginDate
              endDate:activityEndDate
              detailedDescription:comment
              activityStatus
            }
          }
          auditActivity(filter: { activityOwner_PersonSystem_some: { id: "${user}" }}) {
            id
            name
            effectiveWorkload:activityEffectiveWorkloadHours
            estimatedWorkloadHours
            beginDate
            endDate:activityEndDate
            detailedDescription:comment
            activityStatus
            auditTheme_ActivityTheme {
              id
              name
            }
          }
        } 
      }`
    })
    .then(ensureSuccess)
    .then(async ({ data }) => {
      const audit = data.data.audit[0];
      const { auditActivity, auditTheme, ...auditData } = audit;
      await idbItemPassThrough({ ...audit, synced: 'true', toDelete: 'false' }, 'audit');
      for (let activity of auditActivity) {
        if (await isLocalChange(activity.id, null, 'activity')) {
          // await idbItemPassThrough({ id: activity.id }, 'activity', false);
        } else {
          await idbItemPassThrough({ ...activity, parentId: auditData.id, synced: 'true', toDelete: 'false' }, 'activity');
        }
      }
      for (let theme of auditTheme) {
        for (let activity of theme.auditActivity_ActivitywithTheme) {
          if (await isLocalChange(activity.id, null, 'activity')) {
            // await idbItemPassThrough({ id: activity.id }, 'activity', false);
          } else {
            await idbItemPassThrough({ ...activity, parentId: auditData.id, synced: 'true', toDelete: 'false' }, 'activity');
          }
        }
      }
      return audit;
    })
    .catch(async error => {
      if (await handleOfflineFallback(error)) {
        return await idbItemPassThrough({ id }, 'audit', false);
      }
      Promise.reject(error);
    })
    .catch(handleError);
  }
  else{
    const audit = idbItemPassThrough({ id }, 'audit', false);
    return audit;   
  }
}

export async function getAsyncJobResponse({ task, sessiontoken, store }) {
  const idb = await getDB();
  return query({
    async: true,
    headers: {
      'x-hopex-task': task,
      'x-hopex-sessiontoken': sessiontoken
    },
  })
  .then(async response => {
    if (response.status === 206) {
      const unsynced = (await idb.getAllFromIndex(store, 'synced', 'false'))
        .filter(item => item.toDelete === 'false' && item.asyncTask && item.asyncTask.task === task);
      return unsynced.map(item => {
        item['task'] = response.headers['x-hopex-task'] ? response.headers['x-hopex-task'] : false;
        item['sessiontoken'] = response.headers['x-hopex-sessiontoken'] ? response.headers['x-hopex-sessiontoken'] : false;
        return idbItemPassThrough(item, store);
      });
    }
    return response;
  })
  .catch(async error => {
    if (error.response && error.response.data && error.response.data.Status == 'UnknownActionId') {
      const jobId = error.response.data.ActionId;
      const unsynced = (await idb.getAllFromIndex(store, 'synced', 'false'))
        .filter(item => item.toDelete === 'false' && item.asyncTask && item.asyncTask.task === jobId);
      for (let item of unsynced) {
        item.toDelete = 'true';
        await idbItemPassThrough(item, store);
      }
    }
  })
  .then(async ({ data }) => {
    if (!data) return false;
    return Object.keys(data)
    // Split the key to recover the local finding ID
    .map(key => {
      const pastId = key.split('_')[1];
      const localItem = idbItemPassThrough({ id: pastId }, store, false);
      const item = {
        id: data[key].id,
        ...localItem,
        asyncTask: {
          task: 'false',
          sessiontoken: 'false'
        },
        synced: 'true',
        toDelete: 'false',
        pastId: pastId
      };
      return idbItemPassThrough(item, store);
    });
  })
  .catch(error => error);
}
