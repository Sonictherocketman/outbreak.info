<template>
<div>
  <div v-if="data.studyStatus">
    <TrialStatus :status="data.studyStatus" :includeDate="true" :locations="data.studyLocation" :mapWidth="500" />
  </div>

  <div class="mt-3 mb-2" v-if="locations && locations.length">
    Study Locations
    <ul>
      <li v-for="(location, idx) in locations" :key="idx">
        {{location.key}}
        <ul>
          <li v-for="(subnational, idx2) in location.values" :key="idx2">
            <span class="text-dark font-weight-500">{{subnational.name}}</span>
            <span v-if="subnational.studyLocationCity || subnational.studyLocationState">&nbsp;(</span>
            <span v-if="subnational.studyLocationCity">{{subnational.studyLocationCity}}</span>
            <span v-if="subnational.studyLocationCity && subnational.studyLocationState">,&nbsp;</span>
            <span v-if="subnational.studyLocationState">{{subnational.studyLocationState}}</span>
            <span v-if="subnational.studyLocationCity || subnational.studyLocationState">)</span>
          </li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="mt-3 mb-2">
    Has results: <span class="text-dark">{{data.hasResults ? "yes" : (data.hasResults === false ? "no" : "not specified")}}</span>
  </div>

  <div v-if="data.studyEvent">
    <div class="mt-3 mb-2">
      Study Timeline
    </div>
    <div class="update-container">
      <div class="d-flex mb-4" v-for="(update, idx) in data.studyEvent" :key="idx">
        <span class="update-linker" :class="{'past': update.inPast}"> </span>
        <span class="update-date pl-3" :class="{'past': update.inPast}">
          {{ update.dateStr }}
        </span>
        <div class="d-flex text-left">
          <span class="m-0 mb-1" v-if="update.studyEventDateType">
            <span class="update-type mr-2"> {{ update.studyEventDateType }}</span>
          </span>
          <span v-html="update.studyEventType" class="text-muted"></span>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import {
  timeFormat,
  timeParse, nest
} from "d3";

import TrialStatus from "@/components/TrialStatus.vue";

export default {
  name: "TrialEvents",
  props: {
    data: Object
  },
  components: {
    TrialStatus
  },
  computed: {
    locations() {
      if(this.data.studyLocation) {
        const nested = nest()
        .key(d => d.studyLocationCountry)
        .entries(this.data.studyLocation.slice().sort((a,b) => a.studyLocationCountry < b.studyLocationCountry ? -1 : 1));

        return(nested)
      } else {
        return(null)
      }
    }
  },
  methods: {
    formatDate: function(date) {
      return (timeFormat("%e %B %Y")(date))
    },
    parseDate: function(date) {
      return (timeParse("%Y-%m-%d")(date))
    }
  },
  mounted() {
    const today = new Date();
    if (this.data.studyEvent) {
      this.data.studyEvent.forEach(d => {
        d["date"] = this.parseDate(d.studyEventDate);
        d["dateStr"] = d.date ? this.formatDate(d.date) : d.studyEventDate;
        d["inPast"] = d.date <= today;
      });

      this.data.studyEvent.sort((a, b) => a.date - b.date)
    }
  }
};
</script>

<style lang="scss" scoped>
$circle-width: 8px;
.update-type {
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.5;
    color: $secondary-color;
}

.update-container {
    border-left: 1px solid $grey-40;
}

.update-date {
    opacity: 0.6;
    min-width: 200px;
    position: relative;
    left: 22px;
}

.update-linker {
    position: relative;
}

.update-linker:before {
    background: $grey-40;
    content: "";
    left: 0;
    height: 1px;
    position: absolute;
    top: 0.75em;
    transform: translateY(-50%);
    width: 20px;
    z-index: 1;
}

.update-linker:after {
    content: "";
    display: inline-block;
    width: $circle-width;
    height: $circle-width;
    -moz-border-radius: 7.5px;
    -webkit-border-radius: 7.5px;
    border-radius: 7.5px;
    background: $grey-40;
    position: absolute;
    top: 0.75em;
    transform: translate(22px, -50%);
}

.update-linker.past:after,
.update-linker.past:before {
    background: saturate($clinical-trial-color, 20%);
    opacity: 0.5;
}

.past {
    color: saturate($clinical-trial-color, 20%);
    opacity: 1;
}
</style>
