import { createRequest, ensureSuccess, handleError, idbItemPassThrough, idbDeleteItem, isToCreate } from './api.js';
import store from '../store.js';
import { query } from '../assets/js/idbQl.js';

const request = createRequest();
const documentCategory = window.config.documentCategory || false;
const documentPattern = window.config.documentPattern || false;

export async function createDocument(attachments) {
  if (!documentCategory && !documentPattern) return false;

  const newAttachments = attachments.map(attachment => {
    return {
      ...attachment,
      documentId: '',
      synced: 'true',
      uploaded: 'false',
      toDelete: 'false'
    };
  });

  // Sync local data in order prevent duplicated sync
  newAttachments.forEach(async attachment => await idbItemPassThrough(attachment, 'attachment'));

  return query({
    query: `mutation {
      ${newAttachments.map(attachment => `
        attachment_${attachment.externalId}:createUpdateBusinessDocument(id:"${attachment.externalId}" idType:EXTERNAL creationMode:BUSINESS businessDocument: {
          externalId: "${attachment.externalId}"
          name: "${attachment.file.name}"
          finding_Object: {
            action: ADD
            list:[{ id: "${attachment.parentId}" idType:${attachment.parentId.length < 20 ? 'INTERNAL' : 'EXTERNAL'} }]
          }
          documentCategory: {
            action: ADD
            list:[{ id: "${documentCategory}" }]
          }
          businessDocumentPattern_DocumentPattern: {
            action: ADD
            list:[{ id: "${documentPattern}" }]
          }
        }) {
          id
          externalId
          name
          creatorName
          creationDate
          downloadUrl
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
      return newAttachments.map(async attachment => await idbItemPassThrough({ ...attachment, synced: 'false' }, 'attachment', false));
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
          const createdAttachment = result.data.data[key];
          const localAttachment = newAttachments.find(attachment => attachment.externalId === createdAttachment.externalId);
          const attachment = {
            ...createdAttachment,
            file: localAttachment.file,
            parentId: localAttachment.parentId,
            asyncTask: {
              task: 'false',
              sessiontoken: 'false'
            },
            documentId: '',
            uploaded: 'false',
            synced: 'true',
            toDelete: 'false'
          };
          return localUpdateAttachment(localAttachment.parentId, createdAttachment.externalId, attachment);
        }); 
    }
    return newAttachments.map(attachment => {
      const tempAttachment = {
        ...attachment,
        asyncTask: {
          task: result.task,
          sessiontoken: result.sessiontoken
        },
        documentId: '',
        uploaded: 'false',
        synced: 'false',
        toDelete: 'false'
      };
      return localUpdateAttachment(attachment.parentId, attachment.id, tempAttachment);
    });
  })
  .catch(handleError);
}

export async function createDocumentFile(attachment) {
  const data = new FormData();
  data.append(attachment.file.name, attachment.file);

  const hoxpexContent = request.defaults.headers['X-Hopex-Context'];

  const response = await fetch(`${request.defaults.baseURL}/hopexgraphQL/api/attachment/${attachment.id}/file`, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'X-Hopex-Context': hoxpexContent,
      'x-hopex-documentversion': 'new',
      'x-hopex-filename': attachment.file.name,
      Authorization: `Bearer ${store.getters.getToken}`,
      'Content-Type': attachment.file.type,
    },
    body: attachment.file
  });
  const responseData = await response.json();
  
  if (responseData && responseData.success) {
    const localData = await idbItemPassThrough({ id: attachment.id }, 'attachment', false);
    return await idbItemPassThrough({
      ...localData,
      documentId: data.documentId,
      uploaded: 'true',
      synced: 'true',
      toDelete: 'false'
    }, 'attachment');
  }
  return false;
}

export async function deleteAttachment(ids) {
  const cascadeOnDelete = window.config.cascadeOnDelete || false;
  // Set flags on local data
  await localDeleteAttachment(ids);

  const toDelete = ids.filter(id => !isToCreate(id));
  if (!store.getters.isOnline || toDelete.length < 1) {
    return true;
  }
  return query({
    query: `mutation {
      ${toDelete.map((id, idx) => `del_${idx}:deleteBusinessDocument(id: "${id}" cascade: ${cascadeOnDelete}) { id }`).join('\n')}
    }`
  })
  .catch(async error => {
    if (error.message === 'Network Error') {
      return { data: { success: true }};
    }
    Promise.reject(error);
  })
  .then(async () => {
    toDelete.map(id => idbDeleteItem('attachment', id));
    return { data: { success: true }};
  })
  .catch(handleError);
}

function localUpdateAttachment(findingId, externalId, attachment, deleteMode = true) {
  if (deleteMode) idbDeleteItem('attachment', externalId, 'externalId');
  return idbItemPassThrough(attachment, 'attachment');
}

async function localDeleteAttachment(toDelete) {
  toDelete.forEach(async id => {
    const isExternalId = id.length >= 20;
    const itemToDelete = {
      ...(isExternalId ? { externalId: id } : { id: id })
    };
    const idx = isExternalId ? 'externalId' : 'id';
    const attachment = await idbItemPassThrough(itemToDelete, 'attachment', false, idx);
    if (!attachment) return;
    await idbItemPassThrough({
      ...attachment,
      synced: 'false',
      toDelete: 'true'
    }, 'attachment');
  });
}

export async function downloadFile(attachment) {
  const hoxpexContent = request.defaults.headers['X-Hopex-Context'];

  const response = await fetch(`${request.defaults.baseURL}/hopexgraphQL/api/attachment/${attachment.id}/file`, {
    method: 'GET',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'X-Hopex-Context': hoxpexContent,
      Authorization: `Bearer ${store.getters.getToken}`,
    }
  });
  return await response.blob();
}
