<template>
<div id="ui-main">
  <b-row>
      <b-col>
          <player-controls />
      </b-col>
  </b-row>
  <b-row>
      <b-col>
          <song-details />
      </b-col>
  </b-row>
</div>
</template>

<script>
// @ is an alias to /src
import PlayerControls from '@/components/PlayerControls.vue';
import SongDetails from '@/components/SongDetails.vue';
export default {
  name: 'Home',
  components: {
    PlayerControls,
    SongDetails
  }
};
</script>
