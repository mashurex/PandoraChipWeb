<template>
<div id="ui-player-controls" class="player-controls">
    <b-btn variant="primary" title="Like" :disabled="isCurrentlyStopped || hasAlreadyLiked" @click.prevent.stop="like"><fa-icon icon="thumbs-up"></fa-icon></b-btn>
    <b-btn variant="primary" title="Ban" :disabled="isCurrentlyStopped" @click.prevent.stop="ban"><fa-icon icon="thumbs-down"></fa-icon></b-btn>
    <b-btn variant="primary" title="Pause" v-show="isCurrentlyPlaying" @click.prevent.stop="pause"><fa-icon icon="pause"></fa-icon></b-btn>
    <b-btn variant="primary" title="Play" v-show="!isCurrentlyPlaying" @click.prevent.stop="play"><fa-icon icon="play"></fa-icon></b-btn>
    <b-btn variant="primary" title="Skip" :disabled="isCurrentlyStopped" @click.prevent.stop="skip"><fa-icon icon="fast-forward"></fa-icon></b-btn>
</div>
</template>
<style lang="scss">
.player-controls {
  button.btn:not(:first-child) {
    margin-left: 10px;
  }
}
</style>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'playerControls',
  computed: {
    ...mapGetters(['isCurrentlyPlaying', 'isCurrentlyPaused', 'songDetails']),
    isCurrentlyStopped () {
      return !this.isCurrentlyPlaying && !this.isCurrentlyPaused;
    },
    hasAlreadyLiked () {
      return this.songDetails && this.songDetails.liked === true;
    }
  },
  data () {
    return {};
  },
  methods: {
    pause () {
      this.$store.dispatch('triggerPause');
    },
    play () {
      this.$store.dispatch('triggerPlay');
    },
    like () {
      if (this.isCurrentlyPlaying) {
        this.$store.dispatch('triggerLike');
      }
    },
    ban () {
      if (this.isCurrentlyPlaying) {
        this.$store.dispatch('triggerBan');
      }
    },
    skip () {
      if (this.isCurrentlyPlaying) {
        this.$store.dispatch('triggerNext');
      }
    }
  }
};
</script>
