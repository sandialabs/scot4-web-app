import { ActionTree } from 'vuex';
import { AdminTabState, DialogState, User, Role, AuthMethod, StorageProvider } from './types';
import { RootState } from '@/store/types';
import Vue from 'vue';


export const actions: ActionTree<AdminTabState, RootState> = {
    async retrieveUsers({ commit }, { skip, limit, sort } = {}): Promise<any> {
        try {
            const users = await Vue.prototype.$api.user.getUsers({ skip, limit, sort })
            commit('usersLoaded', users.data.result)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }

    },
    async updateUser({ commit }, { id, data }): Promise<boolean> {
        try {
            const updatedUser = await Vue.prototype.$api.user.updateUser(id, data)
            commit('userUpdateSuccess', updatedUser.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async createUser({ commit }, data): Promise<boolean> {
        try {
            const createdUser = await Vue.prototype.$api.user.createUser(data)
            commit('userCreateSuccess', createdUser.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async deleteUser({ commit }, user_id): Promise<boolean> {
        try {
            const deletedUser = await Vue.prototype.$api.user.deleteUser(user_id)
            commit('userDeleteSuccess', deletedUser.id)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async retrieveRoles({ commit }, { skip, limit, sort } = {}): Promise<any> {
        try {
            const roles = await Vue.prototype.$api.user.getRoles({ skip, limit, sort })
            commit('rolesLoaded', roles.data.result)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async updateRole({ commit }, { id, data }): Promise<boolean> {
        try {
            const updatedRole = await Vue.prototype.$api.user.updateRole(id, data)
            commit('roleUpdateSuccess', updatedRole.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async createRole({ commit }, data): Promise<boolean> {
        try {
            const createdRole = await Vue.prototype.$api.user.createRole(data)
            commit('roleCreateSuccess', createdRole.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async assignRole({ commit }, { username, role_id, role_name }): Promise<boolean> {
        try {
            await Vue.prototype.$api.user.assignRole(username, role_id, role_name)
            commit('roleAssignSuccess', { username, role_id, role_name })
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async removeRole({ commit }, { username, role_id, role_name }): Promise<boolean> {
        try {
            await Vue.prototype.$api.user.removeRole(username, role_id, role_name)
            commit('roleRemoveSuccess', { username, role_id, role_name })
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async deleteRole({ commit }, role_id): Promise<boolean> {
        try {
            const deletedRole = await Vue.prototype.$api.user.deleteRole(role_id)
            commit('roleDeleteSuccess', deletedRole.id)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async retrieveAdminRoleIds({ commit }): Promise<any> {
        try {
            const roles = await Vue.prototype.$api.user.getRolesForObject('admin', 0)
            if (roles.data && roles.data.admin) {
                const roleIds = roles.data.admin.map((role: Role) => role.id)
                commit('adminRoleIdsLoaded', roleIds)
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async grantAdmin({ commit }, role_id): Promise<any> {
        try {
            await Vue.prototype.$api.user.grantPermission(role_id, 'admin', 0, 'admin')
            commit('adminGrantSuccess', role_id)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async revokeAdmin({ commit }, role_id): Promise<any> {
        try {
            await Vue.prototype.$api.user.revokePermission(role_id, 'admin', 0, 'admin')
            commit('adminRevokeSuccess', role_id)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async retrieveAuthMethods({ commit }): Promise<any> {
        try {
            const authMethods = await Vue.prototype.$api.auth.getAuthMethods()
            commit('authMethodsLoaded', authMethods.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async retrieveStorageProviders({ commit }): Promise<any> {
        try {
            const storageProviders = await Vue.prototype.$api.storageProvider.getStorageProviders()
            commit('storageProvidersLoaded', storageProviders.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async createAuthMethod({ commit }, data): Promise<boolean> {
        try {
            const createdAuthMethod = await Vue.prototype.$api.auth.createAuthMethod(data)
            commit('authMethodCreateSuccess', createdAuthMethod.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async createStorageProvider({ commit }, data): Promise<boolean> {
        try {
            const createdStorageProvider = await Vue.prototype.$api.storageProvider.createStorageProvider(data)
            commit('storageProviderCreateSuccess', createdStorageProvider.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async updateStorageProvider({ commit }, { id, data }): Promise<boolean> {
        try {
            const updatedStorageProvider = await Vue.prototype.$api.storageProvider.updateStorageProvider(id, data)
            commit('storageProviderUpdateSuccess', updatedStorageProvider.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async updateAuthMethod({ commit }, { id, data }): Promise<boolean> {
        try {
            const updatedAuthMethod = await Vue.prototype.$api.auth.updateAuthMethod(id, data)
            commit('authMethodUpdateSuccess', updatedAuthMethod.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async deleteStorageProvider({ commit }, id): Promise<boolean> {
        try {
            const deletedStorageProvider = await Vue.prototype.$api.storageProvider.deleteStorageProvider(id)
            commit('storageProviderDeleteSuccess', deletedStorageProvider.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async deleteAuthMethod({ commit }, id): Promise<boolean> {
        try {
            const deletedAuthMethod = await Vue.prototype.$api.auth.deleteAuthMethod(id)
            commit('authMethodDeleteSuccess', deletedAuthMethod.data)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    async retrieveAuthHelp({ commit }): Promise<any> {
        try {
            const authHelp = await Vue.prototype.$api.auth.getAuthHelp()
            commit('authHelpLoaded', authHelp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }

    },
    async retrieveStorageProviderHelp({ commit }): Promise<any> {
        try {
            const storageProviderHelp = await Vue.prototype.$api.storageProvider.getStorageProviderHelp()
            commit('storageProviderHelpLoaded', storageProviderHelp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }

    },
    closeDialog({ commit }) {
        commit('changeDialog', DialogState.Hidden)
    },
    openUserEditDialog({ commit }, user: User) {
        commit('setSelectedUser', user)
        commit('changeDialog', DialogState.UserEdit)
    },
    openRoleEditDialog({ commit }, role: Role) {
        commit('setSelectedRole', role)
        commit('changeDialog', DialogState.RoleEdit)
    },
    openUserCreateDialog({ commit }) {
        commit('setSelectedUser', {
            username: '',
            fullname: '',
            email: '',
            roles: [],
            password: null
        })
        commit('changeDialog', DialogState.UserNew)
    },
    openRoleCreateDialog({ commit }) {
        commit('setSelectedRole', {
            name: '',
            description: ''
        })
        commit('changeDialog', DialogState.RoleNew)
    },
    openUserDeleteDialog({ commit }, user: User) {
        commit('setSelectedUser', user)
        commit('changeDialog', DialogState.UserDelete)
    },
    openRoleDeleteDialog({ commit }, role: Role) {
        commit('setSelectedRole', role)
        commit('changeDialog', DialogState.RoleDelete)
    },
    openAuthMethodEdit({ commit }, auth: AuthMethod) {
        commit('setSelectedAuthMethod', auth)
    },
    openStorageProviderEdit({ commit }, provider: StorageProvider) {
        commit('setSelectedStorageProvider', provider)
    },

    closeStorageProviderEdit({ commit }) {
        commit('setSelectedStorageProvider', null)
    },

    closeAuthMethodEdit({ commit }) {
        commit('setSelectedAuthMethod', null)
    },
    openAuthMethodDeleteDialog({ commit }, auth: AuthMethod) {
        commit('setIdToDelete', auth.id)
        commit('changeDialog', DialogState.AuthMethodDelete)
    },

    openStorageProviderDeleteDialog({ commit }, provider: StorageProvider) {
        commit('setIdToDelete', provider.id)
        commit('changeDialog', DialogState.StorageProviderDelete)
    }
};