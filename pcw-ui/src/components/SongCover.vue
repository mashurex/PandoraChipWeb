<template>
<div id="ui-song-cover" class="song-cover-container">
    <template  v-if="isRunning">
        <b-row>
            <b-col>
                <img class="cover-art img-fluid" :src="imgSrc" />
            </b-col>
        </b-row>
    </template>
    <template v-else>
        <b-row>
            <b-col>
                <img class="cover-art img-fluid" src="@/assets/placeholder.png" />
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
  name: 'SongCover',
  computed: {
    ...mapGetters(['isRunning', 'isCurrentlyPlaying', 'isCurrentlyPaused', 'songDetails']),
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
