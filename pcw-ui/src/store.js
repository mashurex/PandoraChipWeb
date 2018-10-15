import Vue from 'vue';
import Vuex from 'vuex';
import { client } from '@/axios';

Vue.use(Vuex);

const set = prop => (state, val) => {
  state[prop] = val;
};

const get = propName => state => {
  return state[propName];
};

function getStation (nameOrTitle, stations, defaultVal) {
  if (!nameOrTitle || !stations || !stations.length) {
    return null;
  }

  const found = stations.find(s => {
    return s.name === nameOrTitle || s.title === nameOrTitle;
  });

  return found || defaultVal;
}

export default new Vuex.Store({
  state: {
    socket: {
      isConnected: false,
      message: '',
      reconnectError: false
    },
    isCurrentlyPlaying: true,
    isCurrentlyPaused: false,
    systemStatus: {
      isRunning: false
    },
    currentStation: {
      name: 'station0',
      title: 'Everything Radio'
    },
    songDetails: {
      artist: 'Sam & Dave',
      title: 'Dock Of The Bay',
      album: 'Greatest Hits',
      liked: false,
      coverArt:
        'http://mediaserver-cont-dc6-1-v4v6.pandora.com/images/public/rovi/albumart/4/2/5/3/5034504213524_500W_500H.jpg'
    },
    songHistory: [],
    stations: []
  },
  getters: {
    isCurrentlyPlaying: get('isCurrentlyPlaying'),
    isCurrentlyPaused: get('isCurrentlyPaused'),
    isRunning: state => {
      return state.systemStatus.isRunning;
    },
    songDetails: get('songDetails'),
    currentStation: get('currentStation'),
    songHistory: get('songHistory'),
    stations: get('stations'),
    socketIsConnected: state => {
      return state.socket.isConnected === true;
    },
    socketHasConnectionError: state => {
      return state.socket.reconnectError === true;
    }
  },
  mutations: {
    currentStation: set('currentStation'),
    songDetails: set('songDetails'),
    isCurrentlyPlaying: set('isCurrentlyPlaying'),
    isCurrentlyPaused: set('isCurrentlyPaused'),
    toggleRunning (state) {
      state.systemStatus.isRunning = !state.systemStatus.isRunning;
    },
    toggleSongLike (state) {
      state.songDetails.liked = !state.songDetails.liked;
    },
    addSongToHistory (state, song) {
      const prv = JSON.parse(JSON.stringify(state.songHistory || []));
      prv.push(song);
      state.songHistory = prv;
    },
    SOCKET_ONOPEN (state, event) {
      Vue.prototype.$socket = event.currentTarget;
      state.socket.isConnected = true;
      console.log('OnOpen', { ...JSON.parse(JSON.stringify(event)) });
      Vue.prototype.$socket.sendObj({ event: 'current-status' });
    },
    SOCKET_ONCLOSE (state, event) {
      state.socket.isConnected = false;
      console.log('OnClose', { ...JSON.parse(JSON.stringify(event)) });
    },
    SOCKET_ONERROR (state, event) {
      console.error(state, event);
    },
    // default handler called for all methods
    SOCKET_ONMESSAGE (state, message) {
      const msg = JSON.parse(JSON.stringify(message));
      console.log('ws message', { ...message });
      if (msg.hasOwnProperty('running')) {
        state.systemStatus.isRunning = !!msg.running;
      }

      if (msg.hasOwnProperty('stations') && msg.stations.length) {
        if (state.stations.length !== msg.stations.length) {
          console.log('Updating stations');
          state.stations = JSON.parse(JSON.stringify(msg.stations));
        }
      }

      if (msg.stats) {
        const stats = JSON.parse(JSON.stringify(message.stats));

        const currentSong = {
          artist: stats.artist,
          title: stats.title,
          album: stats.album,
          coverArt: stats.coverArt,
          liked: false
        };

        const station = stats.station;

        const playing = !stats.paused && !stats.stopped;

        const prvTitle = state.songDetails.title || '';
        if (currentSong.title !== prvTitle) {
          const prvSong = JSON.parse(JSON.stringify(state.songDetails));

          console.log('Updating current song', {
            prv: { ...prvSong },
            crnt: { ...currentSong }
          });

          const prvHistory = JSON.parse(JSON.stringify(state.songHistory));
          prvHistory.push(prvSong);
          state.songHistory = prvHistory;
          state.songDetails = currentSong;
        }
        state.currentStation = getStation(station, state.stations, { name: 'stationX', title: station });
        state.isCurrentlyPlaying = playing;
        state.isCurrentlyPaused = !!stats.paused;
      }
    },
    // mutations for reconnect methods
    SOCKET_RECONNECT (state, count) {
      console.log('Recconect', { count });
    },
    SOCKET_RECONNECT_ERROR (state) {
      state.socket.reconnectError = true;
    }
  },
  actions: {
    triggerPlay ({ commit, state }) {
      return new Promise(resolve => {
        const message = {
          event: 'pause-toggle'
        };

        if (!state.systemStatus.isRunning) {
          message.event = 'start';
        }

        console.log('Trigger Play', { ...message });
        Vue.prototype.$socket.sendObj(message);
        commit('isCurrentlyPlaying', true);
        resolve(true);
      });
    },
    triggerPause ({ commit, state }) {
      return new Promise(resolve => {
        const message = {
          event: 'pause-toggle'
        };

        if (state.systemStatus.isRunning && state.isCurrentlyPlaying) {
          console.log('Trigger Pause', { ...message });
          Vue.prototype.$socket.sendObj(message);
          commit('isCurrentlyPlaying', false);
          resolve(true);
        } else {
          console.log('Skipping Pause Trigger', {
            isCurrentlyPaused: state.isCurrentlyPaused,
            isCurrentlyPlaying: state.isCurrentlyPlaying,
            isRunning: state.systemStatus.isRunning
          });
          resolve(false);
        }
      });
    },
    triggerNext ({ state }) {
      return new Promise(resolve => {
        if (state.systemStatus.isRunning) {
          console.log('Trigger Skip');
          Vue.prototype.$socket.sendObj({ event: 'skip' });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },
    triggerLike ({ state, commit }) {
      return new Promise(resolve => {
        if (state.systemStatus.isRunning) {
          console.log('Toggle Song Like');
          Vue.prototype.$socket.sendObj({ event: 'like' });
          commit('toggleSongLike');
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },
    triggerBan ({ state }) {
      return new Promise(resolve => {
        if (state.systemStatus.isRunning) {
          console.log('Trigger Ban');
          Vue.prototype.$socket.sendObj({ event: 'ban' });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },
    togglePower ({ state, commit }) {
      return new Promise((resolve, reject) => {
        try {
          if (state.systemStatus.isRunning) {
            Vue.prototype.$socket.sendObj({ event: 'stop' });
          } else {
            Vue.prototype.$socket.sendObj({ event: 'start' });
          }
          commit('toggleRunning');
          resolve(true);
        } catch (err) {
          reject(err);
        }
      });
    },
    currentStatus ({ getters }) {
      return new Promise(resolve => {
        if (getters.socketIsConnected) {
          console.log('Requesting Current Status');
          Vue.prototype.$socket.sendObj({ event: 'current-status' });
          resolve(true);
        } else {
          resolve(false);
        }
      });
    },
    stationChange ({ commit, state }, station) {
      return new Promise((resolve, reject) => {
        if (!station || station.name === state.currentStation.name) {
          return resolve(false);
        } else {
          try {
            console.log(`Changing station from '${state.currentStation.name}' to '${station.name}'`);
            Vue.prototype.$socket.sendObj({ event: 'change-station', stationName: station.name });
            commit('currentStation', JSON.parse(JSON.stringify(station)));
            return resolve(true);
          } catch (ex) {
            console.error('Error changin station: ' + ex.message, ex);
            return reject(ex);
          }
        }
      });
    },
    refreshStats ({ commit, state }) {
      return new Promise((resolve, reject) => {
        client
          .get('/api/stats')
          .then(res => {
            const stats = res.data.stats;
            console.log('Stats', { ...stats });
            const currentSong = {
              artist: stats.artist,
              title: stats.title,
              album: stats.album,
              coverArt: stats.coverArt
            };

            const station = stats.station;

            const playing = !stats.paused && !stats.stopped;
            if (playing || !!stats.paused) {
              if (
                !state.songDetails ||
                state.songDetails.title !== currentSong.title
              ) {
                commit('songDetails', currentSong);
                commit('isCurrentlyPlaying', playing);
                commit('isCurrentlyPaused', !!stats.paused);
              }
            } else {
              commit('isCurrentlyPlaying', false);
              commit('isCurrentlyPaused', false);
              commit('songDetails', null);
            }

            if (station && state.currentStation) {
              if (state.currentStation.name !== station) {
                commit('currentStation', { name: station, index: 0 });
              }
            } else if (station) {
              commit('currentStation', { name: station, index: 0 });
            }

            resolve(stats);
          })
          .catch(err => {
            console.error('Error retrieving stats: ' + err.message, err);
            reject(err);
          });
      });
    }
  }
});
