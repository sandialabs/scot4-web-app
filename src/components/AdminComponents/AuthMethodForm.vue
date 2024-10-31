<template>
    <v-card flat class="pb-7">
        <v-card-title v-if="selectedAuthMethod.id != -1" class="text-h4">Edit Authentication Method</v-card-title>
        <v-card-title v-else class="text-h4">Create Authentication Method</v-card-title>
        <v-card-text>
            <v-form v-model="formValid">
                <v-container>
                    <v-row>
                        <v-col v-if="selectedAuthMethod.id != -1">
                            <v-text-field :value="selectedAuthMethod.id"
                                          readonly
                                          label="ID"></v-text-field>
                        </v-col> 
                        <v-col>
                            <v-select v-model="selectedAuthMethod.auth"
                                      :items="authTypes"
                                      :readonly="selectedAuthMethod.id != -1"
                                      label="Type"></v-select>
                        </v-col>
                    </v-row>
                    <span v-if="selectedAuthMethod.auth_properties">
                        <span v-for="property in Object.keys(selectedAuthMethod.auth_properties)"
                                        :key="property">
                                    <v-checkbox v-if="typeof selectedAuthMethod.auth_properties[property] === 'boolean'"
                                                v-model="selectedAuthMethod.auth_properties[property]"
                                                :label="authPrettyNames[selectedAuthMethod.auth][property] || property"
                                                :hint="authConfigHelp[selectedAuthMethod.auth][property]">
                                    </v-checkbox>
                                    <v-text-field v-else
                                                  v-model="selectedAuthMethod.auth_properties[property]"
                                                  :label="authPrettyNames[selectedAuthMethod.auth][property] || property"
                                                  :hint="authConfigHelp[selectedAuthMethod.auth][property]">
                                    </v-text-field>
                        </span>
                    </span>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn color="green" v-if="selectedAuthMethod.id != -1" @click="submitUpdate" :loading="saveLoading">
                Save Changes
                <template v-slot:loader v-if="loadingComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
            <v-btn v-else @click="submitCreate" :loading="saveLoading" color="green">Create</v-btn>
            <v-btn @click="cancel">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter, } from 'vuex-class';
    import { AuthMethod, AuthType } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
      components: {
        },
    })

    export default class AuthMethodForm extends Vue{
        @Getter('authMethods', { namespace }) authMethods: Array<AuthMethod>
        @Getter('currentError', { namespace }) currentError: Error
        @Getter('selectedAuthMethod', { namespace }) selectedAuthMethod: AuthMethod
        @Getter('authPrettyNames', { namespace }) authPrettyNames: any
        @Getter('authConfigHelp', { namespace }) authConfigHelp: any
        @Action('updateAuthMethod', { namespace }) updateAuthMethod: CallableFunction
        @Action('openAuthMethodEdit', { namespace }) openAuthMethodEdit: CallableFunction
        @Action('closeAuthMethodEdit', { namespace }) closeAuthMethodEdit: CallableFunction
        @Action('createAuthMethod', { namespace }) createAuthMethod: CallableFunction
        @Action('retrieveAuthHelp', { namespace }) retrieveAuthHelp: CallableFunction

        formValid: boolean = true
        saveLoading: boolean = false
        loadingComplete: boolean = false
        authTypes: Array<any> = []

        mounted() {
            const keys = Object.keys(AuthType)
            const values = Object.values(AuthType)
            var authTypes: Array<any> = []
            keys.forEach(function(key, index){
                const newObject = {
                    text: key,
                    value: values[index]
                }
                authTypes.push(newObject)
            })
            this.authTypes = authTypes
        }

        async submitUpdate() {
            const updateData = {
                auth_properties: this.selectedAuthMethod.auth_properties
            }
            this.saveLoading = true
            const succeeded = await this.updateAuthMethod({ id: this.selectedAuthMethod.id, data: updateData })
            if (succeeded) {
                this.loadingComplete = true
                await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
                this.saveLoading = false
                this.loadingComplete = false
            }
            else {
                this.saveLoading = false
            }
        }

        async submitCreate() {
            const createData = {
                auth: this.selectedAuthMethod.auth
            }
            this.saveLoading = true
            const succeeded = await this.createAuthMethod(createData)
            this.saveLoading = false
            if (succeeded) {
                this.openAuthMethodEdit(this.authMethods[this.authMethods.length-1])
            }
        }

        cancel() {
            this.closeAuthMethodEdit()
        }
    }
</script>