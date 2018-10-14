<template>
<div id="ui-main">
  <b-row class="mt-1">
      <b-col>
          <song-cover />
      </b-col>
  </b-row>
  <b-row class="mt-2">
      <b-col>
          <player-controls />
      </b-col>
  </b-row>
  <b-row class="mt-2">
      <b-col>
          <song-details />
      </b-col>
  </b-row>
</div>
</template>
<script>
import PlayerControls from '@/components/PlayerControls.vue';
import SongDetails from '@/components/SongDetails.vue';
import SongCover from '@/components/SongCover.vue';
export default {
  name: 'Home',
  components: {
    PlayerControls,
    SongDetails,
    SongCover
  }
};
</script>
