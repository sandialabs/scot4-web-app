<template>
    <v-card>
        <v-card-title>Global Settings</v-card-title>
        <v-card-text>
            <span v-for="setting in enabledSettings" :key="setting">
                <v-switch v-if="typeof(globalSettings[setting]) === 'boolean'"
                          :value="globalSettings[setting]"
                          :label="settingPrettyNames[setting]"
                          :hint="settingDescriptions[setting]"
                          persistent-hint
                          @change="updateSetting(setting, $event)"></v-switch>
                <v-text-field v-else class="mt-4"
                              :value="globalSettings[setting]"
                              :label="settingPrettyNames[setting]"
                              :hint="settingDescriptions[setting]"
                              @change="updateSetting(setting, $event)"></v-text-field>
            </span>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter, Mutation, } from 'vuex-class';
    import { Settings } from '@/store/modules/team/types'

    @Component({
      components: {
        },
    })

    export default class RoleForm extends Vue{
        @Getter('globalSettings', { namespace: 'team' }) globalSettings: Settings
        @Action('updateGlobalSettings', { namespace: 'team' }) updateGlobalSettings: CallableFunction
        @Mutation('errorOccurred') errorOcurred: CallableFunction

        enabledSettings = ['site_name', 'environment_level', 'it_contact', 'time_zone']
        settingPrettyNames = {
            'site_name': 'Site Name',
            'environment_level': 'Environment Level',
            'it_contact': 'IT Contact',
            'time_zone': 'Time Zone'
        }
        settingDescriptions = {
            'site_name': 'A descriptive name for this SCOT instance',
            'environment_level': 'The sensitivity level of data in this SCOT instance',
            'it_contact': 'An email address for the IT contact for this SCOT instance',
            'time_zone': 'The primary time zone of this SCOT instance (such as US/Mountain)'
        }

        async updateSetting(setting: string, value: any) {
            if (this.globalSettings != null && this.globalSettings != undefined) {
                const newGlobalSettings: any = {}
                Object.assign(newGlobalSettings, this.globalSettings)
                newGlobalSettings[setting] = value
                this.updateGlobalSettings(newGlobalSettings)
            }
            // This shouldn't ever happen
            else {
                this.errorOcurred('Could not get current global settings')
            }
        }
        
    }</script>
