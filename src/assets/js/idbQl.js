import { createRequest, idbItemPassThrough } from '@/api/api.js';
import { createDB } from './idbHelpers.js';
import store from '@/store.js';

const tableNames = {
  audit: 'audit',
  auditActivity: 'activity',
  finding_ActivityFinding: 'finding',
  recommendation: 'recommendation',
  businessDocument_ReferredtoDocument: 'businessDocument_ReferredtoDocument'
};

export { tableNames };

/**
 * 
 */
export async function getDB() { 
  return await createDB('Hopex', 4, async function(dbPromise) {
    // Audit
    const auditStore = await dbPromise.createObjectStore('audit', {
      keyPath: 'id',
    });
    auditStore.createIndex('id', 'id');
    auditStore.createIndex('synced', 'synced');
    auditStore.createIndex('toDelete', 'toDelete');

    // Activity
    const activityStore = await dbPromise.createObjectStore('activity', {
      keyPath: 'id',
    });
    activityStore.createIndex('id', 'id');
    activityStore.createIndex('parentId', 'parentId');
    activityStore.createIndex('synced', 'synced');
    activityStore.createIndex('toDelete', 'toDelete');

    // Finding
    const findingStore = await dbPromise.createObjectStore('finding', {
      keyPath: 'id',
    });
    findingStore.createIndex('id', 'id');
    findingStore.createIndex('parentId', 'parentId');
    findingStore.createIndex('externalId', 'externalId', {
      unique: true
    });
    findingStore.createIndex('synced', 'synced');
    findingStore.createIndex('toDelete', 'toDelete');

    // Recommendation
    const recommendationStore = await dbPromise.createObjectStore('recommendation', {
      keyPath: 'id',
    });
    recommendationStore.createIndex('id', 'id');
    recommendationStore.createIndex('parentId', 'parentId');
    recommendationStore.createIndex('externalId', 'externalId', {
      unique: true
    });
    recommendationStore.createIndex('synced', 'synced');
    recommendationStore.createIndex('toDelete', 'toDelete');

    // Attachment
    const attachmentStore = await dbPromise.createObjectStore('attachment', {
      keyPath: 'id',
    });
    attachmentStore.createIndex('id', 'id');
    attachmentStore.createIndex('parentId', 'parentId');
    attachmentStore.createIndex('externalId', 'externalId', {
      unique: true
    });
    attachmentStore.createIndex('synced', 'synced');
    attachmentStore.createIndex('uploaded', 'uploaded');
    attachmentStore.createIndex('toDelete', 'toDelete');
  });
}

/**
 * 
 * @param {*} param0 
 */
export function query({ query = null, async = false, headers = {} }) {
  const request = createRequest();
  const waitTimeout = window.config && window.config.ASYNC_timeout ? window.config.ASYNC_timeout : false;
  return request.post(`/hopexgraphQL/api${ async ? '/async' : '' }/Audit`, query !== null ? {
    query: query
      .replace(/#.*\n/g, '')
      .replace(/[\s|,]*\n+[\s|,]*/g, ' ')
      .replace(/:\s/g, ':')
      .replace(/,\s/g, ',')
      .replace(/\)\s\{/g, '){')
      .replace(/\}\s/g, '}')
      .replace(/\{\s/g, '{')
      .replace(/\s\}/g, '}')
      .replace(/\s\{/g, '{')
      .replace(/\)\s/g, ')')
      .replace(/\(\s/g, '(')
      .replace(/\s\)/g, ')')
      .replace(/\s\(/g, '(')
      .replace(/=\s/g, '=')
      .replace(/\s=/g, '=')
      .replace(/@\s/g, '@')
      .replace(/\s@/g, '@')
      .replace(/\s\$/g, '$')
      .replace(/\s\./g, '.')
  } : null, {
    headers: {
      Authorization: `Bearer ${store.getters.getToken}`,
      ...( async && waitTimeout ? { 'x-hopex-wait': waitTimeout } : {} ),
      ...headers
    }
  });
}

export async function isUnsync(id, table) {
  const data = await idbItemPassThrough({ id }, table, false);
  return data && data.synced === 'false';
}

export async function isToDelete(id, table) {
  const data = await idbItemPassThrough({ id }, table, false);
  return data && data.toDelete === 'true';
}

export async function isLocalChange(id, externalId, table) {
  let data = await idbItemPassThrough({ id }, table, false);
  // If no data for this ID, search for external ID
  if (!data && externalId) data = await idbItemPassThrough({ externalId }, table, false, 'externalId');
  return data && data.synced === 'false' || data && data.toDelete === 'true' || data && data.uploaded === 'false';
}

/**
 * Takes an HTML encode string and return decode HTML
 * @param {String} html Encoded HTML string
 */
export function htmlDecode(html) {
	const txt = document.createElement('textarea');
	txt.innerHTML = html;
	return txt.value;
}
