<template>
  <section class="ActivityDetail pb-16">
    <header class="flex bg-white tabs">
      <span
        class="w-1/2 text-center py-4 bg-darkblue text-white cursor-pointer select-none"
        :class="selectedTab ? 'selected' : ''"
        @click="handleTabs('details')"
      >{{ $t('text.details')}}</span>
      <span
        class="w-1/2 text-center py-4 bg-darkblue text-white cursor-pointer select-none"
        :class="$route.query.tab == 'findings' ? 'selected' : ''"
        @click="handleTabs('findings')"
      >{{ $t('text.findings')}}</span>
    </header>
    <header
      v-if="deleteMode && selectedActivities > 0"
      class="flex justify-between bg-white text-darkblue absolute top-0 inset-x-0 shadow-header overflow-hidden z-20 h-20"
    >
      <div class="flex justify-center items-center p-3">
        <transition name="rotate">
          <button class="text-darkblue outline-none" ref="openButton" @click="clearSelected">
            <ma-icon icon="arrow-back" iconset="outlet"></ma-icon>
          </button>
        </transition>
        <span
          class="text-lg"
        >{{ $tc('text.finding', selectedActivities, { finding: selectedActivities}) }}</span>
      </div>
      <div class="flex justify-center items-center pr-4">
        <button class="outline-none" @click="$modal.show('confirmDelete')">
          <ma-icon icon="delete" iconset="calendarSet"></ma-icon>
        </button>
      </div>
    </header>
    <main class="px-3 mt-12">
      <!-- Activity detail tab -->
      <div v-if="selectedTab" class="w-full lg:w-3/6 lg:mx-auto">
        <div class="flex justify-between items-center">
          <span class="text-sm w-1/3">{{ $t('text.planning') }}</span>
          <div class="w-2/3 flex justify-start items-center">
            <div class="relative flex items-center w-1/2 mr-3">
              <datepicker
                class="ho-datepicker left"
                :monday-first="true"
                :disabled="isValidated"
                v-model="activityData.beginDate"
                :disabled-dates="computedDisabledDateFrom"
                @selected="setEdited"
              >
                <div slot="beforeCalendarHeader" class="px-3 py-2 text-right">
                  <span
                    class="hover:underline cursor-pointer"
                    @click="activityData.beginDate = null"
                  >{{ $t('text.clear') }}</span>
                </div>
                <div slot="afterDateInput" class="material relative block w-full">
                  <label :class="activityData.beginDate ? 'active' : ''">{{ $t('text.start') }}</label>
                  <span class="bar"></span>
                </div>
              </datepicker>
            </div>
            <div class="relative flex items-center w-1/2">
              <datepicker
                class="ho-datepicker right"
                :monday-first="true"
                :disabled="isValidated"
                v-model="activityData.endDate"
                :disabled-dates="computedDisabledDateTo"
                @selected="setEdited"
              >
                <div slot="beforeCalendarHeader" class="px-3 py-2 text-right">
                  <span
                    class="hover:underline cursor-pointer"
                    @click="activityData.endDate = null"
                  >{{ $t('text.clear') }}</span>
                </div>
                <div slot="afterDateInput" class="material relative block w-full">
                  <label :class="activityData.endDate ? 'active' : ''">{{ $t('text.end') }}</label>
                  <span class="bar"></span>
                </div>
              </datepicker>
            </div>
          </div>
        </div>
        <div class="mt-12 flex justify-between items-center">
          <span class="text-sm w-1/3">{{ $t('text.workload') }}</span>
          <div class="w-2/3 flex justify-start items-center">
            <ma-input
              class="w-1/2 lg:w-1/4 mr-3"
              :label="$t('text.estimated')"
              type="number"
              step="1"
              :disabled="isValidated"
              v-model="activityData.estimatedWorkloadHours"
              @blur="setEdited"
            ></ma-input>
            <ma-input
              class="w-1/2 lg:w-1/4"
              :label="$t('text.effective')"
              type="number"
              step="1"
              :disabled="isValidated"
              v-model="activityData.effectiveWorkload"
              @blur="setEdited"
            ></ma-input>
          </div>
        </div>
        <div class="mt-12">
          <span class="text-base">{{ $t('text.description') }}</span>
          <vue-pell-editor
            ref="description"
            v-if="!isValidated"
            class="pb-2 mt-2 bg-white rounded-lg shadow overflow-hidden"
            :placeholder="$t('text.description')"
            :defaultParagraphSeparator="''"
            :actions="[
              'bold',
              'italic',
              'underline',
            ]"
            v-model="activityData.detailedDescription"
            @change="setEdited"
          ></vue-pell-editor>
          <div v-else>
            <div v-html="activityData.detailedDescription"></div>
          </div>
        </div>
        <transition name="fade">
          <footer
            v-if="!hideFooter && (!isValidated || activityData.activityStatus === 'localyvalidated')"
            class="absolute bottom-0 h-16 inset-x-0 lg:relative lg:w-6/6 flex justify-between items-center lg:justify-start lg:mt-6 mx-4"
          >
            <button
              v-if="!isValidated"
              class="block acty-btn h-12 text-white bg-darkblue outline-none w-1/2 lg:w-auto h-auto py-2 px-4 rounded-lg"
              @click="completeActivity"
              :class="isValidated ? 'opacity-50 cursor-not-allowed': ''"
            >{{ $t('text.completeActivity') }}</button>
            <button
              v-else
              class="block acty-btn h-12 text-white bg-darkblue outline-none w-1/2 lg:w-auto h-auto py-2 px-4 rounded-lg"
              @click="reopenActivity"
            >{{ $t('text.reopenActivity') }}</button>
            <button
              class="block acty-btn h-12 text-white bg-secondary-green outline-none w-1/2 lg:w-auto h-auto py-2 px-4 ml-4 rounded-lg"
              :class="isValidated || disabledSaveActivityBtn ? 'opacity-50 cursor-not-allowed': ''"
              @click="handleSaveActivity"
              :disabled="isValidated || disabledSaveActivityBtn"
            >{{ $t('text.validate') }}</button>
          </footer>
        </transition>
      </div>
      <!-- Activity finding tab -->
      <div v-else class="w-full">
        <form @submit.prevent="handleNewFinding" class="relative">
          <ma-input
            class="text-base right-icon"
            label="Findings"
            v-model="newFinding"
            :disabled="isValidated"
          ></ma-input>
          <button
            class="inpt-btn outline-none absolute flex justify-center items-center w-8 h-8 rounded-full bg-green text-white"
            :class="isValidated ? 'opacity-50 cursor-not-allowed': ''"
            :disabled="isValidated"
            type="submit"
          >
            <ma-icon icon="add" iconset="calendarSet"></ma-icon>
          </button>
        </form>
        <section class="findings mt-12">
          <div
            class="finding relative h-20 flex mt-3 bg-white shadow-md rounded-lg cursor-pointer xl:hover:bg-lightgrey select-none"
            :class="finding.selected ? 'to-delete' : ''"
            v-for="(finding) in findingData"
            :key="`finding-${finding.id}`"
          >
            <div class="hidden pl-6 lg:flex flex-col justify-center">
              <ma-checkbox
                :disabled="isValidated"
                :value="finding.selected"
                @click.native="selectItem(finding.id)"
                v-model="finding.selected"
              ></ma-checkbox>
            </div>
            <router-link
              class="w-full px-6 lg:pl-0 py-3 flex items-center overflow-hidden"
              :to="{
                name: 'ActivityFindingsEdit',
                params: { id: $route.params.id, finding: finding.externalId || finding.id },
                ...(finding.externalId ? { query: { external: true } } : {})
              }" 
              v-touch:start="longtapHandler(finding.id, 'finding')"
              v-touch:end="handleScrollEnd"
              v-touch:moved="handleScroll"
            >
              <div class="flex flex-col justify-center h-full flex-1 truncate">
                <h3 class="text-sm font-semibold truncate">{{ finding.name }}</h3>
                <p
                  class="description text-xs text-gray-700 truncate overflow-hidden"
                  v-html="finding.detailedDescription"
                ></p>
              </div>
              <div class="flex flex-col justify-center">
                <div class="flex">
                  <div
                    v-if="finding.recommendation && finding.recommendation.length"
                    class="px-4 py-1 flex justify-center items-center text-xs badge text-white bg-green font-semibold rounded-full"
                  >{{ finding.recommendation.length }} {{ $tc('text.recommendationLabel', finding.recommendation.length) }}</div>
                  <ma-icon
                    v-if="finding.businessDocument_ReferredtoDocument.length > 0"
                    class="-mr-2"
                    icon="document"
                    iconset="calendarSet"
                  ></ma-icon>
                </div>
              </div>
            </router-link>
          </div>
          <section class="text-center w-1/3 m-auto" v-if="findingData && !findingData.length">
            <img class="mb-3" src="@/assets/img/nodata.svg" alt="No findings" />
            {{ $t('text.noFinding') }}
          </section>
        </section>
      </div>
    </main>

    <modal
      name="confirmDelete"
      classes="bg-transparent flex justify-center"
      width="75%"
      height="20%"
    >
      <section class="relative h-full px-6 py-6 bg-white rounded-lg w-full lg:w-1/3">
        <header>
          <h1
            class="text-darkblue font-semibold text-lg"
          >{{ $tc('text.deleteFindingConfirm', selectedActivities, { count: selectedActivities}) }}</h1>
        </header>
        <footer class="absolute bottom-0 inset-x-0 pb-6 pr-6 mt-6 flex justify-end">
          <button
            class="w-20 text-center mr-3 font-semibold text-gray-700 rounded-lg bg-gray-400 px-3 py-2 outline-none"
            @click="$modal.hide('confirmDelete')"
          >{{ $t('text.cancel') }}</button>
          <button
            class="w-20 text-center font-semibold text-white rounded-lg bg-darkblue px-3 py-2 outline-none"
            @click="deleteFinging"
          >{{ $t('text.ok') }}</button>
        </footer>
      </section>
    </modal>

    <ma-iconset iconset="calendarSet">
      <g id="event">
        <path
          d="M7 9.9c0 .5-.4.9-.9.9s-.9-.4-.9-.9.4-.9.9-.9.9.4.9.9zm7.7 0c0-.5-.4-.9-.9-.9s-.9.4-.9.9.4.9.9.9.9-.4.9-.9zm3.9 0c0-.5-.4-.9-.9-.9s-.9.4-.9.9.4.9.9.9.9-.4.9-.9zM7 13.8c0-.5-.4-.9-.9-.9s-.9.4-.9.9.4.9.9.9.9-.5.9-.9zm-.9 2.9c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9zm4.7-6.8c0-.5-.4-.9-.9-.9s-.8.4-.8.9.4.9.9.9.8-.4.8-.9zm0 3.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9.4.9.9.9.9-.5.9-.9zm-.9 2.9c-.5 0-.9.4-.9.9s.4.9.9.9.9-.4.9-.9-.4-.9-.9-.9zm13.4 1.2c0 3-2.4 5.4-5.4 5.4s-5.4-2.4-5.4-5.4 2.4-5.4 5.4-5.4 5.4 2.5 5.4 5.4zm-1.8 0c0-2-1.6-3.6-3.6-3.6s-3.6 1.6-3.6 3.6 1.6 3.6 3.6 3.6 3.6-1.6 3.6-3.6zm-2.3-.9h-.4v-.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v1.8c0 .5.4.9.9.9h1.3c.5 0 .9-.4.9-.9s-.4-.9-.9-.9zm.5-14.7h-1.2v-.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v.9h-4v-.9c0-.5-.4-.9-.9-.9s-.8.4-.8.9v.9H7v-.9c0-.5-.4-.9-.9-.9s-.9.4-.9.9v.9H4.1C2.1 2.3.5 3.9.5 5.9v13.9c0 2 1.6 3.6 3.6 3.6h6.8c.5 0 .9-.4.9-.9s-.4-.9-.9-.9H4.1c-1 0-1.8-.8-1.8-1.8V5.9c0-1 .8-1.8 1.8-1.8h1.1V5c0 .5.4.9.9.9S7 5.5 7 5v-.9h4V5c0 .5.4.9.9.9s.9-.4.9-.9v-.9h4V5c0 .5.4.9.9.9s.9-.4.9-.9v-.9h1.2c1 0 1.8.8 1.8 1.8V11c0 .5.4.9.9.9s.9-.4.9-.9V5.9c-.1-2-1.7-3.6-3.7-3.6z"
        ></path>
      </g>
      <g id="add">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
      </g>
      <g id="attach-file">
        <path
          d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
        ></path>
      </g>
      <g id="delete">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
      </g>
      <g id="document">
        <path
          d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"
        ></path>
      </g>
    </ma-iconset>
  </section>
</template>

<script>
import { mapState } from "vuex";
import MaInput from "@/components/form/input/text/ma-input.vue";
import MaCheckbox from "@/components/form/input/checkbox/ma-checkbox.vue";
import Datepicker from "vuejs-datepicker";
import MaIcon from "@/components/icon/ma-icon.vue";
import MaIconset from "@/components/icon/ma-iconset.vue";
import longtpSelection from "@/mixin/longtapSelection.js";
import activityStatus from "@/mixin/activityStatus.js";
import pell from "@/mixin/pell.js";
import displayModal from "@/mixin/displayModal.js";

export default {
  name: "ActivityDetail",
  components: {
    MaInput,
    MaCheckbox,
    Datepicker,
    MaIcon,
    MaIconset
  },
  mixins: [ longtpSelection, activityStatus, pell, displayModal ],
  async mounted() {
    this.$store.dispatch("showSpinner");
    const activityId = this.$route.params.activityId;
    await this.$store.dispatch("getActivity", activityId);

    this.$store.dispatch("setOutletTitle", this.activity.name);
    this.$store.dispatch("hideSpinner");

    this.hideButtonOnFucus();
  },
  data() {
    return {
      disabledSaveActivityBtn: false,
      disabledActivityStateBtn: false,
      activityData: {},
      tabs: "details",
      newFinding: "",
      findingData: []
    };
  },
  computed: {
    ...mapState({ activity: state => state.audit.activity }),
    ...mapState({ deleteMode: state => state.audit.deleteMode }),
    computedDisabledDateFrom() {
      if (!this.activityData.endDate) return {};
      return {
        from: new Date(this.activityData.endDate)
      };
    },
    computedDisabledDateTo() {
      const epoch = 8640000;
      return {
        to: new Date(new Date(this.activityData.beginDate).getTime() - epoch)
      };
    },
    selectedTab() {
      return (
        this.$route.query.tab === "details" ||
        typeof this.$route.query.tab === "undefined"
      );
    },
    selectedActivities() {
      return this.findingData.filter(activity => activity.selected).length;
    }
  },
  methods: {
    setEdited() {
      this.$store.dispatch('setPreventLeave', true);
    },
    modalAction({ detail }) {
      if (detail === "save") {
        this.handleSaveActivity();
      }
    },
    async handleSaveActivity(toast = true) {
      if (this.disabledSaveActivityBtn) return;
      this.disabledSaveActivityBtn = true;
      const data = await this.$store.dispatch("editActivity", [ this.activityData ]);
      if (data !== false && toast) {
        this.$store.dispatch("displaySnackbar", {
          text: this.$t("text.activityUpdated")
        });
      }
      this.disabledSaveActivityBtn = false;
    },
    handleNewFinding() {
      this.$router.push({
        name: "ActivityFindingsCreate",
        query: { finding: this.newFinding }
      });
    },
    handleTabs(tab) {
      if (this.$route.query.tab === tab) return;
      this.$router.replace({ query: { ...this.$route.query, tab: tab } });
      this.$store.dispatch("hideSpinner");
    },
    updateSelected(idx, entity) {
      if (entity !== "finding") return;
      const index = this.findingData.map(activity => activity.id).indexOf(idx);
      if (!this.findingData[index]) return;
      this.findingData[index].selected = !this.findingData[index].selected;
    },
    clearSelected() {
      this.findingData = this.findingData.map(activity => {
        activity.selected = false;
        return activity;
      });
    },
    async deleteFinging() {
      const ids = this.findingData
        .filter(finding => finding.selected)
        .map(finding => (finding.externalId ? finding.externalId : finding.id));
      this.findingData = this.findingData.filter(finding => {
        const id = finding.externalId ? finding.externalId : finding.id;
        if (ids.indexOf(id) >= 0) return false;
        return true;
      });
      this.$modal.hide("confirmDelete");
      const data = await this.$store.dispatch("deleteFinding", {
        ids: ids,
        activityId: this.activity.id
      });
      this.$store.commit("setDeleteMode", false);
      if (data !== false && !data.errors) {
        return this.$store.dispatch("displaySnackbar", {
          text: this.$tc("text.findingDeleted", ids.length, {
            count: ids.length
          })
        });
      }
    },
    async reopenActivity() {
      const activityId = this.$route.params.activityId;
      this.$store.commit("reopenActivity", activityId);
      this.$store.dispatch("displaySnackbar", {
        text: this.$t("text.activityReopened")
      });
    },
    async completeActivity() {
      const activityId = this.$route.params.activityId;
      const { finding_ActivityFinding, ...activity } = this.activity;
      this.$store.commit("closeActivity", activity);
      this.$store.dispatch("displaySnackbar", {
        text: this.$t("text.activityClosed")
      });
    }
  },
  watch: {
    activity: function() {
      this.activityData = this.activity;
    },
    "activity.finding_ActivityFinding": function() {
      if (this.activity && !this.activity.finding_ActivityFinding) return;
      this.findingData = this.activity.finding_ActivityFinding
        .map(finding => {
          // To asign a Vue observer on new object property
          return Object.assign({}, finding, { selected: false });
        })
        .filter(finding => finding.toDelete && finding.toDelete !== "true");
    },
    "$route.query.tab": function() {
      if (this.activity.id) {
        this.$store.dispatch("hideSpinner");
        this.$store.dispatch("setOutletTitle", this.activity.name);
      }
    }
  }
};
</script>

<style scoped>
.selected {
  @apply bg-green !important;
}
.badge {
  min-width: 6rem;
}
.ma-textarea {
  max-height: 200px;
  overflow: auto;
}
.inpt-btn {
  bottom: 0.25rem;
  right: 0.75rem;
}
.finding {
  transition: background-color 0.3s ease;
}
.finding.to-delete {
  @apply bg-lightgrey !important;
}
.acty-btn {
  min-width: 10rem;
}
</style>
<style>
p.description div {
  @apply inline mr-1 truncate overflow-hidden !important;
}
.left .vdp-datepicker__calendar {
  left: 0;
  transform: translateX(-15%);
}
.right .vdp-datepicker__calendar {
  right: 0;
  transform: translateX(0%);
}
</style>
<style src="@/assets/styles/datepicker.css"></style>