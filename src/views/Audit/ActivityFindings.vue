<template>
  <section class="ActivityFindings mt-6 px-3 pb-12" :class="isFullHeight ? 'full-modal' :''">
    <!-- Recommendation -->
    <header
      v-if="deleteMode && selectedRecommendation > 0"
      class="flex justify-between bg-white text-darkblue absolute top-0 inset-x-0 shadow-header overflow-hidden z-20 h-20">
      <div class="flex justify-center items-center p-3">
        <transition name="rotate">
          <button class="text-darkblue outline-none" ref="openButton" @click="clearSelected">
            <ma-icon icon="arrow-back" iconset="outlet"></ma-icon></button>
        </transition>
        <span class="text-lg">{{ $tc('text.recommendationToDelete', selectedRecommendation, { count: selectedRecommendation}) }}</span>
      </div>
      <div class="flex justify-center items-center pr-4">
        <button class="outline-none" @click="$modal.show('confirmDelete')"><ma-icon icon="delete" iconset="ActivityFindings"></ma-icon></button>
      </div>
    </header>
    <!-- Attachment -->
    <header
      v-if="deleteMode && selectedAttachment > 0"
      class="flex justify-between bg-white text-darkblue absolute top-0 inset-x-0 shadow-header overflow-hidden z-20 h-20">
      <div class="flex justify-center items-center p-3">
        <transition name="rotate">
          <button class="text-darkblue outline-none" ref="openButton" @click="clearSelected">
            <ma-icon icon="arrow-back" iconset="outlet"></ma-icon></button>
        </transition>
        <span class="text-lg">{{ $tc('text.attachmentToDelete', selectedAttachment, { count: selectedAttachment}) }}</span>
      </div>
      <div class="flex justify-center items-center pr-4">
        <button class="outline-none" @click="$modal.show('confirmDeleteAttachment')"><ma-icon icon="delete" iconset="ActivityFindings"></ma-icon></button>
      </div>
    </header>

    <!-- Finding -->
    <form @submit.prevent="handleSubmitFinding">
      <ma-input label="Finding" v-model="findingTitle" :disabled="isValidated" @blur="setEdited"></ma-input>
      <div class="block mt-6 text-darkblue">
        <span class="text-base">{{ $t('text.impact') }}</span>
        <div class="mt-2 flex items-stretch h-full border-darkblue border-solid border-2 rounded-lg overflow-hidden">
          <ho-level-radio
            class="flex-1"
            name="impact"
            native-value="VeryLow"
            :checked="impact.toLowerCase() == 'verylow'"
            :disabled="isValidated"
            @change="setEdited"
            v-model="impact">Very Low</ho-level-radio>
          <ho-level-radio
            class="flex-1"
            name="impact"
            native-value="Low"
            :checked="impact.toLowerCase() == 'low'"
            :disabled="isValidated"
            @change="setEdited"
            v-model="impact">Low</ho-level-radio>
          <ho-level-radio
            class="flex-1"
            name="impact"
            native-value="Medium"
            :checked="impact.toLowerCase() == 'medium'"
            :disabled="isValidated"
            @change="setEdited"
            v-model="impact">Medium</ho-level-radio>
          <ho-level-radio
            class="flex-1"
            name="impact"
            native-value="High"
            :checked="impact.toLowerCase() == 'high'"
            :disabled="isValidated"
            @change="setEdited"
            v-model="impact">High</ho-level-radio>
          <ho-level-radio
            class="flex-1"
            name="impact"
            native-value="VeryHigh"
            :checked="impact.toLowerCase() == 'veryhigh'"
            :disabled="isValidated"
            @change="setEdited"
            v-model="impact">Very High</ho-level-radio>
        </div>
      </div>

      <!-- Description -->
      <div class="mt-6">
        <span class="text-base">{{ $t('text.description') }}</span>
        <vue-pell-editor
          ref="description"
          v-if="!isValidated"
          @change="setEdited"
          class="mt-2 pb-2 bg-white rounded-lg shadow overflow-hidden"
          :placeholder="$t('text.findingDescription')"
          :actions="[
            'bold',
            'italic',
            'underline',
          ]"
          v-model="detailedDescription">
        </vue-pell-editor>
        <div v-else class="mt-6 pb-2" v-html="detailedDescription"></div>
      </div>

      <footer class="block fixed inset-x-0 bottom-0 h-12 z-10 lg:inset-auto lg:bottom-0 lg:right-0 lg:mr-8 lg:mb-5 lg:w-3/6 lg:text-right" v-if="!hideFooter">
        <button
          type="submit"
          class="h-full w-full text-white bg-green px-4 py-1 shadow-md lg:w-auto lg:h-auto lg:py-2 lg:px-4 lg:rounded-lg"
          :class="isValidated || !findingTitle || pendingRequest ? 'opacity-50 cursor-not-allowed': ''"
          :disabled="isValidated || !findingTitle || pendingRequest">{{ $t('text.validate') }}</button>
      </footer>
    </form>

    <!-- Attachment -->
    <div class="block mt-6 text-darkblue">
      <div class="lg:flex lg:items-center">
        <span class="text-base lg:align-middle">{{ $t('text.attachments') }}</span>
        <div v-if="!isValidated" class="lg:ml-4 lg:inline-block">
          <input
            class="hidden"
            id="attachment"
            name="attachment"
            type="file"
            accept="*/*"
            @change="handleNewAttachment">
          <label
            class="flex outline-none cursor-pointer justify-center items-center py-1 px-4 block text-center w-full font-semibold rounded-full"
            for="attachment">
            <ma-icon class="mx-0" icon="document" iconset="ActivityFindings"></ma-icon>
            {{ $t('text.attachmentUpload') }}
          </label>
        </div>
      </div>
      <section class="mt-6">
        <div
          class="attachement flex relative h-12 flex mt-3 bg-white shadow-md rounded-lg cursor-pointer xl:hover:bg-lightgrey select-none"
          :class="attachment.selected ? 'to-delete' : ''"
          v-for="(attachment) in attachments"
          :key="`attachment-${attachment.id || attachment.externalId}`">
          <div class="hidden pl-6 lg:flex flex-col justify-center">
            <ma-checkbox
              @click.native="selectItem(attachment.id)"
              :value="attachment.selected"
              :disabled="selectedRecommendation > 0 || isValidated"
              v-model="attachment.selected"></ma-checkbox>
          </div>
          <div class="w-full flex px-6 py-3 lg:pl-0 flex items-center overflow-hidden" @click="openFile(attachment)"
            v-touch:disableClick="true"
            v-touch:start="longtapHandler(attachment.id, 'attachments')"
            v-touch:end="handleScrollEnd"
            v-touch:moved="handleScroll"
          >
            <ma-icon class="-ml-1 icon-width" :icon="attachmentIcon(attachment.name)" iconset="ActivityFindings"></ma-icon>
            <h1 class="inline-block font-semibold truncate">{{ attachment.name }}</h1>
            <span class="flex-1"></span>
            <ma-icon class="icon-width -ml-1 pl-2" :icon="attachment.uploaded === 'true' ? 'cloud-done' : 'cloud-upload'" iconset="ActivityFindings"></ma-icon>
          </div>
        </div>
      </section>
    </div>

    <!-- Recommendation -->
    <form @submit.prevent="openRecommendation" class="right-icon relative mt-10">
      <ma-input class="mt-8" :label="$t('text.recommendation')" v-model="newRecommendation" :disabled="isValidated"></ma-input>
      <button
        class="inpt-btn outline-none absolute flex justify-center items-center w-8 h-8 rounded-full bg-green text-white"
        :class="isValidated ? 'opacity-50 cursor-not-allowed': ''"
        :disabled="isValidated"
        type="submit"><ma-icon icon="add" iconset="ActivityFindings"></ma-icon></button>
    </form>
    <section class="mt-6">
      <div class="recommendation relative h-20 flex mt-3 bg-white shadow-md rounded-lg cursor-pointer xl:hover:bg-lightgrey select-none"
        v-for="(recommendation, idx) in computedRecommendation" :key="`reco-${recommendation.id || recommendation.externalId}`"
        :class="recommendation.selected ? 'to-delete' : ''">
        <div class="hidden pl-6 lg:flex flex-col justify-center">
          <ma-checkbox
            @click.native="selectItem(recommendation.id)"
            :value="recommendation.selected"
            :disabled="selectedAttachment > 0 || isValidated"
            v-model="recommendation.selected"></ma-checkbox>
        </div>
        <div class="w-full px-6 lg:pl-0 py-3 flex items-center overflow-hidden" @click="editRecommendation(recommendation, idx)"
          v-touch:disableClick="true"
          v-touch:start="longtapHandler(recommendation.id, 'recommendation')"
          v-touch:end="handleScrollEnd"
          v-touch:moved="handleScroll">
          <div class="flex flex-col justify-center h-full flex-1 truncate">
            <h1 class="font-semibold">{{ recommendation.name }}</h1>
            <p class="description text-xs text-gray-700 truncate overflow-hidden" v-html=" recommendation.details"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Create new recommendation -->
    <modal
      name="createRecommendation"
      classes="absolute bottom-0 top-auto bg-white"
      width="100%"
      height="70%"
      @before-close="clearRecommendation">
      <section class="relative flex flex-col mb-4 h-full"
        v-touch:swipe="swipeHandler"
        v-touch:swipeTolerance="100">
        <div class="flex justify-center items-center cursor-pointer"><span class="block bg-gray-500 rounded-full w-8 h-1 my-1"></span></div>
        <header class="px-3 py-4 flex justify-between bg-white">
          <span class="text-xl">{{ $t('text.newRecommendation') }}</span>
          <button class="outline-none" @click="$modal.hide('createRecommendation')"><ma-icon icon="clear" iconset="ActivityFindings"></ma-icon></button>
        </header>
        <main class="flex-1 pt-2 px-6 h-auto overflow-auto">
          <form @submit.prevent="handleNewRecommendation">
            <ma-input label="Recommendation" v-model="newRecommendation"></ma-input>
            <div class="mt-6">
              <span class="text-base">{{ $t('text.description') }}</span>
              <vue-pell-editor
                v-if="!isValidated"
                @change="setEdited"
                class="pb-2 bg-white rounded-lg shadow overflow-hidden"
                :placeholder="$t('text.recommendationDescription')"
                :actions="[
                  'bold',
                  'italic',
                  'underline',
                ]"
                v-model="newRecommendationDescription">
              </vue-pell-editor>
              <div v-else class="mt-6 pb-2" v-html="newRecommendationDescription"></div>
            </div>
            <button class="mdl-btn fixed bg-darkblue text-white px-5 py-3 rounded-lg shadow-md" :disabled="!isRecoValid">{{ $t('text.add') }}</button>
          </form>
        </main>
      </section>
    </modal>

    <!-- Edit recommendation -->
    <modal
      name="editRecommendation"
      classes="absolute bottom-0 top-auto bg-white"
      width="100%"
      height="70%"
      @before-open="setRecommendation"
      @before-close="clearRecommendation">
      <section class="relative flex flex-col mb-4 h-full"
        v-touch:swipe="swipeHandler"
        v-touch:swipeTolerance="100">
        <div class="flex justify-center items-center cursor-pointer"><span class="block bg-gray-500 rounded-full w-8 h-1 my-1"></span></div>
        <header class="px-3 py-4 flex justify-between bg-white">
          <span class="text-xl">{{ $t('text.editRecommendation') }}</span>
          <button class="outline-none" @click="$modal.hide('editRecommendation')"><ma-icon icon="clear" iconset="ActivityFindings"></ma-icon></button>
        </header>
        <main class="flex-1 pt-2 px-6 h-auto overflow-auto">
          <form @submit.prevent="handleEditRecommendation">
            <ma-input label="Recommendation" v-model="newRecommendation" :disabled="isValidated"></ma-input>
            <div class="mt-6">
              <span class="text-base">{{ $t('text.description') }}</span>
              <vue-pell-editor
                  v-if="!isValidated"
                  @change="setEdited"
                  class="mtpb-2 bg-white rounded-lg shadow overflow-hidden"
                  :placeholder="$t('text.recommendationDescription')"
                  :actions="[
                    'bold',
                    'italic',
                    'underline',
                  ]"
                  v-model="newRecommendationDescription">
                </vue-pell-editor>
                <div v-else class="mt-6 pb-2" v-html="newRecommendationDescription"></div>
            </div>
            <button class="mdl-btn fixed bg-darkblue text-white px-5 py-3 rounded-lg shadow-md" :disabled="!isRecoValid">{{ $t('text.validate') }}</button>
          </form>
        </main>
      </section>
    </modal>

    <!-- Confirm delete -->
    <modal name="confirmDelete" classes="bg-transparent flex justify-center" width="75%" height="25%">
      <section class="relative h-full px-6 py-6 bg-white rounded-lg w-full lg:w-1/3">
        <header><h1 class="text-darkblue font-semibold text-lg">{{ $tc('text.deleteRecommendationConfirm', selectedRecommendation, { count: selectedRecommendation}) }}</h1></header>
        <footer class="absolute bottom-0 inset-x-0 pb-6 pr-6 mt-6 flex justify-end">
          <button class="w-20 text-center mr-3 font-semibold text-gray-700 rounded-lg bg-gray-400 px-3 py-2 outline-none" @click="$modal.hide('confirmDelete')">{{ $t('text.cancel') }}</button>
          <button class="w-20 text-center font-semibold text-white rounded-lg bg-darkblue px-3 py-2 outline-none" @click="deleteRecommendation">{{ $t('text.ok') }}</button>
        </footer>
      </section>
    </modal>

    <!-- Confirm delete attachment -->
    <modal name="confirmDeleteAttachment" classes="bg-transparent flex justify-center" width="75%" height="25%">
      <section class="relative h-full px-6 py-6 bg-white rounded-lg w-full lg:w-1/3">
        <header>
          <h1 class="text-darkblue font-semibold text-lg">{{ $tc('text.deleteAttachmentConfirm', selectedAttachment, { count: selectedAttachment}) }}</h1>
        </header>
        <footer class="absolute bottom-0 inset-x-0 pb-6 pr-6 mt-6 flex justify-end">
          <button class="w-20 text-center mr-3 font-semibold text-gray-700 rounded-lg bg-gray-400 px-3 py-2 outline-none" @click="$modal.hide('confirmDeleteAttachment')">{{ $t('text.cancel') }}</button>
          <button class="w-20 text-center font-semibold text-white rounded-lg bg-darkblue px-3 py-2 outline-none" @click="deleteAttachment">{{ $t('text.ok') }}</button>
        </footer>
      </section>
    </modal>

    <ma-iconset iconset="ActivityFindings">
      <g id="add"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></g>
      <g id="clear"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
      <g id="upload"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"></path></g>
      <g id="camera"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path></g>
      <g id="camcorder"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8 12.5v-9l6 4.5-6 4.5z"></path></g>
      <!-- clippy! -->
      <g id="document"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"></path></g>
      <g id="delete"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></g>
      <g id="cloud-done"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z"></path></g>
      <g id="cloud-upload"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path></g>
    </ma-iconset>
  </section>
</template>

<script>
import { mapState } from 'vuex';
import MaInput from '@/components/form/input/text/ma-input.vue';
import HoLevelRadio from '@/components/form/input/radio/ho-level-radio.vue';
import MaCheckbox from '@/components/form/input/checkbox/ma-checkbox.vue';
import MaIcon from '@/components/icon/ma-icon.vue';
import MaIconset from '@/components/icon/ma-iconset.vue';
import longtpSelection from '@/mixin/longtapSelection.js';
import activityStatus from '@/mixin/activityStatus.js';
import pell from '@/mixin/pell.js';
import displayModal from '@/mixin/displayModal.js';
import { createId } from '@/api/api.js';

export default {
  name: 'ActivityFindings',
  components: {
    MaInput,
    HoLevelRadio,
    MaCheckbox,
    MaIcon,
    MaIconset
  },
  mixins: [ longtpSelection, activityStatus, pell, displayModal ],
  created() {
    this.$store.dispatch('clearFinding');
  },
  async mounted() {
    if (this.$route.name == 'ActivityFindingsEdit') {
      if (this.$route.params.finding) {
        await this.$store.dispatch('getFinding', {
          activityId: this.$route.params.activityId,
          findingId: this.$route.params.finding,
          external: this.$route.query.external
        });
      }
    } else {
      await this.$store.dispatch('getActivity', this.$route.params.activityId);
      const finding = this.$route.query['finding'];
      this.findingTitle = finding;
      if (this.findingTitle) this.setEdited();
    }

    this.$store.dispatch('hideSpinner');
    this.hideButtonOnFucus();
  },
  data() {
    return {
      leaveResonse: {},
      impacts: window.config.impacts,
      findingTitle: '',
      impact: 'medium',
      detailedDescription: '',
      attachments: [],
      attachmentsToUpload: [],
      recommendationId: '',
      newRecommendation: '',
      newRecommendationDescription: '',
      tempRecommendation: [],
      isFullHeight: false,
      pendingRequest: false
    };
  },
  computed: {
    ...mapState({ finding: state => state.audit.finding }),
    ...mapState({ activity: state => state.audit.activity }),
    computedRecommendation() {
      return this.tempRecommendation;
    },
    isRecoValid() {
      return this.newRecommendation && !this.isValidated;
    },
    selectedRecommendation() {
      return this.tempRecommendation.filter(recommendation => recommendation.selected).length;
    },
    selectedAttachment() {
      return this.attachments.filter(attachment => attachment.selected).length;
    }
  },
  methods: {
    modalAction({ detail }) {
      if (detail === "save") {
        this.handleSubmitFinding();
      }
    },
    setEdited() {
      this.$store.dispatch('setPreventLeave', true);
    },
    swipeHandler(direction) {
      if (direction === 'top') {
        this.isFullHeight = true;
      }
      if (direction === 'bottom') {
        this.isFullHeight = false;
      }
    },
    updateSelected(idx, entity) {
      const isRecommendationSelected = this.tempRecommendation.filter(recommendation => recommendation.selected).length;
      const isAttachmentSelected = this.attachments.filter(attachment => attachment.selected).length;

      // As we can't select both, attachments and recommendations, we need to check
      // If one or another is already selected, and disable selection for the other
      if (entity == 'attachments' && isRecommendationSelected <= 0) {
        const index = this.attachments.map(attachment => attachment.id).indexOf(idx);
        if (!this.attachments[index]) return;
        this.attachments[index].selected = !this.attachments[index].selected;
      }
      if (entity == 'recommendation' && isAttachmentSelected <= 0) {
        const index = this.tempRecommendation.map(recommendation => recommendation.id).indexOf(idx);
        if (!this.tempRecommendation[index]) return;
        this.tempRecommendation[index].selected = !this.tempRecommendation[index].selected;
      }
    },
    clearSelected() {
      this.tempRecommendation = this.tempRecommendation.map(recommendation => {
        recommendation.selected = false;
        return recommendation;
      });
      this.attachments = this.attachments.map(attachment => {
        attachment.selected = false;
        return attachment;
      });
    },
    async deleteRecommendation() {
      // FIXME : delete when just created, we don't have the created ID yet
      const ids = this.tempRecommendation
        .filter(recommendation => recommendation.selected)
        .map(recommendation => recommendation.externalId ? recommendation.externalId : recommendation.id);

      this.tempRecommendation = this.tempRecommendation.filter(recommendation => {
        const id = recommendation.externalId ? recommendation.externalId : recommendation.id;
        if (ids.indexOf(id) >= 0) return false;
        return true;
      });
      this.$modal.hide('confirmDelete');
      this.$store.dispatch('displaySnackbar', { text: this.$tc('text.recommendationDeleted', ids.length, { count: ids.length }) });
      const data = await this.$store.dispatch('deleteRecommendation', ids);
      if (data !== false && !data.errors) {
        return this.$store.commit('setDeleteMode', false);
      }
    },
    async deleteAttachment() {
      const ids = this.attachments
        .filter(attachment => attachment.selected)
        .map(attachment => attachment.externalId ? attachment.externalId : attachment.id);

      this.attachments = this.attachments.filter(attachment => {
        const id = attachment.externalId ? attachment.externalId : attachment.id;
        if (ids.indexOf(id) >= 0) return false;
        return true;
      });
      this.$modal.hide('confirmDeleteAttachment');
      const data = await this.$store.dispatch('deleteAttachment', ids);
      this.$store.commit('setDeleteMode', false);
      if (data !== false && !data.errors) {
        this.$store.dispatch('displaySnackbar', { text: this.$tc('text.attachmentDeleted', ids.length, { count: ids.length }) });
      }
    },
    attachmentIcon(mime) {
      const fileType = mime ? mime.split('.').pop().toLowerCase() : '';
      switch (fileType) {
        case 'jpeg':
        case 'gif':
        case 'png':
          return 'camera';
        case '3gpp':
        case '3gpp2':
        case 'mp4':
          return 'camcorder';
        default:
          return 'document';
      }
    },
    openRecommendation() {
      if (this.isValidated) return;
      this.$modal.show('createRecommendation');
    },
    async openFile(attachment) {
      this.selectable = false;
      if (attachment.uploaded == 'false') return;
      const file = await this.$store.dispatch('downloadFile', attachment);
      const linkSource = URL.createObjectURL(file);
      const downloadLink = document.createElement("a");
      const fileName = attachment.name;

      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    },
    getImpact() { return this.impacts.find(impact => impact.replace(' ', '').toLowerCase() == this.impact.replace(' ', '').toLowerCase()); },
    clearRecommendation() {
      this.recommendationId = '';
      this.newRecommendation = '';
      this.newRecommendationDescription = '';
    },
    setRecommendation({ params }) {
      this.recommendationId = params.idx;
      this.newRecommendation = params.recommendation.name;
      this.newRecommendationDescription = params.recommendation.details;
    },
    editRecommendation(recommendation, idx) {
      this.selectable = false;
      this.$modal.show('editRecommendation', { recommendation, idx });
    },
    /**
     * handleSubmitFinding
     */
    async handleSubmitFinding() {
      if (!this.findingTitle) return false;
      const findingUpdated = this.$t('text.findingUpdated');
      const findingCreated = this.$t('text.findingCreated');

      this.pendingRequest = true;
      const activityId = this.$route.params.activityId;
      const impact = this.getImpact();

      const isExternalId = !!this.finding.externalId;
      const finding = {
        ...this.finding,
        ...(!isExternalId ? { externalId: createId() } : {}),
        name: this.findingTitle,
        detailedDescription: this.detailedDescription.trim(),
        findingImpact: impact,
        recommendation: this.tempRecommendation,
        attachments: this.attachments,
        auditActivity: {
          id: activityId
        }
      };
      // Edit case
      if (this.$route.name == 'ActivityFindingsEdit') {
        const data = await this.$store.dispatch('updateFinding', [ finding ]);
        if (data !== false && !data.errors) {
          this.pendingRequest = false;
          // Locally store recommendation, and sync them when fiding creation completed
          // Cannot redirect to the finding edit page, cause no finding ID
          return this.updateSuccess(findingUpdated);
        }
      } else {
        finding.id = `${Date.now()}`;
        const data = await this.$store.dispatch('createFinding', [ finding ]);
        if (data !== false && !data.errors) {
          this.pendingRequest = false;
          // Locally store recommendation, and sync them when fiding creation completed
          // Cannot redirect to the finding edit page, cause no finding ID
          return this.creationSuccess(findingCreated);
        }
      }
      this.pendingRequest = false;
      this.$store.dispatch('displaySnackbar', { text: this.$t('notification.error.errorOccurred') });
    },
    /**
     * handleNewRecommendation
     */
    async handleNewRecommendation() {
      if (!this.newRecommendation) return;
      const recommendation = {
        id: `${Date.now()}`,
        externalId: createId(),
        name: this.newRecommendation,
        details: this.newRecommendationDescription,
        selected: false,
        synced: 'false',
        toDelete: 'false'
      };
      if (this.$route.name == 'ActivityFindingsEdit') {
        recommendation['finding'] = {
          id: this.finding.id
        }
      }
      this.tempRecommendation.push(recommendation);
      this.setEdited();
      this.$modal.hide('createRecommendation');
    },
    /**
     * handleEditRecommendation
     */
    async handleEditRecommendation() {
      if (!this.newRecommendation) return;
      const currentRecommendation = this.tempRecommendation[this.recommendationId];
      const isExternalId = !!currentRecommendation.externalId;
      const recommendation = {
        ...(!isExternalId ? { externalId: createId() } : {}),
        name: this.newRecommendation,
        details: this.newRecommendationDescription,
        selected: false,
        synced: 'false',
        toDelete: 'false'
      };

      this.setEdited();
      // Edit case
      if (this.recommendationId !== '') {
        this.tempRecommendation[this.recommendationId] = {
          ...this.tempRecommendation[this.recommendationId],
          ...recommendation
        };
      } else {
        this.tempRecommendation.push(recommendation);
      }
      this.$modal.hide('editRecommendation');
    },
    /**
     * handleNewAttachment
     */
    handleNewAttachment(e) {
      this.setEdited();
      const file = e.target.files[0];
      const attachment = {
        id: `${Date.now()}`,
        externalId: createId(),
        key: Date.now(),
        name: file.name,
        file,
        selected: false,
        synced: 'false',
        toDelete: 'false',
        uploaded: 'false'
      };
      // Edit case
      if (this.$route.name == 'ActivityFindingsEdit') {
        attachment['finding'] = {
          id: this.finding.id
        }
      }
      this.attachments.push(attachment);
    },
    creationSuccess(text) {
      // Reset the page leave prevention
      this.$store.dispatch('setPreventLeave', false);
      this.clearRecommendation();
      this.$modal.hide('createRecommendation');
      this.$router.push({ name: 'ActivityDetail', query: { tab: 'findings' } });
      // Need to cache the i18n error, if the current view is unmounted
      // i18n plugin is unregistered, so we can't access the translation
      try {
        this.$store.dispatch('displaySnackbar', { text: this.$t('text.findingCreated') });
      } catch (error) {
        this.$store.dispatch('displaySnackbar', { text });
      }
    },
    updateSuccess(text) {
      // Reset the page leave prevention
      this.$store.dispatch('setPreventLeave', false);
      this.clearRecommendation();
      this.$modal.hide('createRecommendation');
      // Need to cache the i18n error, if the current view is unmounted
      // i18n plugin is unregistered, so we can't access the translation
      try {
        this.$store.dispatch('displaySnackbar', { text: this.$t('text.findingUpdated') });
      } catch (error) {
        this.$store.dispatch('displaySnackbar', { text });
      }
    }
  },
  watch: {
    finding: function() {
      if (this.$route.name == 'ActivityFindingsEdit' && this.finding) {
        this.findingTitle = this.finding.name;
        this.detailedDescription = this.finding.detailedDescription;
        this.impact = this.finding.findingImpact || '';
        // To asign a Vue observer on new object property
        this.tempRecommendation =  this.finding && this.finding.recommendation ?
          this.finding.recommendation.map(reco => Object.assign({}, reco, { key: Date.now(), selected: false })) :
          [];
        this.attachments = this.finding && this.finding.businessDocument_ReferredtoDocument ?
          this.finding.businessDocument_ReferredtoDocument.map(attachment => Object.assign({}, attachment, { key: Date.now(), selected: false, file: attachment.file || {} })) :
          [];
      }
    }
  }
};
</script>

<style scoped>
.inpt-btn {
  bottom: 0.25rem;
  right: 0.75rem;
}
.mdl-btn {
  bottom: 1.5rem;
  right: 1.5rem;
  transition: background-color 0.3s ease;
}
.mdl-btn:disabled {
  @apply bg-gray-500 !important;
}
.create-btn {
  top: 2.8rem;
  right: 1.5rem;
  z-index: 20;
}

.recommendation {
  transition: background-color 0.3s ease;
}
.recommendation.to-delete {
  @apply bg-lightgrey !important;
}
.attachement {
  transition: background-color 0.3s ease;
}
.attachement.to-delete {
  @apply bg-lightgrey !important;
}

[id="attachment"] ~ label {
  @apply text-white bg-magenta !important;
}
.icon-width {
  min-width: 32px !important;
}
</style>
<style>
  p.description div, p.description p {
    @apply inline mr-1 truncate overflow-hidden !important;
  }
.v--modal-box { transition: height 0.3s ease; }
.full-modal .v--modal-box {
  height: 100% !important;
}
</style>