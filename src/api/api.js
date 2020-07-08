import axios from 'axios';
import { nanoid } from 'nanoid';

import config from '../configLoader.js';

import store from '../store.js';
import router from '../router.js';
import { getDB } from '@/assets/js/idbQl.js';

// Import error message files
import messages from '../translations/common.js';

const messageSet = new Set();
const pastMessages = new Set();

if (!config) throw new Error('[Mega][error] Cannot load config file');
window.config = config;

/**
 * Create a new request object
 */
export function createRequest(auth = false) {
  if (window.config.ROOT_API) {
    return axios.create({
      baseURL: window.config.ROOT_API,
      timeout: window.config.API_timeout,
      headers: {
        'Content-Type': 'application/json',
        // Cond add props to object using spread operator
        ...(
          auth !== true ? {
            'X-Hopex-Context': JSON.stringify({
              EnvironmentId: window.config.environmentId,
              RepositoryId: window.config.repositoryId,
              ProfileId: window.config.profileId
            })
          } : {}
        )
      },
      withCredentials: true
    });
  }
  return false;
}

/**
 * Handle HTTP request error, using custom error name
 * returned by the API
 * @param {Object} error Object error return by the API
 */
export function handleError(error, acceptOffline = true) {
  // Wait for him for this part
  console.error(error);
  console.dir(error);

  const errData = error && error.response ? error.response.data : { error: null };
  switch (errData.error) {
    case 'invalid_grant':
      messageSet.add(messages.en.notification.error.invalidCredential);
      break;
    case null:
      if (acceptOffline) return true;
      messageSet.add(messages.en.notification.error.loginNoNetwork);
      break;
    default:
      break;
  }

  // Loop thru message set and display a message
  // If that message is not currently or has not already been displayed a second ago
  messageSet.forEach(message => {
    if (!pastMessages.has(message)) {
      store.dispatch('displaySnackbar', { text: message, mode: 'error' });
      pastMessages.add(message);
      setTimeout(() => {
        // Remove the message from the massage bags
        messageSet.delete(message);
        pastMessages.delete(message);
      }, 1000);
    }
  });
  return false;
}

/**
 * Check if the response contain and error
 * Or if it's an async response
 * @param {*} result Axios request response
 */
export function ensureSuccess(result) {
  // Check either is there is a valid response or an async response containing a task ID and a session ID
  if (result && (result.data && typeof result.data.data === 'object' && !result.data.data.error) || result && result.hasOwnProperty('async')) {
    return result;
  }
  return Promise.reject(result);
}

/**
 * This method, perform a passthrough from the network response of multiple elements
 * @param {Array} data The data to be saved in idb
 * @param {String} key The key name to save the data in idb
 * @param {Boolean} set If we should only perform read on idb
 */
export async function idbListPassThrough(data, key, set = true) {
  const db = await getDB();
  // Save content into IDb
  if (set) await db.put(key, data, key);
  // Read the content from IDb
  return await db.get(key, key);
}

/**
 * This method, perform a passthrough from the network response of single elements
 * @param {Array} data The data to be saved in idb
 * @param {String} key The key name to save the data in idb
 * @param {Boolean} set If we should only perform read on idb
 */
export async function idbItemPassThrough(data, key, set = true, index = 'id') {
  const db = await getDB();
  // Save content into IDb
  const idx = index || 'id';
  try {
    if (set) await db.put(key, data);
    // Read the content from IDb
    if (process.env.NODE_ENV !== 'production') {
      // console.log(key, idx, data[idx])
    }
  } catch (err) {
    // FIXME : I know it's silly but ¯\_(ツ)_/¯
    if (set && !data.externalId) await db.put(key, { ...data, externalId: createId() });
  }
  return await db.getFromIndex(key, idx, data[idx]);
}

export async function idbDeleteItem(key, id, idx = 'id') {
  const db = await getDB();
  const tx = db.transaction(key, 'readwrite');
  const index = tx.store.index(idx);

  for await (const cursor of index.iterate()) {
    const item = { ...cursor.value };
    if (item[idx] === id) {
      cursor.delete();
    }
  }
  await db.delete(key, id);
}

/**
 * The idbSyncData is an asynchronous method that call each syncing method and wait for each to be resolved before passing to the next one
 * It define and global state flag to prevent triggering two synchronization at the same time
 */
export async function idbSyncData() {
  const isPending = store.getters.getPendingSync;
  if (!isPending && store.getters.isOnline) {
    store.commit('setPendingSync', true);
    await synPendingJobs();
    await syncActivity();
    await syncFinding();
    await syncRecommendation();
    await syncAttachment();
    await syncAttachmentFile();
    store.commit('setPendingSync', false);
  }
}

if (process.env.NODE_ENV != 'production') {
  window.idbSyncData = idbSyncData;
}

/**
 * syncActivity
 */
export async function syncActivity() {
  const idb = await getDB();

  const activities = (await idb.getAllFromIndex('activity', 'synced', 'false'))
    .filter(activity => activity.activityStatus !== 'localyvalidated');
  if (activities.length > 0) store.dispatch('editActivity', activities);
}

export async function synPendingJobs() {
  const idb = await getDB();
  // Findings
  const unsyncedFindings = (await idb.getAllFromIndex('finding', 'synced', 'false'))
    .filter(finding => finding.toDelete === 'false');

  const pendingFindingJobs = unsyncedFindings.filter(isPendingJob);
  if (pendingFindingJobs.length > 0) {
    for (let { asyncTask } of pendingFindingJobs) {
      if (!asyncTask) continue;
      await store.dispatch('getAsyncJobResponse', { ...asyncTask, store: 'finding' });
    }
  }

  // Recommendation
  const unsyncedRecommendation = (await idb.getAllFromIndex('recommendation', 'synced', 'false'))
    .filter(recommendation => recommendation.toDelete === 'false');

  const pendingRecommendationJobs = unsyncedRecommendation.filter(isPendingJob);
  if (pendingRecommendationJobs.length > 0) {
    for (let { asyncTask } of pendingRecommendationJobs) {
      if (!asyncTask) continue;
      await store.dispatch('getAsyncJobResponse', { ...asyncTask, store: 'recommendation' });
    }
  }

  // Attachement ...
}

/**
 * syncFinding
 */
export async function syncFinding() {
  const idb = await getDB();

  // Loop through unsynced data
  const unsyncedFindings = (await idb.getAllFromIndex('finding', 'synced', 'false'))
    .filter(finding => finding.toDelete === 'false');

  const findingsToCreate = unsyncedFindings.filter(finding => {
    return isToCreate(finding.id) && !isPendingJob(finding);
  });
  if (findingsToCreate.length > 0) await store.dispatch('createFinding', findingsToCreate);
  
  const findingsToUpdate = unsyncedFindings.filter(finding => !isToCreate(finding.id) && !isPendingJob(finding));
  if (findingsToUpdate.length > 0) await store.dispatch('updateFinding', findingsToUpdate);

  const undeletedFindings = (await idb.getAllFromIndex('finding', 'toDelete', 'true'))
    .filter(finding => !isToCreate(finding.id) && !isPendingJob(finding))
    .map(finding => finding.id);
  if (undeletedFindings.length > 0) await store.dispatch('deleteFinding', { ids: undeletedFindings });
}

/**
 * syncRecommendation
 */
export async function syncRecommendation() {
  const idb = await getDB();

  const unsyncedRecommendationPromise = (await idb.getAllFromIndex('recommendation', 'synced', 'false'))
    .map(async recommendation => {
      const finding = await idb.getFromIndex('finding', 'id', recommendation.parentId) || await idb.getFromIndex('finding', 'externalId', recommendation.parentId);
      if (finding && !isToCreate(finding.id)) {
        const attachementToSync = {
          ...recommendation,
          parentId: finding.externalId || finding.id,
        };
        idbItemPassThrough(attachementToSync, 'recommendation');
      }
      if (recommendation.toDelete !== 'true' && !isToCreate(finding.id)) return recommendation;
      return false;
    });
  // As async map return a Pending promise, we call Promise.all to resolve all pending promise representing
  // attachment to be created
  // If the condition don't match, the promise result we be undefined, thus, we filter all falsy
  const unsyncedRecommendation = (await Promise.all(unsyncedRecommendationPromise)).filter(recommendation => recommendation);
  
  // Get the recommendation to be created
  const recommendationToCreate = unsyncedRecommendation.filter(recommendation => isToCreate(recommendation.id) && !isPendingJob(recommendation));
  if (recommendationToCreate.length > 0) await store.dispatch('createRecommendation', recommendationToCreate);
  
  // // Update recommendation
  const recommendationToUpdate = unsyncedRecommendation.filter(recommendation => !isToCreate(recommendation.id) && !isPendingJob(recommendation));
  if (recommendationToUpdate.length > 0) await store.dispatch('updateRecommendation', recommendationToUpdate);

  // // Delete recommendation
  const recommendationToDelete = (await idb.getAllFromIndex('recommendation', 'toDelete', 'true'))
    .filter(recommendation => !isToCreate(recommendation.parentId))
    .map(reco => reco.id);
  if (recommendationToDelete.length > 0) await store.dispatch('deleteRecommendation', recommendationToDelete);
}

/**
 * syncAttachment
 */
export async function syncAttachment() {
  const idb = await getDB();

  // Create attachment
  const unsyncedAttachmentPromise = (await idb.getAllFromIndex('attachment', 'synced', 'false'))
    .map(async attachment => {
      const finding = await idb.getFromIndex('finding', 'id', attachment.parentId) || await idb.getFromIndex('finding', 'externalId', attachment.parentId);
      if (finding && !isToCreate(finding.id)) {
        const attachementToSync = {
          ...attachment,
          parentId: finding.externalId || finding.id,
        };
        idbItemPassThrough(attachementToSync, 'attachment');
      }
      if (attachment.toDelete !== 'true' && !isToCreate(finding.id)) return attachment;
      return false;
    });
  // As async map return a Pending promise, we call Promise.all to resolve all pending promise representing
  // attachment to be created
  // If the condition don't match, the promise result we be undefined, thus, we filter all falsy
  const unsyncedAttachment = (await Promise.all(unsyncedAttachmentPromise)).filter(attachment => attachment);

  // Get the attachment to be created
  const attachmentToCreate = unsyncedAttachment.filter(attachment => isToCreate(attachment.id));
  if (attachmentToCreate.length > 0) await store.dispatch('createAttachment', attachmentToCreate);

  // Delete attachment
  const attachmentToDelete = (await idb.getAllFromIndex('attachment', 'toDelete', 'true'))
    .filter(attachment => !isToCreate(attachment.parentId))
    .map(attachment => attachment.id);
  if (attachmentToDelete.length > 0) await store.dispatch('deleteAttachment', attachmentToDelete);
}

/**
 * syncAttachmentFile
 */
export async function syncAttachmentFile() {
  const idb = await getDB();

  // Create attachment
  const unuploadedAttachment = (await idb.getAllFromIndex('attachment', 'synced', 'true'))
    .filter(attachment => attachment.uploaded == 'false');
  unuploadedAttachment.map(attachment => store.dispatch('createAttachmentFile', attachment));
}

export function isToCreate(value) {
  return Number(value) && (new Date(Number(value))).getTime() > 0;
}

export function isPendingJob(item) {
  if (item.asyncTask && item.asyncTask.task) return true;
  return false;
}

/**
 * 
 * @param {*} error 
 */
export async function handleOfflineFallback(error) {
  console.log('[network error]', error);
  if (error.response && error.response.status) {
    switch(error.response.status) {
      case 504:
        store.dispatch('displaySnackbar', { text: messages.en.notification.error.APIout, mode: 'error' });
        return true;
      case 401:
          if ('PasswordCredential' in window && window.localStorage.getItem('token')) {
            const cred = await navigator.credentials.get({ password: true });
            if (cred) {
              console.log('[info] Credential management API, auto login ...');
              store.dispatch('login', {
                username: cred.id,
                password: cred.password
              });
            } else {
              store.dispatch('logout', { force: true });
              router.push({ path: '/login' });
            }
          }
        return true;
    }
  } else if (error.code === "ECONNABORTED") {
    store.dispatch('displaySnackbar', { text: messages.en.notification.error.APIout, mode: 'error' });
    return true;
  }
  if (error.message == 'Network Error') return true;
  return handleError(error);
}

/**
 * Create a uuid
 */
export function createId() {
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 20) ;
  return nanoid(20);
}
