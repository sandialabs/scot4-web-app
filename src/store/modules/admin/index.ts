import { Module } from 'vuex';
import { getters } from './getters';
import { actions } from './actions'
import { mutations } from './mutations'
import { RootState } from '@/store/types';
import { AdminTabState, DialogState } from './types';

export const state: AdminTabState = {
    users: [],
    roles: [],
    authMethods: [],
    storageProviders: [],
    dialog: DialogState.Hidden,
    selectedUser: null,
    selectedRole: null,
    selectedAuthMethod: null,
    adminRoleIds: [],
    selectedStorageProvider: null,
    idToDelete: 0,
    authHelp: {},
    storageProviderHelp:{}
};

const namespaced: boolean = true;

export const admin: Module<AdminTabState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations
};