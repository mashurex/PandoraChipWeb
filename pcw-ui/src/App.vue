<template>
  <div id="app" class="container-fluid">
    <header id="ui-app-header">
      <b-row class="d-none d-lg-block">
        <b-col>
          <h1>Pandora Chip Web</h1>
        </b-col>
        <b-col>
          <system-status />
        </b-col>
      </b-row>
      <b-row class="mt-1">
        <b-col>
          <station-picker />
        </b-col>
      </b-row>
    </header>
    <section id="ui-app-section">
      <b-row>
        <b-col>
          <router-view/>
        </b-col>
      </b-row>
    </section>

    <footer id="ui-app-footer">
    </footer>
  </div>
</template>

<style lang="scss">
#app {
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<script>
import StationPicker from '@/components/StationPicker.vue';
import SystemStatus from '@/components/SystemStatus.vue';
export default {
  components: {
    StationPicker,
    SystemStatus
  }
};
</script>
