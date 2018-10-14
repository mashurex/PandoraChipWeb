<template>
<div id="ui-song-details" class="song-details-container">
    <template  v-if="isRunning">
        <b-row>
            <b-col>
                <div><span class="song-details-title">{{ songDetails.title }}</span></div>
                <div>by <span class="song-details-artist">{{ songDetails.artist }}</span></div>
                <div>on <span class="song-details-album">{{ songDetails.album }}</span></div>
            </b-col>
        </b-row>
    </template>
    <template v-else>
        <b-row>
            <b-col>
                <h5>...</h5>
            </b-col>
        </b-row>
    </template>
</div>
</template>
<style lang="scss">
.song-details-container {
  margin: 10px;
}
</style>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'SongDetails',
  computed: {
    ...mapGetters(['isRunning', 'isCurrentlyPlaying', 'isCurrentlyPaused', 'songDetails'])
  },
  data () {
    return {};
  }
};
</script>
