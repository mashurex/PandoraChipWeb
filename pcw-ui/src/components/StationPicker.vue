<template>
<div id="ui-station-picker">
  <select id="selected-station" :disabled="!isRunning" v-model="selectedStation">
    <option v-for="s in stations" :key="s.name" :value="s">{{ s.title }}</option>
  </select>
</div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'StationPicker',
  computed: {
    ...mapGetters(['currentStation', 'stations', 'isRunning']),
    selectedStation: {
      get () {
        return this.internallySelectedStation || this.currentStation;
      },
      set (value) {
        this.internallySelectedStation = value;
        this.$store.dispatch('stationChange', value);
      }
    }
  },
  data () {
    return {
      internallySelectedStation: null
    };
  },
  methods: {
    getStation (name) {
      if (typeof name === 'object') {
        return name;
      }

      return this.stations.find(s => {
        return s.name === name;
      });
    }
  }
};
</script>
