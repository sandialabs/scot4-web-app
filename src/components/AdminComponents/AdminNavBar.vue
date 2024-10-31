<template>
    <v-card class="mx-auto" flat>
        <v-dialog max-width="600px"
                  :value="dialog == 'UserEdit' || dialog == 'UserNew'"
                  @click:outside="closeDialog">
            <UserForm></UserForm>
        </v-dialog>
        <v-dialog max-width="600px"
                  :value="dialog == 'RoleEdit' || dialog == 'RoleNew'"
                  @click:outside="closeDialog">
            <RoleForm></RoleForm>
        </v-dialog>
        <v-dialog max-width="400px"
                  :value="dialog == 'RoleDelete' || dialog == 'UserDelete'"
                  @click:outside="closeDialog">
            <v-card>
                <v-card-title v-if="dialog == 'RoleDelete'">Delete Role</v-card-title>
                <v-card-title v-if="dialog == 'UserDelete'">Delete User</v-card-title>
                <v-card-text v-if="(selectedRole && dialog == 'RoleDelete') || (selectedUser && dialog == 'UserDelete')">
                    <p v-if="dialog == 'RoleDelete' && selectedRole.auth_methods && selectedRole.auth_methods.length > 0">
                        This role is managed by authentication method
                        <b>{{ selectedRole.auth_methods[0].auth_properties.provider_name }}</b>
                        ({{ selectedRole.auth_methods[0].auth }}).
                        If it was not deleted in the underlying authentication method, it might be recreated under
                        the same name without any of its previous permissions applied.
                    </p>
                    <p v-if="dialog == 'RoleDelete'">
                        Are you sure you want to delete role <i>{{ selectedRole.name }}</i>?
                        <b>This action cannot be undone.</b>
                    </p>
                    <p v-if="dialog == 'UserDelete'">
                        Are you sure you want to delete user <i>{{ selectedUser.username }}</i>?
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" :loading="deleteLoading"
                           @click="confirmedDelete(dialog == 'RoleDelete' ? selectedRole : selectedUser)">
                        Delete
                    </v-btn>
                    <v-btn @click="closeDialog">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog max-width="400px"
          :value="dialog == 'AuthMethodDelete'"
          @click:outside="closeDialog">
            <v-card>
                <v-card-title>Delete Authentication Method</v-card-title>
                <v-card-text>
                    Are you sure you want to delete authentication method {{ idToDelete }}?
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" :loading="deleteLoading" @click="confirmDeleteAuthMethod(idToDelete)">
                        Delete
                    </v-btn>
                    <v-btn @click="closeDialog">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-dialog max-width="400px"
          :value="dialog == 'StorageProviderDelete'"
          @click:outside="closeDialog">
            <v-card>
                <v-card-title>Delete Storage Provider</v-card-title>
                <v-card-text>
                    Are you sure you want to delete storage provider {{ idToDelete }}?
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" :loading="deleteLoading" @click="confirmDeleteStorageProvider(idToDelete)">
                        Delete
                    </v-btn>
                    <v-btn @click="closeDialog">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>


        <v-toolbar flat
                   dark>
            <v-toolbar-title>Administration Settings</v-toolbar-title>

        </v-toolbar>
        <v-tabs vertical>
            <v-tab>
                <v-icon left>
                    mdi-cog
                </v-icon>
                Global Settings
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-account
                </v-icon>
                Users & Groups
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-lock
                </v-icon>
                Authentication
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-clipboard-text
                </v-icon>
                Audit Logs
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-database
                </v-icon>
                Object Storage
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-book-cog
                </v-icon>
                Default Permissions
            </v-tab>
            <v-tab-item>
                <GlobalSettings></GlobalSettings>
            </v-tab-item>
            <v-tab-item>
                <v-row justify="center" class="text-left">
                    <v-card flat width="50%">
                        <v-card-title class="text-h4">Users</v-card-title>
                        <v-card-text>
                            <div class="text-h6">
                                Add User
                                <v-btn small fab color="green" @click="openUserCreateDialog">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <UsersTable></UsersTable>
                        </v-card-text>
                    </v-card>
                    <v-card flat width="50%">
                        <v-card-title class="text-h4">Roles</v-card-title>
                        <v-card-text>
                            <div class="text-h6">
                                Add Role
                                <v-btn small fab color="green" @click="openRoleCreateDialog">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <RolesTable></RolesTable>
                        </v-card-text>
                    </v-card>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <v-row class="text-left">
                    <v-card flat width="40%">
                        <v-card-title class="text-h4">Authentication Methods</v-card-title>
                        <v-card-text>
                            <div class="text-h6">
                                Add Authentication Method
                                <v-btn small fab color="green" @click="openAuthMethodEdit({id: -1})">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <AuthMethodsTable></AuthMethodsTable>
                        </v-card-text>
                    </v-card>
                    <v-card flat width="60%" v-if="selectedAuthMethod">
                        <AuthMethodForm></AuthMethodForm>
                    </v-card>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <AuditLogs></AuditLogs>
            </v-tab-item>
            <v-tab-item>
                <v-row class="text-left">
                    <v-card flat width="40%">
                        <v-card-title class="text-h4">Object Storage Providers</v-card-title>
                        <v-card-text>
                            <div class="text-h6">
                                Add a Storage Provider
                                <v-btn small fab color="green" @click="openStorageProviderEdit({id: -1})">
                                    <v-icon>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <StorageProviderTable> </StorageProviderTable>
                        </v-card-text>
                    </v-card>
                    <v-card flat width="60%" v-if="selectedStorageProvider">
                        <StorageProviderForm></StorageProviderForm>
                    </v-card>
                </v-row>
            </v-tab-item>
            <v-tab-item>
                <DefaultPermissions></DefaultPermissions>
            </v-tab-item>
        </v-tabs>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Getter, Action } from 'vuex-class'
    import { AuthMethod, DialogState, Role, User, StorageProvider } from '@/store/modules/admin/types'
    import UsersTable from './UsersTable.vue'
    import RolesTable from './RolesTable.vue'
    import AuthMethodsTable from './AuthMethodsTable.vue'
    import UserForm from './UserForm.vue'
    import RoleForm from './RoleForm.vue'
    import AuthMethodForm from './AuthMethodForm.vue'
    import GlobalSettings from './GlobalSettings.vue'
    import AuditLogs from '../UserSettingsComponent/AuditLogs.vue'
    import StorageProviderTable from './StorageProviderTable.vue'
    import StorageProviderForm from './StorageProviderForm.vue'
    import DefaultPermissions from './DefaultPermissions.vue'

    const namespace: string = 'admin';
    @Component({
        components: {
            UsersTable,
            RolesTable,
            AuthMethodsTable,
            UserForm,
            RoleForm,
            AuthMethodForm,
            GlobalSettings,
            AuditLogs,
            StorageProviderTable,
            StorageProviderForm,
            DefaultPermissions
        },
    })

    export default class AdminNavBar extends Vue{
        @Getter('dialog', { namespace }) dialog: DialogState
        @Getter('selectedRole', { namespace }) selectedRole: Role
        @Getter('selectedUser', { namespace }) selectedUser: User
        @Getter('selectedAuthMethod', { namespace }) selectedAuthMethod: AuthMethod
        @Getter('selectedStorageProvider', { namespace }) selectedStorageProvider: StorageProvider
        @Getter('idToDelete', { namespace }) idToDelete: number
        @Action('closeDialog', { namespace }) closeDialog: CallableFunction
        @Action('openUserCreateDialog', { namespace }) openUserCreateDialog: CallableFunction
        @Action('openRoleCreateDialog', { namespace }) openRoleCreateDialog: CallableFunction
        @Action('openAuthMethodEdit', { namespace }) openAuthMethodEdit: CallableFunction
        @Action('openStorageProviderEdit', { namespace }) openStorageProviderEdit: CallableFunction
        @Action('deleteRole', { namespace }) deleteRole: CallableFunction
        @Action('deleteUser', { namespace }) deleteUser: CallableFunction
        @Action('deleteAuthMethod', { namespace }) deleteAuthMethod: CallableFunction
        @Action('deleteStorageProvider', { namespace }) deleteStorageProvider: CallableFunction

        deleteLoading: boolean = false
        items = [{"title": "Users"}, {"title": "Groups"}, {"title":"Assets"}, {"title":"Signatures"}, {"title": "Authentication"}]

        async confirmedDelete(item: Role | User) {
            this.deleteLoading = true
            var succeeded = false
            if (this.dialog == DialogState.RoleDelete) {
                succeeded = await this.deleteRole(item.id)
            }
            else if (this.dialog == DialogState.UserDelete) {
                succeeded = await this.deleteUser(item.id)
            }
            this.deleteLoading = false
            if (succeeded) {
                this.closeDialog()
            }
        }

        async confirmDeleteAuthMethod(authId: number) {
            this.deleteLoading = true
            await this.deleteAuthMethod(authId)
            this.deleteLoading = false
            this.closeDialog()
        }


        async confirmDeleteStorageProvider(providerId: number) {
            this.deleteLoading = true
            await this.deleteStorageProvider(providerId)
            this.deleteLoading = false
            this.closeDialog()
        }
    }
</script>