<template>
<div id="ui-song-details" class="song-details-container">
    <template  v-if="isCurrentlyPlaying || isCurrentlyPaused">
        <b-row>
            <b-col>
                <img class="cover-art img-fluid" :src="imgSrc" />
            </b-col>
        </b-row>
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
                <h1>...</h1>
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
    ...mapGetters(['isCurrentlyPlaying', 'isCurrentlyPaused', 'songDetails']),
    imgSrc () {
      if (this.songDetails.coverArt) {
        return this.songDetails.coverArt;
      } else {
        return '/assets/placeholder.png';
      }
    }
  },
  data () {
    return {};
  }
};
</script>
