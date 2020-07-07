import { ensureSuccess, handleError, idbItemPassThrough, idbDeleteItem, isToCreate, createId } from './api.js';
import store from '../store.js';
import { query } from '../assets/js/idbQl.js';

export function createRecommendation(recommendations) {
  const newRecommendation = recommendations.map(recommendation => {
    return {
      ...recommendation,
      ...(!recommendation.recommendationPriority ? { recommendationPriority: "Medium" } : {}),
      synced: 'true',
      toDelete: 'false'
    };
  });

  // Sync local data in order prevent duplicated sync
  newRecommendation.forEach(async recommendation => await idbItemPassThrough(recommendation, 'recommendation'));

  if (!store.getters.isOnline) {
    for (let recommendation of newRecommendation) {
      recommendation.synced = 'false';
    }
    return true;
  }
  return query({
    query: `mutation {
      ${newRecommendation.map(recommendation => `
        reco_${recommendation.externalId}:createUpdateRecommendation(id:"${recommendation.externalId}" idType:EXTERNAL recommendation: {
          name: "${recommendation.name}"
          details: "${recommendation.details}"
          recommendationPriority: ${recommendation.recommendationPriority}
          finding: {
            action: ADD
            list:[{ id: "${recommendation.parentId}" idType:${recommendation.parentId.length < 20 ? 'INTERNAL' : 'EXTERNAL'} }]
          }
        }) {
          id
          externalId
          name
          details
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
  .catch(async error => {
    if (error.message === 'Network Error') {
      return newRecommendation.map(async recommendation => await idbItemPassThrough({ ...recommendation, synced: 'false' }, 'recommendation', false));
    }
    Promise.reject(error);
  })
  .then(ensureSuccess)
  .then(async result => {
    if (result && result.data && result.data.data && !result.async) {
      // The sync local data with API response, we need to retrieve the local data ID from que response query
      // Create an array containing all the keys of the given object
      return Object.keys(result.data.data)
        .map(key => {
          const createdRecommendation = result.data.data[key];
          const localRecommendation = newRecommendation.find(recommendation => recommendation.externalId === createdRecommendation.externalId);

          const recommendation = {
            ...createdRecommendation,
            asyncTask: {
              task: 'false',
              sessiontoken: 'false'
            },
            synced: 'true',
            toDelete: 'false'
          };
          return localUpdateRecommendation(localRecommendation.parentId, createdRecommendation.externalId, recommendation);
        });
    }
    return newRecommendation.map(recommendation => {
      const tempRecommendation = {
        ...recommendation,
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        },
        synced: 'false',
        toDelete: 'false'
      };
      return localUpdateRecommendation(recommendation.parentId, recommendation.externalId, tempRecommendation);
    });
  })
  .catch(handleError);
}

export function editRecommendation(recommendations) {
  const recommendationToUpdate = recommendations.map(recommendation => {
    const isExternalId = !!recommendation.externalId;
    return {
      ...recommendation,
      ...(!recommendation.recommendationPriority ? { recommendationPriority: "Medium" } : {}),
      ...(!isExternalId ? { externalId: createId() } : {}),
      ...(!isExternalId ? { hasExternalId: false } : { hasExternalId: true }),
      parentId: recommendation.parentId,
      synced: 'true',
      toDelete: 'false'
    };
  });

  // Save the temp ID in order to recover in case of error or async work
  recommendationToUpdate.map(async recommendation => await idbItemPassThrough(recommendation, 'recommendation'));

  if (!store.getters.isOnline) {
    for (let recommendation of recommendationToUpdate) {
      recommendation.synced = 'false';
    }
    return true;
  }
  return query({
    query: `mutation {
      ${recommendationToUpdate.map(recommendation => `
        reco_${recommendation.externalId}:createUpdateRecommendation(id: "${recommendation.hasExternalId ? recommendation.externalId : recommendation.id}"
          idType:${recommendation.hasExternalId ? 'EXTERNAL' : 'INTERNAL'} recommendation: {
          externalId: "${recommendation.externalId}"
          name:"${recommendation.name}"
          details:"${recommendation.details}"
          recommendationPriority: ${recommendation.recommendationPriority}
          finding:{
            action: ADD
            list:[{ id: "${recommendation.parentId}" idType:${recommendation.parentId.length < 20 ? 'INTERNAL' : 'EXTERNAL'} }]
          }
        }) {
          id
          externalId
          name
          details
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
      return recommendationToUpdate.map(async recommendation => await idbItemPassThrough({ ...recommendation, synced: 'false' }, 'recommendation'));
    }
    Promise.reject(error);
  })
  .then(ensureSuccess)
  .then(async result => {
    if (result && result.data && result.data.data && !result.async) {
      // The sync local data with API response, we need to retrieve the local data ID from que response query
      // Create an array containing all the keys of the given object
      return Object.keys(result.data.data)
        .map(key => {
          const updatedRecommendation = result.data.data[key];
          const localRecommendation = recommendationToUpdate.find(recommendation => recommendation.id == updatedRecommendation.id);
          if (localRecommendation) {
            const createdRecommendation = {
              ...result.data.data[key],
              parentId: localRecommendation.parentId,
              asyncTask: {
                task: 'false',
                sessiontoken: 'false'
              },
              synced: 'true',
              toDelete: 'false'
            };
            return localUpdateRecommendation(localRecommendation.parentId, createdRecommendation.externalId, createdRecommendation);
          }
        });
    }
    return recommendationToUpdate.map(recommendation => {
      const tempRecommendation = {
        ...recommendation,
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        },
        synced: 'false',
        toDelete: 'false'
      };
      return localUpdateRecommendation(recommendation.parentId, recommendation.externalId, tempRecommendation);
    });
  })
  .catch(handleError);
}

function localUpdateRecommendation(findingId, externalId, recommendation, deleteMode = true) {
  if (deleteMode) idbDeleteItem('recommendation', externalId, 'externalId');
  return idbItemPassThrough(recommendation, 'recommendation');
}

export async function deleteRecommendation(ids) {
  const cascadeOnDelete = window.config.cascadeOnDelete || false;
  // Set flags on local data
  await localDeleteRecommendation(ids);

  const toDelete = ids.filter(id => !isToCreate(id));
  if (!store.getters.isOnline || toDelete.length < 1) {
    return true;
  }
  return query({
    query: `mutation {
      ${toDelete.map((id, idx) => {
        const idType = id.length < 20 ? 'INTERNAL' : 'EXTERNAL';
        return `del_${idx}:deleteRecommendation(id: "${id}" idType:${idType}  cascade: ${cascadeOnDelete}) { id }`
      }).join('\n')}
    }`
  })
  .catch(async error => {
    if (error.message === 'Network Error') {
      return { data: { success: true }};
    }
    Promise.reject(error);
  })
  .then(async () => {
    toDelete.map(id => idbDeleteItem('recommendation', id));
    return { data: { success: true }};
  })
  .catch(handleError);
}

async function localDeleteRecommendation(toDelete) {
  toDelete.forEach(async id => {
    const isExternalId = id.length >= 20;
    const itemToDelete = {
      ...(isExternalId ? { externalId: id } : { id: id })
    };
    const idx = isExternalId ? 'externalId' : 'id';
    const recommendation = await idbItemPassThrough(itemToDelete, 'recommendation', false, idx);
    if (!recommendation) return;
    await idbItemPassThrough({
      ...recommendation,
      synced: 'false',
      toDelete: 'true'
    }, 'recommendation');
  });
}
