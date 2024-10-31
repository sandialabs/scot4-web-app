import { MutationTree } from 'vuex';
import { AdminTabState, DialogState, User, Role, AuthMethod, StorageProvider } from './types';
import axios, { AxiosError } from 'axios';

export const mutations: MutationTree<AdminTabState> = {
    usersLoaded(state, payload: any) {
        state.users = payload
    },

    rolesLoaded(state, payload: any) {
        state.roles = payload
    },

    authMethodsLoaded(state, payload: any) {
        state.authMethods = payload
    },

    storageProvidersLoaded(state, payload:any){
        state.storageProviders = payload
    },

    authHelpLoaded(state, payload: any) {
        state.authHelp = payload
    },
    storageProviderHelpLoaded(state, payload: any) {
        state.storageProviderHelp = payload
    },
    adminRoleIdsLoaded(state, payload: any) {
        state.adminRoleIds = payload
    },

    userUpdateSuccess(state, payload: User) {
        const user_index = state.users.findIndex((u) => u.id == payload.id)
        state.users.splice(user_index, 1, payload) // Do it this way to maintain reactivity
    },

    userCreateSuccess(state, payload: User) {
        state.users.push(payload)
    },

    userDeleteSuccess(state, user_id) {
        const user_index = state.users.findIndex((u) => u.id == user_id)
        state.users.splice(user_index, 1) // Do it this way to maintain reactivity
    },

    roleUpdateSuccess(state, payload: Role) {
        const role_index = state.roles.findIndex((u) => u.id == payload.id)
        state.roles.splice(role_index, 1, payload) // Do it this way to maintain reactivity
    },

    roleCreateSuccess(state, payload: Role) {
        state.roles.push(payload)
    },

    roleDeleteSuccess(state, role_id) {
        const role_index = state.roles.findIndex((u) => u.id == role_id)
        state.roles.splice(role_index, 1) // Do it this way to maintain reactivity
    },

    roleAssignSuccess(state, { username, role_id, role_name }) {
        const role = state.roles.find((r) => r.id == role_id || r.name == role_name)
        const user = state.users.find((u) => u.username == username)
        if (role && user) {
            user.roles.push(role)
        }
    },

    roleRemoveSuccess(state, { username, role_id, role_name }) {
        const user = state.users.find((u) => u.username == username)
        if (user) {
            user.roles = user.roles.filter((r) => r.id != role_id && r.name != role_name)
        }
    },

    adminGrantSuccess(state, role_id) {
        state.adminRoleIds.push(role_id)
    },

    adminRevokeSuccess(state, role_id) {
        state.adminRoleIds = state.adminRoleIds.filter((id) => id != role_id)
    },

    changeDialog(state, payload: DialogState) {
        state.dialog = payload
    },

    setSelectedUser(state, payload: User) {
        state.selectedUser = Object.assign({}, payload)
    },

    setSelectedRole(state, payload: Role) {
        state.selectedRole = Object.assign({}, payload)
    },

    setIdToDelete(state, payload: number) {
        state.idToDelete = payload
    },

    setSelectedAuthMethod(state, payload: AuthMethod | null) {
        if (payload != null) {
            state.selectedAuthMethod = Object.assign({}, payload)
            state.selectedAuthMethod.auth_properties = Object.assign({}, payload.auth_properties)
        }
        else {
            state.selectedAuthMethod = payload
        }
    },

    setSelectedStorageProvider(state, payload: StorageProvider | null) {
        if (payload != null) {
            state.selectedStorageProvider = Object.assign({}, payload)
            state.selectedStorageProvider.config = Object.assign({}, payload.config)
        }
        else {
            state.selectedStorageProvider = payload
        }
    },

    storageProviderCreateSuccess(state, payload: StorageProvider) {
        state.storageProviders.push(payload)
    },

    storageProviderUpdateSuccess(state, payload: StorageProvider) {
        const storageProviderIndex = state.storageProviders.findIndex((a) => a.id == payload.id)
        state.storageProviders.splice(storageProviderIndex, 1, payload) // Do it this way to maintain reactivity
    },

    storageProviderDeleteSuccess(state, payload: StorageProvider) {
        state.storageProviders = state.storageProviders.filter((a) => a.id != payload.id)
        if (state.selectedStorageProvider && state.selectedStorageProvider.id == payload.id) {
            state.selectedStorageProvider= null
        }
    },

    authMethodCreateSuccess(state, payload: AuthMethod) {
        state.authMethods.push(payload)
    },

    authMethodUpdateSuccess(state, payload: AuthMethod) {
        const authIndex = state.authMethods.findIndex((a) => a.id == payload.id)
        state.authMethods.splice(authIndex, 1, payload) // Do it this way to maintain reactivity
    },

    authMethodDeleteSuccess(state, payload: AuthMethod) {
        state.authMethods = state.authMethods.filter((a) => a.id != payload.id)
        if (state.selectedAuthMethod && state.selectedAuthMethod.id == payload.id) {
            state.selectedAuthMethod = null
        }
    }
};