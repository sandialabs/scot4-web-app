// profile/mutations.ts
import { MutationTree } from 'vuex';
import { UserState } from './types';
import Vue from 'vue'
export const mutations: MutationTree<UserState> = {
    loginSuccess(state, payload: any) {
        state.loginInProgress = false
        // Manually parse out the expiration time of the token
        // From stackoverflow, the source of all knowledge (https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library)
        const { access_token } = payload
        const base64Url = access_token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        }).join(''))
        const expireDate = new Date(JSON.parse(jsonPayload)['exp'] * 1000)
        Vue.prototype.$storage.setItem('loginExpire', expireDate)
        state.loginExpiration = expireDate
    },

    loginError(state) {
        state.loginInProgress = false;
        state.user = undefined;
        state.token = undefined;
    },

    loginInProgress(state) {
        state.loginInProgress = true;
    },

    userFound(state, user) {
        state.user = user
        Vue.prototype.$storage.getItem('loginExpire').then((stored_expire: Date) => {
            if (stored_expire && stored_expire > state.loginExpiration) {
                state.loginExpiration = stored_expire
            }
        })
    },

    toggleShowQuickSettings(state) {
        state.showQuickSettings = !state.showQuickSettings
    },

    connectToFirehose(state){
        if (state.user != undefined && state.firehose == undefined){
            state.firehose = new EventSource(`${process.env.VUE_APP_API_BASE}/firehose/`, { withCredentials: true } );
        }
    },

    disconnectFromFirehose(state){
        if (state.firehose != undefined){
            state.firehose.close()
        }
        state.firehose = undefined

    },

    updateUserPreferencesSuccess(state, payload: any) {
        if (state.user) {
            Vue.set(state.user, "preferences", payload.preferences)
        }
    },

    updateUserMeSuccess(state, payload: any) {
        state.user = payload
    },

    logoutSuccess(state) {
        state.user = undefined
        Vue.prototype.$storage.removeItem('loginExpire')
    },

    retrieveUserApiKeysSuccess(state, payload: any) {
        state.userApiKeys = payload
    },

    updateApiKeySuccess(state, payload: any) {
        const keyIndex = state.userApiKeys.findIndex((k) => k.key == payload.key)
        state.userApiKeys.splice(keyIndex, 1, payload)
    },

    createApiKeySuccess(state, payload: any) {
        state.userApiKeys.push(payload)
    },

    deleteApiKeySuccess(state, payload: any) {
        const keyIndex = state.userApiKeys.findIndex((k) => k.key == payload.key)
        state.userApiKeys.splice(keyIndex, 1)
    },

    userSearchSuccess(state, payload:any){
        state.searchResults = payload.data
    },

    clearSearchResults(state){
        state.searchResults = undefined
    },



    changeShowSearchOverlay(state, payload:boolean){
        state.showSearchOverlay = payload
    },

    retrieveNotificationsSuccess(state, payload:any){
        if (state.user){
            Vue.set(state.user, "notifications", payload.result)
        }
    }
};