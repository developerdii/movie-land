import Vue from 'vue'
import Vuex from 'vuex'
import router from "@/router";

Vue.use(Vuex)

export default new Vuex.Store({
    state: {},
    mutations: {
        routeToClicked(state, data) {
            console.log(data)
            router.push(`${data.path}/${data.query}`)
        }
    },
    actions: {},
    modules: {}
})