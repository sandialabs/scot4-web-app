import { GetterTree } from 'vuex';
import { AdminTabState, User, Role, DialogState, AuthMethod, StorageProvider} from './types';
import { RootState } from '@/store/types';

export const getters: GetterTree<AdminTabState, RootState> = {
    users(state): Array<User> {
        return state.users
    },
    roles(state): Array<Role> {
        return state.roles
    },
    authMethods(state): Array<AuthMethod> {
        return state.authMethods
    },
    storageProviders(state):Array<StorageProvider>{
        return state.storageProviders
    },
    dialog(state): DialogState {
        return state.dialog
    },
    selectedStorageProvider(state): StorageProvider| null{
        return state.selectedStorageProvider
    },
    selectedUser(state): User | null {
        return state.selectedUser
    },
    selectedRole(state): Role | null {
        return state.selectedRole
    },
    selectedAuthMethod(state): AuthMethod | null {
        return state.selectedAuthMethod
    },
    adminRoleIds(state): Array<number> {
        return state.adminRoleIds
    },
    idToDelete(state): number {
        return state.idToDelete
    },
    authPrettyNames(state): any {
        return state.authHelp.config_name_pretty
    },
    authConfigHelp(state): any {
        return state.authHelp.config_help
    },
    storageProviderPrettyNames(state): any {
        return state.storageProviderHelp.config_name_pretty
    },
    storageProviderConfigHelp(state): any {
        return state.storageProviderHelp.config_help
    }
};