

export interface UserState {
    token?: string;
    loginInProgress: boolean;
    loginExpiration: Date;
    user: User | undefined;
    userApiKeys: Array<ApiKey>;
    showQuickSettings: boolean;
    firehose: EventSource | undefined;
    searchResults: any,
    showSearchOverlay:boolean,
}
export interface Role {
    name: string
    id: number
    description: string | undefined
    auth_methods: Array<any>
    modified: string
    created: string
}
export interface User {
    id: number,
    email: string
    failed_attempts: number
    fullname: string
    is_active: boolean
    is_superuser: boolean
    last_activity: string
    last_login: string
    preferences: Record<string, any>
    username: string
    roles: Array<Role>
    notifications:Array<Notification>,
}
export interface Notification {
    message: string,
    id: number,
    created: Date,
    modified: Date,
    ack: boolean,
    ref_id: string

}
export interface ApiKey {
    key: string,
    owner: string,
    active: boolean,
    roles: Array<Role>
}