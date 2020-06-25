/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import Vue from 'vue';

import { createDB, get, set, remove } from '@/assets/js/idbHelpers.js';

// Import API
import { idbListPassThrough, idbItemPassThrough } from '@/api/api.js';
import { getDB } from '@/assets/js/idbQl.js';
//  Audit
import { initialLoad, getAudits, getAudit, getAsyncJobResponse } from '@/api/audit.js';
import { getFinding, createFinding, editFinding, deleteFinding } from '@/api/finding.js';
import { createRecommendation, editRecommendation, deleteRecommendation } from '@/api/recommendation.js';
import { createDocument, createDocumentFile, deleteAttachment, downloadFile } from '@/api/attachment.js';
import { getActivity, editActivity } from '@/api/activity.js';

export default {
  state: {
    audits: [],
    audit: {},
    activity: {},
    finding: {},
    deleteMode: false,
    hideFooter: false
  },
  mutations: {
    getAudits(state, audits) {
      state.audits = audits;
    },
    getAudit(state, audit) {
      state.audit = audit;
    },
    getActivity(state, auditActivity) {
      state.activity = auditActivity;
    },
    editActivity(state, auditActivity) {
      state.activity = auditActivity;
    },
    getFinding(state, finding) {
      state.finding = finding;
      state.activity= finding.auditActivity;
    },
    clearFinding(state) {
      state.finding = {};
    },
    setDeleteMode(state, value) {
      state.deleteMode = value;
    },
    setHideFooter(state, value) {
      state.hideFooter = value;
    },
    async reopenActivity(state, value) {
      const activity = await idbItemPassThrough({ id: value }, 'activity', false);
      const unvalidatedStatus = window.config.unvalidatedStatus;
      if (activity.activityStatus === 'localyvalidated' && unvalidatedStatus && unvalidatedStatus.split('|').length > 0) {
        const status = unvalidatedStatus.split('|');
        activity.activityStatus = status[0];
        activity.synced = 'false';
        state.activity = await idbItemPassThrough(activity, 'activity');
      }
    },
    async closeActivity(state, value) {
      state.activity = await idbItemPassThrough({
        ...value,
        activityStatus: 'localyvalidated',
        synced: 'false'
      }, 'activity');
    }
  },
  actions: {
    async getAllData({ commit }) {
      const idb = await getDB();
      const data = await initialLoad();
      if (data !== false) {
        for (let audit of data) {
          const activities = await idb.getAllFromIndex('activity', 'parentId', audit.id);
          audit.auditActivity = activities;
        }
        commit('getAudits', data);
      }
      return data;
    },
    async getAudits({ commit }, params) {
      const idb = await getDB();
      const data = await getAudits(params);
      if (data !== false) {
        for (let audit of data) {
          const activities = await idb.getAllFromIndex('activity', 'parentId', audit.id);
          audit.auditActivity = activities;
        }
        commit('getAudits', data);
      }
      return data;
    },
    async getAudit({ commit }, id) {
      const data = await getAudit(id);
      if (data !== false) {
        commit('getAudit', data);
      }
      return data;
    },
    async getActivity({ commit }, id) {
      const idb = await getDB();
      const data = await getActivity(id);
      if (data && data !== false) {
        data.finding_ActivityFinding = (await idb.getAllFromIndex('finding', 'parentId', data.id))
          .filter(finding => finding.toDelete !== 'true');
        for (let finding of data.finding_ActivityFinding) {
          // Recommendation
          // Finding my not have a past ID
          const linkToPastId = finding.externalId ? await idb.getAllFromIndex('recommendation', 'parentId', finding.externalId) : [];
          const linkToNewId = await idb.getAllFromIndex('recommendation', 'parentId', finding.id);
          const recommendation = [ ...linkToPastId, ...linkToNewId ];
          finding.recommendation = recommendation.filter(recommendation => recommendation.toDelete !== 'true');

          // Attachment
          const attachmentLinkToPastId = finding.externalId ? await idb.getAllFromIndex('attachment', 'parentId', finding.externalId) : [];
          const attachmentLinkToNewId = await idb.getAllFromIndex('attachment', 'parentId', finding.id);
          const attachment = [ ...attachmentLinkToPastId, ...attachmentLinkToNewId ];
          finding.businessDocument_ReferredToDocument = attachment.filter(attachment => attachment.toDelete !== 'true');
        }
        commit('getActivity', data);
      }
      return data;
    },
    async editActivity({ commit }, params) {
      const data = await editActivity(params);
      return data;
    },
    async getFinding({ commit }, params) {
      const idb = await getDB();
      const data = await getFinding(params);
      
      if (data && data !== false) {
        // Recommendation
        // Finding may not have a past ID
        const linkToPastId = data.externalId ? await idb.getAllFromIndex('recommendation', 'parentId', data.externalId) : [];
        const linkToNewId = await idb.getAllFromIndex('recommendation', 'parentId', data.id);
        const recommendation = [ ...linkToPastId, ...linkToNewId ];
        data.recommendation = recommendation.filter(recommendation => recommendation.toDelete !== 'true');

        // // Attachment
        const attachmentLinkToPastId = data.externalId ? await idb.getAllFromIndex('attachment', 'parentId', data.externalId) : [];
        const attachmentLinkToNewId = await idb.getAllFromIndex('attachment', 'parentId', data.id);
        const attachment = [ ...attachmentLinkToPastId, ...attachmentLinkToNewId ];
        data.businessDocument_ReferredToDocument = attachment.filter(attachment => attachment.toDelete !== 'true');

        data.auditActivity = await idb.getFromIndex('activity', 'id', params.activityId);
        commit('getFinding', data);
      }
      return data;
    },
    async getAsyncJobResponse({ commit, dispatch }, params) {
      return await getAsyncJobResponse(params);
    },
    async createFinding({ commit, dispatch }, params) {
      const data = await createFinding(params);
      if (data !== false && data.data && data.data.createFinding) {
        return true;
      }
      return data;
    },
    async updateFinding({ dispatch }, params) {
      const data = await editFinding(params);
      return data;
    },
    async deleteFinding({ dispatch }, params) {
      const data = await deleteFinding(params);
      if (data !== false) {
        // dispatch('getActivity', params.activityId);
      }
      return data;
    },
    async editRecommendation({ commit, dispatch }, params) {
      const data = await editRecommendation(params);
      // if (data !== false && data.data && data.data.createRecommendation && data.data.createRecommendation.id) {
      //   dispatch('getFinding', params.findingId);
      // }
      return data;
    },
    async createRecommendation({ commit, dispatch }, params) {
      const data = await createRecommendation(params);
      return data;
    },
    async updateRecommendation({ commit, dispatch }, params) {
      const data = await editRecommendation(params);
      return data;
    },
    clearFinding({ commit }) {
      commit('clearFinding');
    },
    // eslint-disable-next-line no-empty-pattern
    async deleteRecommendation({}, params) {
      const data = await deleteRecommendation(params);
      return data;
    },
    async createAttachment(ctx, params) {
      const data = await createDocument(params);
      if (data !== false && data.data && data.data.createFinding) {
        return true;
      }
      return data;
    },
    async createAttachmentFile(ctx, params) {
      const data = await createDocumentFile(params);
      if (data !== false && data.data && data.data.createFinding) {
        return true;
      }
      return data;
    },
    async deleteAttachment(ctx, params) {
      const data = await deleteAttachment(params);
      return data;
    },
    // eslint-disable-next-line no-empty-pattern
    async downloadFile({}, params) {
      return await downloadFile(params);
    }
  }
};
