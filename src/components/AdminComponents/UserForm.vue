<template>
    <v-card>
        <v-card-title v-if="dialog == 'UserEdit'">Edit User</v-card-title>
        <v-card-title v-else-if="dialog == 'UserNew'">New User</v-card-title>
        <v-card-text>
            <v-form ref="form" v-model="formValid">
                <v-dialog max-width="600px"
                          :value="roleWarningDialog != null"
                          @click:outside="roleWarningDialog = null, dontWarnAgain = false">
                    <v-card>
                        <v-card-title>Warning</v-card-title>
                        <v-card-text v-if="roleWarningDialog">
                            This role is managed by authentication method 
                            <b>{{ roleWarningDialog.auth_methods[0].auth_properties.provider_name }}</b>
                            ({{ roleWarningDialog.auth_methods[0].auth }}).
                            If this role was not {{ roleBeingRemoved ? 'removed from' : 'added to' }} the user 
                            in the underlying authentication scheme, it will be 
                            {{ roleBeingRemoved ? 'added to' : 'removed from' }} them next time they log in. 
                            Still {{ roleBeingRemoved ? 'remove' : 'add' }} it?
                        </v-card-text>
                        <v-card-actions>
                            <v-row>
                                <v-col>
                                    <v-btn v-if="roleBeingRemoved"
                                           @click="removeItem(roleWarningDialog, true)">
                                        Remove Anyway
                                    </v-btn>
                                    <v-btn v-else
                                           @click="addItem(roleWarningDialog, true)">
                                        Add Anyway
                                    </v-btn>
                                </v-col>
                                <v-col>
                                    <v-btn @click="roleWarningDialog = null, dontWarnAgain = false">Cancel</v-btn>
                                </v-col>
                            </v-row>
                            <v-checkbox v-model="dontWarnAgain" label="Don't ask me again"></v-checkbox>  
                        </v-card-actions>
                    </v-card>
                </v-dialog>
                <v-container>
                    <v-row>
                        <v-col v-if="dialog == 'UserEdit'">
                            <v-text-field :value="selectedUser.id"
                                          readonly
                                          label="ID"></v-text-field>
                        </v-col>
                        <v-col>
                            <v-text-field v-model="selectedUser.username"
                                          :readonly="dialog == 'UserEdit'"
                                          :rules="[notEmptyIfNew]"
                                          label="Username"></v-text-field>
                        </v-col>
                    </v-row>
                    <v-text-field v-model="selectedUser.fullname"
                                  label="Full Name"></v-text-field>
                    <v-text-field v-model="selectedUser.email"
                                  label="Email"></v-text-field>
                    <v-text-field v-model="password"
                                  type="password"
                                  label="New Password"></v-text-field>
                    <v-text-field v-model="confirmPassword"
                                  :rules="[passwordsMustMatch]"
                                  type="password"
                                  label="Confirm Password"></v-text-field>
                    <v-autocomplete chips multiple deletable-chips small-chips
                                    :items="roles" item-text="name"
                                    item-value="id"
                                    label="Roles"
                                    v-model="selectedUserRoles">
                        <template v-slot:selection="data">
                            <v-chip v-bind="data.attrs"
                                    :input-value="data.selected"
                                    :color="data.item.auth_methods.length > 0 ? 'red' : undefined"
                                    close
                                    @click:close="removeItem(data.item)">
                                {{ data.item.name }}
                            </v-chip>
                        </template>
                        <template v-slot:item="data">
                            <v-list-item-content @click.stop="autocompleteItemClicked(data.item)">
                                <span v-if="data.item.auth_methods.length > 0" style="color: red">
                                    {{ data.item.name }}
                                </span>
                                <span v-else>{{ data.item.name }}</span>
                            </v-list-item-content>
                        </template>
                    </v-autocomplete>
                </v-container>
            </v-form>
            <v-card-actions>
                <v-btn v-if="dialog == 'UserEdit'"
                       @click="submit" color="green" :loading="submitLoading">Save Changes</v-btn>
                <v-btn v-if="dialog == 'UserNew'"
                       @click="submit" color="green" :loading="submitLoading">Create</v-btn>
                <v-btn @click="cancel">Cancel</v-btn>
                <v-btn v-if="dialog == 'UserEdit'" @click="resetAttempts" :loading="resetAttemptsLoading">
                    Reset Password Attempts
                    <template v-slot:loader v-if="resetAttemptsComplete">
                        <span class="custom-loader">
                            <v-icon>mdi-check</v-icon>
                        </span>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Ref } from 'vue-property-decorator'
    import { Action, Getter, } from 'vuex-class';
    import { DialogState, User, Role } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    
    @Component
    export default class UserForm extends Vue{
        @Getter('users', { namespace }) users: Array<User>
        @Getter('roles', { namespace }) roles: Array<Role>
        @Getter('selectedUser', { namespace }) selectedUser: User
        @Getter('dialog', { namespace }) dialog: DialogState
        @Action('retrieveUsers', { namespace }) retrieveUsers: CallableFunction
        @Action('updateUser', { namespace }) updateUser: CallableFunction
        @Action('createUser', { namespace }) createUser: CallableFunction
        @Action('assignRole', { namespace }) assignRole: CallableFunction
        @Action('removeRole', { namespace }) removeRole: CallableFunction
        @Action('closeDialog', { namespace }) closeDialog: CallableFunction
        @Action('resetPasswordAttempts', { namespace }) resetPasswordAttempts: CallableFunction
        @Ref('form') readonly form!: any

        password: string = ''
        confirmPassword: string = ''
        submitLoading: boolean = false
        formValid: boolean = true
        roleWarningDialog: Role | null = null
        roleBeingRemoved: boolean = false
        dontWarnAgain: boolean = false
        selectedUserRoles: Array<number> = []
        resetAttemptsLoading: boolean = false
        resetAttemptsComplete: boolean = false

        mounted() {
            this.selectedUserRoles = this.selectedUser.roles.map(({ id }) => id)
        }

        passwordsMustMatch() {
            if (this.password != this.confirmPassword) {
                return 'Passwords must match'
            }
            return true
        }

        notEmptyIfNew() {
            if (this.dialog == DialogState.UserNew && !this.selectedUser.username) {
                return 'Must not be empty'
            }
            return true
        }

        @Watch('password')
        validateForm() {
            this.form.validate()
        }

        addItem(roleToAdd: Role, noWarning: boolean = false) {
            if (roleToAdd.auth_methods.length > 0 && !noWarning && !this.dontWarnAgain) {
                this.roleWarningDialog = roleToAdd
                this.roleBeingRemoved = false
            }
            else {
                this.selectedUserRoles.push(roleToAdd.id)
                this.roleWarningDialog = null
            }
        }

        removeItem(roleToRemove: Role, noWarning: boolean = false) {
            if (roleToRemove.auth_methods.length > 0 && !noWarning && !this.dontWarnAgain) {
                this.roleWarningDialog = roleToRemove
                this.roleBeingRemoved = true
            }
            else {
                this.selectedUserRoles = this.selectedUserRoles.filter((id) => id != roleToRemove.id)
                this.roleWarningDialog = null
            }
        }

        async submit() {
            if (this.formValid) {
                this.submitLoading = true
                let succeeded = false
                if (this.dialog == DialogState.UserEdit) {
                    const updateData = {
                        'fullname': this.selectedUser.fullname,
                        'email': this.selectedUser.email,
                        'password': this.password || null
                    }
                    succeeded = await this.updateUser({ id: this.selectedUser.id, data: updateData })
                }
                else if (this.dialog == DialogState.UserNew) {
                    succeeded = await this.createUser(this.selectedUser)
                }
                this.submitLoading = false
                if (succeeded) {
                    const currentRoleIds = this.selectedUser.roles.map(({ id }) => id)
                    const newRoles = this.selectedUserRoles.filter((id) => !currentRoleIds.includes(id))
                    const removedRoles = currentRoleIds.filter((id) => !this.selectedUserRoles.includes(id))
                    // Assign all roles asynchronously
                    await Promise.all(newRoles.map(async (role_id) => {
                        succeeded = succeeded && await this.assignRole({ role_id, username: this.selectedUser.username })
                    }))
                    // Remove all roles asynchronously
                    await Promise.all(removedRoles.map(async (role_id) => {
                        succeeded = succeeded && await this.removeRole({ role_id, username: this.selectedUser.username })
                    }))
                    if (succeeded) {
                        this.closeDialog()
                    }
                    else {
                        this.form.message = "Error while assigning/removing roles, make sure roles are correct"
                    }
                }
            }
        } 

        @Watch('selectedUser') 
        watch(newUser: User) {
            if (newUser) {
                this.selectedUserRoles = newUser.roles.map(({ id }) => id)
            }
            this.confirmPassword = ''
            this.password = ''
        }

        cancel() {
            this.confirmPassword = ''
            this.password = ''
            this.closeDialog()
        }

        async resetAttempts() {
            this.resetAttemptsLoading = true
            const success = await this.resetPasswordAttempts(this.selectedUser.username)
            if (success) {
                this.resetAttemptsComplete = true
                await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
                this.resetAttemptsLoading = false
                this.resetAttemptsComplete = false
            }
            this.resetAttemptsLoading = false
        }

        autocompleteItemClicked(item: Role) {
            if (this.selectedUserRoles.includes(item.id)) {
                this.removeItem(item)
            }
            else {
                this.addItem(item)
            }
        }
    }</script>
