import { User, Role } from '@/store/modules/user/types';
// Just copy from user module
export { User, Role };

export enum DialogState {
    Hidden = 'Hidden',
    UserEdit = 'UserEdit',
    UserNew = 'UserNew',
    UserDelete = 'UserDelete',
    RoleEdit = 'RoleEdit',
    RoleNew = 'RoleNew',
    RoleDelete = 'RoleDelete',
    AuthMethodDelete = 'AuthMethodDelete',
    StorageProviderDelete = 'StorageProviderDelete'
}

export enum AuthType {
    Local = 'local',
    LDAP = 'ldap',
    AzureAD = 'aad'
}

export enum StorageProviderType{
    Local = 'disk',
    S3 = 's3',
    DellEMC = 'emc'
}

export interface AuthMethod {
    id: number,
    auth: AuthType,
    auth_properties: any,
    auth_active: boolean
}

export interface StorageProvider {
    id: number,
    provider: StorageProviderType,
    enabled: boolean
    config: any
}

export interface AdminTabState {
    users: Array<User>,
    roles: Array<Role>,
    authMethods: Array<AuthMethod>,
    dialog: DialogState,
    storageProviders:Array<StorageProvider>,
    selectedUser: User | null,
    selectedRole: Role | null,
    selectedAuthMethod: AuthMethod | null,
    adminRoleIds: Array<number>,
    idToDelete: number,
    authHelp: any,
    selectedStorageProvider: StorageProvider | null
    storageProviderHelp:any
}