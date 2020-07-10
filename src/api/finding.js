import { isToCreate, ensureSuccess, handleError, idbItemPassThrough, idbDeleteItem, handleOfflineFallback, createId } from './api.js';
import store from '../store.js';
import { query, isLocalChange } from '../assets/js/idbQl.js';

export async function getFinding({ findingId, activityId, external }) {
  if (store.getters.isOnline) {
    return query({
      query: `query {
        auditActivity(filter: { id: "${activityId}" }) {
          id
          activityStatus
        }
        finding(filter: { ${!external ? 'id' : 'externalId'}: "${findingId}" }) {
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
      }`})
    .then(ensureSuccess)
    .then(async ({ data }) => {
      const finding = data.data.finding[0];
      if (finding) {
        const { recommendation, businessDocument_ReferredToDocument, ...findingData } = finding;
        if (!isToCreate(finding.id) && !await isLocalChange(findingData.id, findingData.externalId, 'finding')) {
          idbItemPassThrough({ ...findingData, parentId: activityId, synced: 'true', toDelete: 'false' }, 'finding');
        }

        if (!isToCreate(finding.id) && recommendation) {
          for (let recommendationData of recommendation) {
            if (await isLocalChange(recommendationData.id, recommendationData.externalId, 'recommendation')) continue;
            await idbItemPassThrough({ ...recommendationData, parentId: findingData.externalId || findingData.id, synced: 'true', toDelete: 'false' }, 'recommendation');
          }
        }
        if (!isToCreate(finding.id) && businessDocument_ReferredToDocument) {
          for (let attachment of businessDocument_ReferredToDocument) {
            if (await isLocalChange(attachment.id, attachment.externalId, 'attachment')) continue;
            await idbItemPassThrough({ ...attachment, parentId: findingData.externalId || findingData.id, synced: 'true', toDelete: 'false', uploaded: 'true' }, 'attachment');
          }
        }
      } else {
        console.info(`[mega] This finding doesn't seem to exist, or has been deleted\nDo you want to reopen it ?`);
      }

      const obj = {};
      const index = !external ? 'id' : 'externalId';
      obj[index] = findingId
      return await idbItemPassThrough(obj, 'finding', false, index);
    })
    .catch(async error => {
      if (await handleOfflineFallback(error)) {
        // In case of network error, we return the new local finding,
        // Note : Use await due to async behaviour, with the update of the local data
        const obj = {};
        const index = !external ? 'id' : 'externalId';
        obj[index] = findingId
        return await idbItemPassThrough(obj, 'finding', false, index);
      }
      Promise.reject(error);
    })
    .catch(handleError);
  } else {
    const obj = {};
    const index = !external ? 'id' : 'externalId';
    obj[index] = findingId
    return await idbItemPassThrough(obj, 'finding', false, index);
  }
}

export async function createFinding(findings) {
  // New finding to create
  // First, we create temporary IDs that will be replaced either, once we get a response from the API call
  // Or in the case of an async mutation, once the job is finished
  const newFindings = findings.map(finding => {
    // If provided finding has already an ID
    // It's probably an async/offline creation
    if (!isToCreate(finding.id)) return finding;
    return {
      id: `${finding.id}`,
      externalId: createId(),
      name: finding.name,
      findingImpact: finding.findingImpact,
      detailedDescription: finding.detailedDescription,
      auditActivity: finding.auditActivity,
      recommendation: finding.recommendation || [],
      attachments: finding.attachments || [],
      parentId: finding.auditActivity.id,
      synced: 'true',
      toDelete: 'false'
    };
  });

  // Then we save the new finding IDB
  for (let newFinding of newFindings) {
    const { recommendation, attachments, ...findingData } = newFinding;
    await localAddFinding(newFinding.auditActivity.id, findingData);

    if (recommendation) {
      for (let reco of recommendation) {
        await localAddRecommendation(findingData.externalId, reco);
      }
    }
    if (attachments) {
      for (let attachment of attachments) {
        await localAddAttachment(findingData.externalId, attachment);
      }
    }
  }

  // If connection is too slow, return the temp finding
  if (!store.getters.isOnline) {
    for (let finding of newFindings) {
      finding.synced = 'false';
      await idbItemPassThrough(finding, 'finding');
    }
    return true;
  }
  return query({
    query: `mutation {
      ${newFindings.map(finding => `
        finding_${finding.externalId}:createUpdateFinding(id:"${finding.externalId}" idType:EXTERNAL creationMode:BUSINESS finding: {
          name: "${finding.name}"
          findingImpact: ${finding.findingImpact}
          findingType: Weakness
          detailedDescription: "${finding.detailedDescription}"
          auditActivity_Activity: {
            action: ADD
            list: [{ id: "${finding.auditActivity.id}" }]
          }
        }) {
          id
          externalId
          name
          findingImpact
          findingType
          detailedDescription
        }`)}
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
      return newFindings.forEach(async newFinding => await idbItemPassThrough({ ...newFinding, synced: 'false' }, 'finding'));
    }
    Promise.reject(error);
  })
  .then(ensureSuccess)
  .then(async result => {
    // Check if we directly get a response from the API
    if (result && result.data && result.data.data && !result.async) {
      // The sync local data with API response, we need to retrieve the local data ID from que response query
      // Create an array containing all the keys of the given object
      return Object.keys(result.data.data)
        .map(key => {
          const createdFinding = result.data.data[key];
          const localFinding = newFindings.find(finding => finding.externalId === createdFinding.externalId);
          return {
            ...createdFinding,
            auditActivity: localFinding.auditActivity,
            parentId: localFinding.auditActivity.id,
          };
        })
        // Retrieve local recommendation
        .map(createFinding => {
          const tmpFinding = newFindings.find(finding => finding.externalId === createFinding.externalId);
          const createdFinding = {
            ...createFinding,
            asyncTask: {
              task: 'false',
              sessiontoken: 'false'
            },
            synced: 'true',
            toDelete: 'false'
          };
          return localUpdateFinding(tmpFinding.auditActivity.id, createFinding.externalId, createdFinding);
        });
    }
    return newFindings.map(newFinding => {
      const tempFinding = {
        ...newFinding,
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        },
        synced: 'false',
        toDelete: 'false'
      };
      return localUpdateFinding(newFinding.auditActivity.id, newFinding.id, tempFinding);
    });
  })
  .catch(error => {
    newFindings.forEach(async newFinding => await idbItemPassThrough({ ...newFinding, synced: 'false' }, 'finding'));
    return handleError(error);
  });
}

export async function editFinding(findings) {
  const findingToUpdate = findings.map(finding => {
    const isExternalId = !!finding.externalId;
    return {
      ...finding,
      ...(!isExternalId ? { externalId: createId() } : {}),
      ...(!isExternalId ? { hasExternalId: false } : { hasExternalId: true }),
      parentId: finding.auditActivity.id,
      synced: 'true', // We add the synced: false flag to mark that this item has not been synced with the server
      toDelete: 'false'
    };
  });

  // We save the edited finding in IDB
  for (let finding of findingToUpdate) {
    const { recommendation, attachments, ...findingData } = finding;
    await localAddFinding(finding.auditActivity.id, findingData, false);
    if (attachments) {
      for (let attachment of attachments) {
        await localAddAttachment(findingData.id, attachment);
      }
    }
    if (recommendation) {
      const unsyncRecommendation = recommendation.filter(reco => reco.synced === 'false');
      for (let recommendation of unsyncRecommendation) {
        await localAddRecommendation(findingData.id, recommendation);
      }
    }
  }
  // Prevent from editing local only findings
  const editedFindings = findingToUpdate.filter(finding => !isToCreate(finding.id));

  // If connection is too slow, return the temp finding
  if (!store.getters.isOnline || editedFindings.length < 1) {
    for (let finding of findingToUpdate) {
      finding.synced = 'false';
      idbItemPassThrough(finding, 'finding');
    }
    return true;
  }
  return query({
    query: `mutation {
      ${editedFindings.map(finding => `
        finding_${finding.externalId}:createUpdateFinding(id: "${finding.hasExternalId ? finding.externalId : finding.id}"
          idType:${finding.hasExternalId ? 'EXTERNAL' : 'INTERNAL'} creationMode:BUSINESS finding: {
          externalId: "${finding.externalId}"
          name: "${finding.name}"
          findingImpact: ${finding.findingImpact}
          findingType: Weakness
          detailedDescription: "${finding.detailedDescription}"
          auditActivity_Activity:{
            action:ADD
            list:[{ id: "${finding.auditActivity.id}" }]
          }
        }) {
          id
          externalId
          name
          findingImpact
          findingType
          detailedDescription
        }`)}
    }`,
    async: true
  })
  .then(async response => {
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
      return findingToUpdate.map(async finding => await idbItemPassThrough({ ...finding, synced: 'false' }, 'finding'));
    }
    Promise.reject(error);
  })
  .then(ensureSuccess)
  .then(async result => {
    // Check if we directly get a response from the API
    if (result && result.data && result.data.data && !result.async) {
      // The sync local data with API response, we need to retrieve the local data ID from que response query
      // Create an array containing all the keys of the given object
      return Object.keys(result.data.data)
        .map(key => {
          const updatedFinding = result.data.data[key];
          const localFinding = editedFindings.find(finding => finding.externalId === updatedFinding.externalId);
          const editedFinding = {
            ...updatedFinding,
            auditActivity: localFinding.auditActivity,
            parentId: localFinding.auditActivity.id,
            asyncTask: {
              task: 'false',
              sessiontoken: 'false'
            },
            synced: 'true',
            toDelete: 'false'
          };
          return localUpdateFinding(localFinding.parentId, updatedFinding.externalId, editedFinding, false);
        });
    }
    return editedFindings.map(editedFinding => {
      const tempFinding = {
        ...editedFinding,
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        },
        synced: 'false',
        toDelete: 'false'
      };
      return localUpdateFinding(editedFinding.auditActivity.id, editedFinding.id, tempFinding, false);
    });
  })
  .catch(handleError);
}

export async function deleteFinding({ ids }) {
  const cascadeOnDelete = window.config.cascadeOnDelete || false;
  await localDeleteFinding(null, ids);
  const toDelete = ids.filter(id => !isToCreate(id));

  if (!store.getters.isOnline || toDelete.length < 1) {
    return true;
  }
  return query({
    query: `mutation {
      ${toDelete.map((id, idx) => `del_${idx}:deleteFinding(id: "${id}" cascade: ${cascadeOnDelete}) { id }`).join('\n')}
    }`,
    async: true })
    .catch(async error => {
      if (error.message === 'Network Error') {
        return { data: { success: true }};
      }
      Promise.reject(error);
    })
    .then(async () => {
      toDelete.forEach(id => idbDeleteItem('finding', id));
      return { data: { success: true }};
    })
    .catch(handleError);
}

/**
 * Locally create a new finding and push into activity
 * @param {*} activityId Activity ID
 * @param {*} finding New finding data
 */
async function localAddFinding(activityId, finding) {
  return await idbItemPassThrough(finding, 'finding');
}

/**
 *
 * @param {*} findingId
 * @param {*} recommendation
 */
async function localAddRecommendation(findingId, recommendation) {
  return await idbItemPassThrough({
    ...recommendation,
    parentId: findingId
  }, 'recommendation', true, 'externalId');
}

async function localAddAttachment(findingId, attachment) {
  return await idbItemPassThrough({
    ...attachment,
    parentId: findingId
  }, 'attachment', true, 'externalId');
}

/**
 *
 * @param {*} activityId
 * @param {*} tempId
 * @param {*} finding
 */
async function localUpdateFinding(activityId, tempId, finding, deleteMode = true) {
  // FIXME : Why do we check for the activity
  const activity = await idbItemPassThrough({ id: activityId }, 'activity', false);
  if (activity) {
    // FIXME : Test fot internal ID
    if (deleteMode) idbDeleteItem('finding', tempId, 'externalId');
    return idbItemPassThrough(finding, 'finding');
  }
}

/**
 *
 * @param {*} activityId
 * @param {*} toDelete
 */
async function localDeleteFinding(activityId, toDelete) {
  toDelete.forEach(async id => {
    const isExternalId = id.length >= 20;
    const itemToDelete = {
      ...(isExternalId ? { externalId: id } : { id: id })
    };
    const idx = isExternalId ? 'externalId' : 'id';
    const finding = await idbItemPassThrough(itemToDelete, 'finding', false, idx);
    await idbItemPassThrough({
      ...finding,
      synced: 'false',
      toDelete: 'true'
    }, 'finding');
  });
}
