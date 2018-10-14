<template>
<div id="ui-system-status">
  <a href="#" @click.prevent.stop="togglePower"><fa-icon :icon="powerIcon" :class="powerStyling"/></a>
  <fa-icon :icon="websocketIcon" :class="websocketStyling"/>
</div>
</template>
<style lang="scss">
#ui-system-status {
  *:not(:first-child) {
    margin-left: 10px;
  }
}
</style>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'SystemStatus',
  computed: {
    ...mapGetters(['isRunning', 'socketIsConnected', 'socketHasConnectionError']),
    powerIcon () {
      return this.isRunning ? 'toggle-on' : 'toggle-off';
    },
    websocketIcon () {
      if (!this.socketIsConnected) {
        return this.socketHasConnectionError ? 'phone-slash' : 'exclamation-circle';
      }

      return 'phone';
    },
    powerStyling () {
      return {
        'fa-2x': true,
        'text-danger': !this.isRunning,
        'text-success': this.isRunning
      };
    },
    websocketStyling () {
      return {
        'fa-2x': true,
        'text-danger': this.socketHasConnectionError,
        'text-warning': !this.socketHasConnectionError && !this.socketIsConnected,
        'text-success': this.socketIsConnected
      };
    }
  },
  data () {
    return {};
  },
  methods: {
    togglePower () {

    }
  }
};
</script>
