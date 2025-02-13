<template>
    <v-card>
        <v-card-title>Preferences</v-card-title>
        <v-card-text>
            <span v-for="pref in enabledPrefs" :key="pref">
                <v-switch v-if="typeof(currentUserPreferences[pref] || prefDefaults[pref]) === 'boolean'"
                          :value="currentUserPreferences[pref] || prefDefaults[pref]"
                          :label="prefPrettyNames[pref]"
                          :hint="prefDescriptions[pref]"
                          persistent-hint
                          @change="updatePreference(pref, $event)"></v-switch>
                <v-text-field v-else class="mt-4"
                          :value="currentUserPreferences[pref] || prefDefaults[pref]"
                          :label="prefPrettyNames[pref]"
                          :hint="prefDescriptions[pref]"
                          @change="updatePreference(pref, $event)"></v-text-field>
            </span>
        </v-card-text>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class'

    const namespace: string = "user"

    @Component({
    })
    export default class UserProfile extends Vue {
        @Getter('currentUserPreferences', { namespace }) currentUserPreferences: Record<string, any> | undefined
        @Action('updateUserPreferences', { namespace }) updateUserPreferences: CallableFunction

        enabledPrefs = ['darkMode', 'showPopularity']
        prefPrettyNames = {
            'darkMode': 'Dark Mode',
            'inboxView': 'Inbox View',
            'testPref': 'Test Preference',
            'showPopularity': 'Display Popularity'
        }
        prefDescriptions = {
            'darkMode': 'Whether or not to enable the alternate dark color scheme',
            'inboxView': 'Whether or not to enable the experimental inbox view on various response screens',
            'testPref': 'This is a test preference that does nothing',
            'showPopularity': 'Enable to display popularity counts and voting buttons in tables and on entries'
        }
        prefDefaults = {
            'darkMode': false,
            'inboxView': false,
            'showPopularity': false
        }

        async updatePreference(pref: string, value: any) {
            if (this.currentUserPreferences != null && this.currentUserPreferences != undefined) {
                const newUserPreferences: any = {}
                Object.assign(newUserPreferences, this.currentUserPreferences)
                newUserPreferences[pref] = value
                this.updateUserPreferences({ newUserPreferences: newUserPreferences })
            }
            else {
                const userPreferences = { [pref]: value }
                this.updateUserPreferences({ newUserPreferences: userPreferences })
            }
        }
    }
</script>