<template>
    <v-card>
        <v-card-title v-if="dialog == 'RoleEdit'">Edit Role</v-card-title>
        <v-card-title v-if="dialog == 'RoleNew'">New Role</v-card-title>
        <v-card-text>
            <v-form v-model="formValid">
                <v-container>
                    <v-text-field :value="selectedRole.id"
                                  v-if="dialog == 'RoleEdit'"
                                  readonly
                                  label="ID"></v-text-field>
                    <v-text-field v-model="selectedRole.name"
                                  :readonly="dialog == 'RoleEdit'"
                                  :rules="[notEmptyIfNew]"
                                  label="Role Name"></v-text-field>
                    <v-text-field v-model="selectedRole.description"
                                  label="Description"></v-text-field>
                    <v-checkbox v-model="roleIsAdmin"
                                :disabled="!currentUser.is_superuser"
                                label="Admin Role"></v-checkbox>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn v-if="dialog == 'RoleEdit'" @click="submit" color="green" :loading="submitLoading">Save Changes</v-btn>
            <v-btn v-if="dialog == 'RoleNew'" @click="submit" color="green" :loading="submitLoading">Create</v-btn>
            <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
    import { Action, Getter, } from 'vuex-class';
    import { Role, User, DialogState } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
      components: {
        },
    })

    export default class RoleForm extends Vue{
        @Getter('roles', { namespace }) Roles: Array<Role>
        @Getter('currentError', { namespace }) currentError: Error
        @Getter('selectedRole', { namespace }) selectedRole: Role
        @Getter('dialog', { namespace }) dialog: DialogState
        @Getter('adminRoleIds', { namespace }) adminRoleIds: Array<number>
        @Getter('currentUser', { namespace: 'user' }) currentUser: User
        @Action('updateRole', { namespace }) updateRole: CallableFunction
        @Action('createRole', { namespace }) createRole: CallableFunction
        @Action('closeDialog', { namespace }) closeDialog: CallableFunction
        @Action('retrieveAdminRoleIds', { namespace }) retrieveAdminRoleIds: CallableFunction
        @Action('grantAdmin', { namespace }) grantAdmin: CallableFunction
        @Action('revokeAdmin', { namespace }) revokeAdmin: CallableFunction

        formValid: boolean = true
        submitLoading: boolean = false
        roleIsAdmin: boolean = false

        async mounted() {
            this.retrieveAdminRoleIds()
        }

        notEmptyIfNew(newVal: string) {
            if (this.dialog == DialogState.RoleNew && !newVal) {
                return 'Must not be empty'
            }
            return true
        }

        async submit() {
            if (this.formValid) {
                if (this.dialog == DialogState.RoleEdit) {
                    const updateData = {
                        'description': this.selectedRole.description
                    }
                    this.submitLoading = true
                    const succeeded = await this.updateRole({ id: this.selectedRole.id, data: updateData })
                    this.submitLoading = false
                    if (succeeded) {
                        // Need to grant admin role
                        if (this.roleIsAdmin && !this.adminRoleIds.includes(this.selectedRole.id)) {
                            this.grantAdmin(this.selectedRole.id)
                        }
                        // Need to revoke admin role
                        else if (!this.roleIsAdmin && this.adminRoleIds.includes(this.selectedRole.id)) {
                            this.revokeAdmin(this.selectedRole.id)
                        }
                        this.closeDialog()
                    }
                }
                else if (this.dialog == DialogState.RoleNew) {
                    this.submitLoading = true
                    const succeeded = await this.createRole(this.selectedRole)
                    this.submitLoading = false
                    if (succeeded) {
                        if (this.roleIsAdmin) {
                            this.grantAdmin(this.selectedRole.id)
                        }
                        this.closeDialog()
                    }
                }
            }
        }

        cancel() {
            this.closeDialog()
        }

        @Watch('selectedRole')
        @Watch('adminRoleIds')
        onAdminRoleIdsChange(newIds: Array<number>) {
            if (this.selectedRole && this.adminRoleIds.includes(this.selectedRole.id)) {
                this.roleIsAdmin = true
            }
            else {
                this.roleIsAdmin = false
            }
        }
    }</script>
