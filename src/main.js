import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import moment from "moment";
import axios from 'axios'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css';

Vue.config.productionTip = false

Vue.use(moment)

NProgress.configure({ parent: '#app' });
NProgress.configure({ showSpinner: false });

axios.interceptors.request.use(config => {
  NProgress.start()
  return config
})

axios.interceptors.response.use(response => {
  NProgress.done()
  return response
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
