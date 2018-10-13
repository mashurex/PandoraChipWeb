import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VueNativeSock from 'vue-native-websocket';

import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faThumbsUp,
  faThumbsDown,
  faPause,
  faFastForward,
  faPlay
} from '@fortawesome/free-solid-svg-icons';

import { client } from './axios';
import App from './App.vue';
import router from './router';
import store from './store';

library.add(faThumbsUp, faThumbsDown, faPause, faFastForward, faPlay);

Vue.prototype.$http = client;
Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VueNativeSock, 'ws://localhost:3000', {
  store: store,
  format: 'json',
  recconection: true,
  recconectionAttempts: 5,
  reconnectionDelay: 1500
});

Vue.component('fa-icon', FontAwesomeIcon);

dom.watch();

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

store.dispatch('currentStatus');
