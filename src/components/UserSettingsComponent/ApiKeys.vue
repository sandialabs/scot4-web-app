<template>
    <v-card flat>
        <v-dialog max-width="400px" v-model="deleteDialogOpen">
            <v-card>
                <v-card-title>Delete API Key</v-card-title>
                <v-card-text v-if="apiKeyToDelete">
                    Are you sure you want to delete API key {{ apiKeyToDelete.key }}?
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" :loading="deleteLoading" @click="confirmDeleteApiKey(apiKeyToDelete)">
                        Delete
                    </v-btn>
                    <v-btn @click="deleteDialogOpen = false">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-card-title>API Keys</v-card-title>
        <v-card-text>
            <div class="text-h6">
                Create API Key
                <v-btn small fab color="green" @click="createApiKey">
                    <v-icon>
                        mdi-plus
                    </v-icon>
                </v-btn>
            </div>
            <v-simple-table>
                <thead>
                    <tr>
                        <th>API Key</th>
                        <th>Active</th>
                        <th>Delete</th>
                        <th>Roles (optional)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="apikey in userApiKeys" :key="apikey.key">
                        <td>{{ apikey.key }}</td>
                        <td><v-switch :loading="activeSwitchesLoading[apikey.key]" :input-value="apikey.active" @click.native.prevent.stop.capture="activeSwitchChange(apikey.key, apikey.active)"></v-switch></td>
                        <td>
                            <v-btn icon @click.stop="apiKeyToDelete = apikey, deleteDialogOpen = true">
                                <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                        </td>
                        <td width="50%">
                                    <v-select chips multiple deletable-chips
                                                :items="currentUser.roles"
                                                item-text="name"
                                                item-value="name"
                                                label="Roles"
                                                :menu-props="{ offsetY: true, nudgeBottom: 30 }"
                                                v-model="apikey.roles"
                                                hint="The API key's access will be limited to ONLY these roles. Having no roles on an API key is equivalent to that key having all roles the user has."
                                                @change="rolesChanged(apikey.key, $event)">
                                    </v-select>
                        </td>
                    </tr>
                </tbody>
            </v-simple-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class'
    import { ApiKey, User } from '../../store/modules/user/types'

    const namespace: string = "user"

    @Component({
    })
    export default class ApiKeys extends Vue {
        @Getter('userApiKeys', { namespace }) userApiKeys: Array<ApiKey>
        @Getter('currentUser', { namespace }) currentUser: User
        @Action('retrieveUserApiKeys', { namespace }) retrieveUserApiKeys: CallableFunction
        @Action('updateApiKey', { namespace }) updateApiKey: CallableFunction
        @Action('createApiKey', { namespace }) createApiKey: CallableFunction
        @Action('deleteApiKey', { namespace }) deleteApiKey: CallableFunction

        activeSwitchesLoading: Record<string, boolean> = {}
        deleteDialogOpen: boolean = false
        deleteLoading: boolean = false
        apiKeyToDelete: ApiKey | null = null

        async mounted() {
            await this.retrieveUserApiKeys()
            for (const apikey of this.userApiKeys) {
                this.activeSwitchesLoading[apikey.key] = false
            }
        }

        async activeSwitchChange(apikey: string, oldValue: boolean) {
            const apikeyUpdate = { active: !oldValue }
            this.activeSwitchesLoading[apikey] = true
            this.$forceUpdate() // Reactivity isn't working :(
            await this.updateApiKey({ "key": apikey, "updateData": apikeyUpdate })
            this.activeSwitchesLoading[apikey] = false
            this.$forceUpdate()
        }

        async rolesChanged(apikey: string, newRoles: Array<string>) {
            const apikeyUpdate = { roles: newRoles }
            await this.updateApiKey({ "key": apikey, "updateData": apikeyUpdate })
        }

        async confirmDeleteApiKey(apikey: ApiKey) {
            this.deleteLoading = true
            await this.deleteApiKey({ key: apikey.key })
            this.apiKeyToDelete = null
            this.deleteLoading = false
            this.deleteDialogOpen = false
        }
    }
</script>