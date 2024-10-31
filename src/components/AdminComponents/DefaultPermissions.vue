<template>
    <v-card v-if="componentLoaded">
        <v-card-title>Default Permissions</v-card-title>
        <v-card-subtitle v-if="permissionType == 'global'">These are the permissions objects will have on creation (blank means "everyone"). These settings are overridable by individual users.</v-card-subtitle>
        <v-card-subtitle v-if="permissionType == 'user'">These are the permissions objects will have when you create them (blank means "everyone"). The global settings will be used if these settings are unset.</v-card-subtitle>
        <v-card-text>
            <v-row>
                <v-col cols="auto" class="align-self-center">
                    <v-row style="width: 15em">
                        <v-col cols="auto" class="align-self-center text-h6">
                            Default (all)
                        </v-col>
                        <v-col v-if="permissionType == 'user'" class="align-self-center pr-0">
                            <v-switch v-model="includeUserDefault" hide-details class="mt-0 switch-justify-end"></v-switch>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col>
                    <v-row>
                        <v-col class="align-self-center">
                            <v-autocomplete dense chips multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            class="pt-3"
                                            item-value="id"
                                            label="Read"
                                            v-model="defaultPermissions.default.read"
                                            :disabled="permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can read any type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                        <v-col class="align-self-center">
                            <v-autocomplete dense chips multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            class="pt-3"
                                            item-value="id"
                                            label="Modify"
                                            v-model="defaultPermissions.default.modify"
                                            :disabled="permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can modify any type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                        <v-col class="align-self-center">
                            <v-autocomplete dense multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            class="pt-3"
                                            item-value="id"
                                            label="Delete"
                                            v-model="defaultPermissions.default.delete"
                                            :disabled="permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can delete any type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row v-for="perms,type in defaultPermissions" v-bind:key="type" dense>
                <v-col cols="auto" class="align-self-center" v-if="type != 'default'" style="width: 15em">
                    <v-row>
                        <v-col>
                            <v-select dense :items="permissionTypeChoices(type)" :value="type" @input="permissionTypeChanged(type, $event)"></v-select>
                        </v-col>
                        <v-col cols="auto">
                            <v-btn icon @click="removeDefaultPermission(type)">
                                <v-icon color="red">mdi-delete</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col v-if="type != 'default'">
                    <v-row>
                        <v-col>
                            <v-autocomplete dense chips multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            item-value="id"
                                            label="Read"
                                            v-model="perms.read"
                                            hint="The roles that can read this type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                        <v-col>
                            <v-autocomplete dense chips multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            item-value="id"
                                            label="Modify"
                                            v-model="perms.modify"
                                            hint="The roles that can modify this type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                        <v-col>
                            <v-autocomplete dense multiple deletable-chips small-chips
                                            :items="roles" item-text="name"
                                            item-value="id"
                                            label="Delete"
                                            v-model="perms.delete"
                                            hint="The roles that can delete this type of object by default (blank means everyone)">
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <div class="text-h6">
                <v-btn small fab color="green" @click="addNewDefaultPermission" v-if="Object.keys(permissionTypes).length >= Object.keys(defaultPermissions).length">
                    <v-icon>
                        mdi-plus
                    </v-icon>
                </v-btn>
            </div>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="updateSettings" color="green" :loading="submitLoading">
                Save Changes
                <template v-slot:loader v-if="submitComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
            <v-btn @click="copyFromSettings">Discard Changes</v-btn>
        </v-card-actions>
    </v-card>
    <v-progress-circular indeterminate v-else></v-progress-circular>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { Settings } from '@/store/modules/team/types'
    import { Role } from '@/store/modules/admin/types'

    const namespace: string = 'admin'
    @Component({
      components: {
        },
    })

    export default class DefaultPermissions extends Vue{
        @Prop({ default: "global" }) permissionType: string

        @Getter('globalSettings', { namespace: 'team' }) globalSettings: Settings
        @Getter('roles', { namespace }) roles: Array<Role>
        @Getter('currentUserPreferences', { namespace: 'user' }) currentUserPreferences: Record<string, any> | undefined
        @Action('updateUserPreferences', { namespace: 'user' }) updateUserPreferences: CallableFunction
        @Action('updateGlobalSettings', { namespace: 'team' }) updateGlobalSettings: CallableFunction
        @Action('retrieveGlobalSettings', { 'namespace': 'team' }) retrieveGlobalSettings: CallableFunction
        @Action('retrieveRoles', { namespace }) retrieveRoles: CallableFunction
        @Action('retrieveUserInfo', { namespace: 'user' }) retrieveUserInfo: CallableFunction

        submitLoading: boolean = false
        submitComplete: boolean = false
        componentLoaded: boolean = false
        defaultPermissions: any = {}
        includeUserDefault: boolean = false

        permissionTypes: Array<any> = [
            { value: "alertgroup", text: "Alertgroup" },
            { value: "dispatch", text: "Dispatch" },
            { value: "event", text: "Event" },
            { value: "guide", text: "Guide" },
            { value: "incident", text: "Incident" },
            { value: "intel", text: "Intel" },
            { value: "product", text: "Product" },
            { value: "signature", text: "Signature" },
            { value: "entity_class", text: "Entity Class" },
            { value: "entity_type", text: "Entity Type" },
            { value: "feed", text: "Feed" },
            { value: "pivot", text: "Pivot" },
            { value: "vuln_feed", text: "Vuln Feed" },
            { value: "vuln_track", text: "Vuln Track" }
        ]

        async mounted() {
            await this.retrieveRoles()
            if (!this.globalSettings && this.permissionType == "global") {
                await this.retrieveGlobalSettings()
            }
            if (this.permissionType == "user") {
                await this.retrieveUserInfo()
            }
            this.copyFromSettings()
            this.componentLoaded = true
        }

        copyFromSettings() {
            this.defaultPermissions = {
                "default": {
                    "read": [],
                    "modify": [],
                    "delete": []
                }
            }
            if (this.globalSettings.default_permissions != null && this.permissionType == "global") {
                Object.assign(this.defaultPermissions, this.globalSettings.default_permissions)
            }
            if (this.currentUserPreferences?.default_permissions != null && this.permissionType == "user") {
                if ('default' in this.currentUserPreferences.default_permissions) {
                    this.includeUserDefault = true
                }
                else {
                    this.includeUserDefault = false
                }
                Object.assign(this.defaultPermissions, this.currentUserPreferences.default_permissions)
            }
            for (const key in this.defaultPermissions) {
                const subpermissions = this.defaultPermissions[key]
                for (const perm in subpermissions) {
                    const roleList: Array<number> = subpermissions[perm]
                    const verifiedList: Array<number> = []
                    if (Array.isArray(roleList)) {
                        for (const roleId of roleList) {
                            if (this.roles.find(r => r.id == roleId)) {
                                verifiedList.push(roleId)
                            }
                        }
                    }
                    subpermissions[perm] = verifiedList
                }
            }
        }

        async updateSettings() {
            var succeeded = false
            this.submitLoading = true
            if (this.permissionType == "global" && this.globalSettings != null && this.globalSettings != undefined) {
                succeeded = await this.updateGlobalSettings({ "default_permissions": this.defaultPermissions })
            }
            if (this.permissionType == "user" && this.currentUserPreferences) {
                const newPreferences: any = {}
                Object.assign(newPreferences, this.currentUserPreferences)
                newPreferences["default_permissions"] = {}
                Object.assign(newPreferences.default_permissions, this.defaultPermissions)
                if (!this.includeUserDefault) {
                    delete newPreferences.default_permissions["default"]
                }
                succeeded = await this.updateUserPreferences({ newUserPreferences: newPreferences })
            }
            if (succeeded) {
                this.submitComplete = true
                await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
                this.submitLoading = false
                this.submitComplete = false
            }
            else {
                this.submitLoading = false
            }
            this.copyFromSettings()
        }

        permissionTypeChoices(type: string) {
            return this.permissionTypes.filter(p => p.value == type || !Object.keys(this.defaultPermissions).includes(p.value))
        }

        permissionTypeChanged(oldType: string, newType: string) {
            this.$set(this.defaultPermissions, newType, this.defaultPermissions[oldType])
            this.$delete(this.defaultPermissions, oldType)
        }

        addNewDefaultPermission() {
            for (const key of this.permissionTypes.map(p => p.value)) {
                if (!Object.keys(this.defaultPermissions).includes(key)) {
                    this.$set(this.defaultPermissions, key, {
                        "read": [],
                        "modify": [],
                        "delete": []
                    })
                    break
                }
            }
        }

        removeDefaultPermission(type: string) {
            this.$delete(this.defaultPermissions, type)
        }
    }
</script>
<style>
    .switch-justify-end .v-input__slot {
        justify-content: flex-end;
    }
</style>
