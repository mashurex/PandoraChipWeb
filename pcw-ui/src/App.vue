<template>
  <div id="app" class="container-fluid">
    <header id="ui-app-header">
        <h1>Pandora Chip Web</h1>
    </header>
    <section id="ui-app-section">
        <router-view/>
    </section>
    <footer id="ui-app-footer">
        <station-picker />
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
export default {
  components: {
    StationPicker
  }
};
</script>
