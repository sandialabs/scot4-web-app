// index.ts
import Vue from 'vue';
import axios, { AxiosError } from 'axios';
import Vuex, { StoreOptions } from 'vuex';
import { RootState } from '@/store/types';
import { user } from '@/store/modules/user/index'
import { team } from '@/store/modules/team/index'
import { admin } from '@/store/modules/admin/index'

import { IRElements } from '@/store/modules/IRElements/index'


Vue.use(Vuex);

const store: StoreOptions<RootState> = {
    state: {
        version: '1.0.0', // a simple property
        error: false,
        errorText: ''
    },
    mutations: {
        clearError(state) {
            state.error = false
            state.errorText = ""
        },
        errorOccurred(state, payload: AxiosError<any> | Error) {
            if (axios.isAxiosError(payload) && payload.response) {
                state.error = true
                if (payload.response.data.detail) {
                    let detail = payload.response.data.detail
                    if (Array.isArray(detail)) {
                        detail = detail[0]
                    }
                    if (detail.msg) {
                        state.errorText = "Error: " + detail.msg + ": " + detail.loc
                    }
                    else {
                        state.errorText = "Error: " + detail
                    }
                }
                else {
                    state.errorText = payload.response.data
                }
            }
            else if (axios.isAxiosError(payload)) {
                state.error = true
                state.errorText = "Error connecting to server: " + payload.message
            }
            else {
                console.error(payload)
            }
        },
    },
    getters: {
        error(state) { return state.error },
        errorText(state) { return state.errorText }
    },
    modules: {
        user,
        IRElements,
        team,
        admin
    }
};

export default new Vuex.Store<RootState>(store);