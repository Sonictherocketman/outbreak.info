<template>
  <div class="">
    <!-- loading -->
    <div v-if="loading" class="loader">
      <i class="fas fa-spinner fa-pulse fa-4x text-highlight"></i>
    </div>

    <!-- header -->
    <section
      class="d-flex justify-content-center align-items-center bg-main__darker text-light py-3"
    >
      <div class="row m-0 w-100">
        <div class="col-sm-12 m-auto">
          <h4>COVID-19 and SARS-CoV-2 datasets, analyses, and resources</h4>
        </div>
      </div>
    </section>

    <section class="d-flex py-2">
      <div class="row m-0 w-100">
        <!-- search bar -->
        <div class="col-sm-12 col-md-8">
          <div class="py-3">
            <form
              autocomplete="off"
              class="m-auto"
              @submit.prevent="onEnter"
              @input.prevent="debounceSearchText"
            >
              <div class="input-group">
                <div class="input-group-prepend">
                  <span
                    class="input-group-text bg-grey text-muted border-0"
                    id="sb"
                    ><i class="fas fa-search"></i
                  ></span>
                </div>
                <input
                  id="sBar"
                  class="form-control border"
                  placeholder="Search"
                  aria-label="search"
                  aria-describedby="sb"
                  type="text"
                  v-model="searchInput"
                />
              </div>
            </form>
          </div>
        </div>

        <!-- sidebar: links -->
        <div
          class="col-sm-12 col-md-4 d-flex justify-content-center align-items-center flex-column"
        >
          <router-link class="btn btn-main mb-2" :to="{ name: 'Contributing' }"
            ><i class="fas fa-bolt"></i> subscribe to updates</router-link
          >
          <router-link :to="{ name: 'Sources' }"
            >Where do we get our data?</router-link
          >
          <router-link :to="{ name: 'Contributing' }"
            >Contributing a source</router-link
          >
        </div>

        <!-- what's new -->
        <div class="col-sm-12">
          <div
            class="text-highlight d-flex justify-content-between align-items-center mb-2"
          >
            <h5>WHAT'S NEW</h5>
          </div>

          <table id="whats-new">
            <tbody>
              <tr v-for="(item, idx) in newData" :key="idx" class="new-item">
                <td class="resource-type d-flex align-items-center">
                  <router-link
                    :to="{ name: 'Resource Page', params: { id: item._id } }"
                    class="no-underline m-0"
                    :class="item['@type']"
                  >
                    <StripeAccent :className="item['@type']" />

                    {{ item["@type"] }}
                  </router-link>
                </td>
                <td class="resource-name text-left" valign="top">
                  <router-link
                    :to="{ name: 'Resource Page', params: { id: item._id } }"
                    class="no-underline m-0 text-dark"
                  >
                    {{ item.name }}
                  </router-link>
                </td>
                <td
                  class="resource-affiliation text-left text-muted"
                  valign="top"
                >
                  <template v-if="item.author">
                    {{
                      item.author[0].name
                        ? item.author[0].name
                        : item.author[0].givenName +
                          " " +
                          item.author[0].familyName
                    }}
                    <span v-if="item.author.length > 1"> et al.</span>
                  </template>
                  <template v-else-if="item.creator">
                    {{
                      item.creator[0].name
                        ? item.creator[0].name
                        : item.creator[0].givenName +
                          " " +
                          item.creator[0].familyName
                    }}
                    <span v-if="item.creator.length > 1"> et al.</span>
                  </template>
                </td>
                <td class="resource-date" valign="top">
                  {{ format(item.date) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- mini-nav for resource types -->
    <section class="d-flex justify-content-end py-2 bg-sec">
      <div class="row d-flex justify-content-center w-100">
        <nav class="navbar navbar-expand-lg navbar-dark">
          <ul class="navbar-nav">
            <li
              class="nav-item text-light"
              v-for="(resource, idx) in resourceTypes"
              :key="idx"
            >
              <router-link
                class="nav-link no-underline p-0"
                :to="{
                  name: 'Resources',
                  query: { filter: '@type:' + resource.id }
                }"
              >
                {{ resource.label }}
              </router-link>
            </li>
          </ul>
        </nav>
      </div>
    </section>

    <!-- RESULTS -->
    <section class="d-flex justify-content-end py-2">
      <div class="row m-0">
        <!-- FILTERS -->
        <div class="col-sm-2 p-0">
          <button
            @click="clearFilters"
            class="w-100 m-0 mb-1"
            v-if="filterString"
          >
            <small>clear filters</small>
          </button>
          <div
            class="border-bottom border-secondary alert-secondary p-1 mb-4"
            v-for="(facet, idx) in facetSummary"
            :key="idx"
          >
            <!-- Toggle Header -->
            <div class="row m-0">
              <div class="col-sm-10 p-1 uppercase">
                <h6>{{ facet.variable }}</h6>
              </div>
              <div
                class="col-sm-2 text-center p-1 pointer"
                v-if="facet.filtered.length"
                @click="facet.expanded = !facet.expanded"
              >
                <!-- toggle fa class up->down -->
                <i class="fas fa-chevron-up" v-if="facet.expanded"></i>
                <i class="fas fa-chevron-down" v-if="!facet.expanded"></i>
              </div>
            </div>
            <!-- Toggle content -->
            <form v-if="facet.filtered.length && facet.expanded">
              <div>
                <!-- Filter search -->
                <form
                  class="p-1 bg-light"
                  @submit.prevent="selectFilterText(facet, idx)"
                  @input.prevent="debounceFilterText(facet, idx)"
                >
                  <input
                    type="text"
                    autocomplete="off"
                    class="border border-secondary p-1 w-100 font-awesome"
                    :placeholder="`Search ${facet.variable}`"
                    v-model="facetFilters[idx]"
                  />
                </form>
                <!-- Filters -->
                <ul class="list-group rounded-0">
                  <div v-for="(option, optIdx) in facet.filtered" :key="optIdx">
                    <li
                      class="rounded-0 text-left list-group-item-action p-1"
                      :class="[
                        option.checked
                          ? 'list-group-item-info'
                          : 'list-group-item'
                      ]"
                      v-if="optIdx < facet.num2Display"
                    >
                      <input
                        type="checkbox"
                        class="mr-1"
                        name="item"
                        :id="facet.id + optIdx"
                        :value="option.term"
                        :checked="option.checked"
                        @change="selectFilter(facet.id, option)"
                      />
                      <label :for="facet.id + optIdx" class="m-0">
                        <small>{{ option.term }} ({{ option.count }})</small>
                      </label>
                    </li>
                  </div>
                </ul>
                <small
                  class="pointer link"
                  @click="facet.num2Display += 5"
                  v-if="facet.num2Display < facet.total"
                  >show more</small
                >
              </div>
            </form>
            <div class="bg-light" v-else>
              <small>none</small>
            </div>
          </div>
        </div>

        <div class="col-sm-9 pl-5" id="results">
          <!-- results header + sort options -->
          <div
            class="row w-100 d-flex justify-content-between align-items-center"
            id="selectors"
          >
            <div class="d-flex flex-column">
              <div class="d-flex align-items-center">
                <h4 class="m-0 mr-4" v-if="search">
                  You searched for {{ search }}
                </h4>
                <div class="m-0 text-highlight">
                  {{ numResults }} {{ numResults == 1 ? "result" : "results" }}
                </div>
              </div>
              <small class="text-muted text-left" v-if="filterString">
                filtered by {{ filterString }}
              </small>
              <button @click="clearFilters" v-if="filterString">
                <small>clear filters</small>
              </button>

              <div
                class="pagination mt-2 d-flex align-items-center justify-content-between w-100 m-auto"
              >
                <button
                  aria-label="previous-button"
                  class="pagination-btn pagination-left"
                  :class="{ disabled: selectedPage === 0 }"
                  @click="changePage(-1)"
                >
                  <font-awesome-icon :icon="['fas', 'arrow-left']" />
                </button>
                <small
                  >viewing results {{ lowerLim + 1 }} &minus; {{ upperLim }} of
                  {{ numResults }}</small
                >
                <button
                  aria-label="next-button"
                  class="pagination-btn pagination-left"
                  :class="{ disabled: selectedPage === lastPage }"
                  @click="changePage(1)"
                >
                  <font-awesome-icon :icon="['fas', 'arrow-right']" />
                </button>
              </div>
            </div>

            <select
              v-model="numPerPage"
              @change="changePageNum()"
              class="select-dropdown"
            >
              <option v-for="option in pageOpts" :value="option" :key="option">
                {{ option }} results
              </option>
            </select>

            <select v-model="sortValue" @change="changeSort">
              <option value="-datePublished">
                date: newest to oldest
              </option>
              <option value="datePublished">
                date: oldest to newest
              </option>
              <option value="name.keyword">
                A-Z
              </option>
              <option value="-name.keyword">
                Z-A
              </option>
            </select>
          </div>

          <!-- Results: loop -->
          <div id="results-container" class="my-3">
            <div
              class="row w-100 d-flex flex-column text-left p-2 search-result"
              v-for="(item, idx) in data"
              :key="idx"
            >
              <div class="d-flex w-100 align-items-center">
                <StripeAccent :className="item['@type']" />
                <small :class="[item['@type'], 'resource-type', 'mr-3']">{{
                  item["@type"]
                }}</small>
                <router-link
                  :to="{ name: 'Resource Page', params: { id: item._id } }"
                >
                  <h5 class="m-0">{{ item.name }}</h5>
                </router-link>
              </div>

              <div class="row">
                <!-- LEFT -->
                <div class="col-sm-5 text-muted">
                  <!-- authors -->
                  <div class="attribution text-body">
                    <small v-if="item.author">
                      {{
                        item.author[0].name
                          ? item.author[0].name
                          : item.author[0].givenName +
                            " " +
                            item.author[0].familyName
                      }}
                      <span v-if="item.author.length > 1"> et al.</span>
                    </small>
                    <small v-else-if="item.creator">
                      {{
                        item.creator[0].name
                          ? item.creator[0].name
                          : item.creator[0].givenName +
                            " " +
                            item.creator[0].familyName
                      }}
                      <span v-if="item.creator.length > 1"> et al.</span>
                    </small>
                  </div>
                  <!-- publication name -->
                  <div class="publication">
                    <small v-if="item.journalNameAbbrev">{{
                      item.journalNameAbbrev
                    }}</small>
                    <small v-else-if="item.journalName">{{
                      item.journalName
                    }}</small>
                  </div>
                  <!-- dates -->
                  <div class="dates">
                    <small
                      v-if="
                        item.dateModified ||
                          item.dateCreated ||
                          item.datePublished
                      "
                    >
                      <i class="far fa-clock"></i>
                      <span v-if="item.dateModified">
                        updated {{ item.dateModified }}
                      </span>
                      <span v-if="item.dateModified && item.datePublished"
                        >&bull;</span
                      >
                      <span v-if="item.datePublished">
                        published {{ item.datePublished }}
                      </span>
                      <span
                        v-if="
                          (item.dateModified && item.dateCreated) ||
                            (item.datePublished && item.dateCreated)
                        "
                        >&bull;</span
                      >
                      <span v-if="item.dateCreated">
                        created {{ item.dateCreated }}
                      </span>
                    </small>
                  </div>
                  <!-- CLINCIAL-TRIAL-SPECIFIC  -->

                  <!-- clinical trial phase -->
                  <div v-if="item.studyDesign && item.studyDesign.phaseNumber">
                    <TrialPhase :phases="item.studyDesign.phaseNumber" />
                  </div>

                  <!-- clinical trial status -->
                  <div v-if="item.studyStatus">
                    <TrialStatus
                      :status="item.studyStatus"
                      :locations="item.studyLocation"
                    />
                  </div>

                  <!-- relatedTo -->
                  <router-link to="search" v-if="item['@type'] == 'Dataset'">
                    <small>find analyses/publications that use this data</small>
                  </router-link>
                  <div
                    v-if="item.isBasedOn && item.isBasedOn.length"
                    class="px-1 bg-grey__lightest"
                  >
                    based on |
                    <router-link
                      to="search"
                      v-for="(resource, idx) in item.isBasedOn"
                      :key="idx"
                    >
                      {{ resource["@type"] }}
                    </router-link>
                  </div>
                  <router-link to="search" v-if="item.relatedTo">
                    <small>related resources</small>
                  </router-link>
                </div>

                <!-- RIGHT     -->
                <div class="col-sm-7 text-muted">
                  <!-- CLINCIAL-TRIAL-SPECIFIC  -->
                  <div v-if="item.studyDesign || item.armGroup">
                    <TrialType
                      :design="item.studyDesign"
                      :arms="item.armGroup"
                    />
                  </div>

                  <!-- clinical trial phase -->
                  <!-- <div v-if="item.studyDesign && item.studyDesign.phaseNumber">
                    <TrialPhase :phases="item.studyDesign.phaseNumber"/>
                    </div> -->

                  <template v-if="item.descriptionExpanded">
                    <span v-html="item.longDescription"></span>
                    <span>
                      <a
                        class="show-more"
                        v-if="item.descriptionTooLong"
                        href="#"
                        @click.prevent="expandDescription(item)"
                        >(show less)</a
                      >
                    </span>
                  </template>
                  <template v-else>
                    <span v-html="item.shortDescription"></span>
                    <span v-if="item.descriptionTooLong"
                      >...
                      <a
                        class="show-more"
                        href="#"
                        @click.prevent="expandDescription(item)"
                        >(show more)</a
                      ></span
                    >
                  </template>
                </div>

                <!-- Bottom -->
                <div class="col-sm-12 d-flex flex-wrap keyword-container mt-2">
                  <small
                    class="keyword px-2 py-1 mb-1 mr-1"
                    v-for="(keyword, idx) in item.keywords"
                    :key="idx"
                    :data-tippy-info="`search ${keyword}`"
                  >
                    <router-link
                      :to="{
                        name: 'Resources',
                        query: { search: `&quot;${keyword}&quot;` }
                      }"
                      class="no-underline text-dark"
                    >
                      {{ keyword }}
                    </router-link>
                  </small>
                </div>
              </div>

              <div class="row text-right" v-if="item.curatedBy">
                <div class="col-sm-12" :class="item['@type']">
                  <small>provided by {{ item.curatedBy.name }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <br />
    <div
      class="pagination mt-2 d-flex align-items-center justify-content-between w-50 m-auto"
    >
      <button
        aria-label="previous-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: selectedPage === 0 }"
        @click="changePage(-1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <small
        >viewing results {{ lowerLim + 1 }} &minus; {{ upperLim }} of
        {{ numResults }}</small
      >
      <button
        aria-label="next-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: selectedPage === lastPage }"
        @click="changePage(1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
    </div>
  </div>
</template>

<script>
import { timeFormat, timeParse } from "d3";

import StripeAccent from "@/components/StripeAccent.vue";
import TrialPhase from "@/components/TrialPhase.vue";
import TrialStatus from "@/components/TrialStatus.vue";
import TrialType from "@/components/TrialType.vue";
import { mapState } from "vuex";

import { getResources } from "@/api/resources.js";

import tippy from "tippy.js";
import "tippy.js/themes/light.css";

// --- font awesome --
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import { debounce, cloneDeep } from "lodash";

library.add(faArrowLeft, faArrowRight);

export default {
  name: "Resources",
  props: {
    search: String,
    sort: String,
    page: String,
    size: String,
    filter: String
  },
  components: {
    StripeAccent,
    TrialPhase,
    TrialStatus,
    TrialType,
    FontAwesomeIcon
  },
  created: function() {
    this.debounceFilterText = debounce(this.selectFilterText, 500);
    this.debounceSearchText = debounce(this.onEnter, 500);
  },
  methods: {
    getResults() {
      this.resultsSubscription = getResources(
        this.$resourceurl,
        this.searchInput,
        this.filterString,
        this.sortValue,
        this.numPerPage,
        this.selectedPage * this.numPerPage
      ).subscribe(results => {
        console.log(results);
        this.data = results.results;
        this.newData = results.recent;
        this.facetSummary = results.facets;
        this.numResults = results.total;

        tippy(".keyword", {
          content: "Loading...",
          maxWidth: "200px",
          placement: "bottom",
          animation: "fade",
          theme: "light",
          onShow(instance) {
            let info = instance.reference.dataset.tippyInfo;
            instance.setContent(info);
          }
        });
      });
    },
    format: function(dateStr) {
      const parsed = timeParse("%Y-%m-%d")(dateStr);
      return timeFormat("%d %B")(parsed);
    },
    expandDescription: function(item) {
      item.descriptionExpanded = !item.descriptionExpanded;
    },
    selectFilterText(facet, idx) {
      const selectedText = this.facetFilters[idx];
      if (selectedText != "") {
        facet.filtered = facet.counts.filter(d =>
          d.term.toLowerCase().includes(selectedText)
        );
        facet.filtered.forEach(d => (d.checked = true));
      } else {
        facet.filtered = cloneDeep(facet.counts);
        facet.filtered.forEach(d => (d.checked = false));
      }

      this.filterString = this.filters2String();
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: "0",
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    selectFilter: function(facet, option) {
      option.checked = !option.checked;

      this.filterString = this.filters2String();
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: "0",
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    filters2String() {
      const filters = this.facetSummary
        .map(d => {
          return {
            id: d.id,
            vars: d.filtered.filter(d => d.checked)
          };
        })
        .filter(d => d.vars.length);

      const filterArr = filters.map(
        d => `${d.id}:${d.vars.map(x => x.term).join(",")}`
      );

      return filterArr.join(";");
      // return (filters.map(d => `${d.id}:("${d.vars.map(x => x.term).join('" OR "')}")`));
    },
    clearFilters() {
      this.filterString = null;
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: "0",
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    onEnter() {
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: "0",
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    changeSort() {
      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: "0",
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    changePage(step) {
      this.selectedPage += step;

      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: String(this.selectedPage),
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    },
    changePageNum() {
      this.selectedPage = 0;

      this.$router.push({
        path: "resources",
        query: {
          search: this.searchInput,
          filter: this.filterString,
          page: String(this.selectedPage),
          size: String(this.numPerPage),
          sort: this.sortValue
        }
      });
    }
  },
  beforeDestroy() {
    if (this.resultSubscription) {
      this.resultSubscrption.unsubscribe();
    }
  },
  computed: {
    ...mapState("admin", ["loading"]),
    lowerLim: function() {
      return this.selectedPage * this.numPerPage;
    },
    upperLim: function() {
      const upper = this.selectedPage * this.numPerPage + this.numPerPage;
      return upper > this.numResults ? this.numResults : upper;
    },
    lastPage: function() {
      return this.numResults
        ? Math.floor(this.numResults / this.numPerPage)
        : null;
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to, from) {
        this.searchInput = this.search ? this.search : null;
        this.filterString = this.filter ? this.filter : null;
        this.numPerPage = this.size ? Number(this.size) : 10;
        this.selectedPage = this.page ? Number(this.page) : 0;
        this.sortValue = this.sort ? this.sort : "-datePublished";

        this.getResults();
      }
    }
  },
  data() {
    return {
      resultsSubscription: null,
      data: null,
      numResults: 0,
      selectedPage: null,
      searchInput: null,
      filterString: null,
      facetFilters: [],
      sortValue: "-datePublished",
      numPerPage: null,
      pageOpts: [5, 10, 50, 100],
      resourceTypes: [
        {
          //   label: "What's New",
          //   id: "whats-new"
          // }, {
          //   label: "Topics",
          //   id: "topics"
          // }, {
          label: "Publications",
          id: "Publication"
        },
        {
          label: "Analyses",
          id: "Analysis"
        },
        {
          label: "Protocols",
          id: "Protocol"
        },
        {
          label: "Clinical Trials",
          id: "ClinicalTrial"
        },
        {
          label: "Datasets",
          id: "Dataset"
        }
      ],
      new2Display: 3,
      newData: null,
      facetSummary: null
    };
  }
};
</script>

<style lang="scss" scoped>
.nav-item {
  padding-right: 1rem;
  padding-left: 1rem;
}

// table
.resource-type {
  font-size: 1em;
  font-weight: 700;
  text-transform: uppercase;
  opacity: 0.7;
}

td.resource-type {
  min-width: 175px;
}

.resource-date {
  width: 80px;
}

.resource-affiliation {
  // width: 150px;
}

#whats-new td {
  padding-left: 5px;
  padding-right: 5px;
  padding-bottom: 10px;
  font-size: 0.9em;
  line-height: 1em;
}

.filters {
  background: lighten(yellow, 35%);
}

.search-result {
  border-bottom: 3px solid $grey-40;
  padding: 5px;
}

.search-result:nth-child(odd) {
  background-color: $grey-30;
}

.keyword {
  background: lighten($warning-color, 35%);
  border-radius: 5px;
}
.list-group-item.list-group-item-info {
  background-color: $secondary-color !important;
  border-color: $secondary-color !important;
  color: white !important;
}
</style>