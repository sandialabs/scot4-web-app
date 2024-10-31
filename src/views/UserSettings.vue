<template>
    <v-container fluid class="scroll-container">
        <v-toolbar flat dark>
            <v-toolbar-title>User Settings</v-toolbar-title>
        </v-toolbar>

        <v-tabs vertical class="scrollable" v-model="tab">
            <v-tab>
                <v-icon left>
                    mdi-account
                </v-icon>
                User Profile
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-cog
                </v-icon>
                User Preferences
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-key
                </v-icon>
                API Keys
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-clipboard-text
                </v-icon>
                Data Management
            </v-tab>
            <v-tab>
                <v-icon left>
                    mdi-book-cog
                </v-icon>
                Default Permissions
            </v-tab>
            <v-tabs-items class="scrollable" v-model="tab">
                <v-tab-item>
                    <UserProfile></UserProfile>
                </v-tab-item>
                <v-tab-item>
                    <UserPreferences></UserPreferences>
                </v-tab-item>
                <v-tab-item>
                    <ApiKeys></ApiKeys>
                </v-tab-item>
                <v-tab-item>
                    <AuditLogs></AuditLogs>
                </v-tab-item>
                <v-tab-item>
                    <DefaultPermissions permission-type="user"></DefaultPermissions>
                </v-tab-item>
            </v-tabs-items>
        </v-tabs>
    </v-container>
</template>
<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import UserProfile from '@/components/UserSettingsComponent/UserProfile.vue'
    import UserPreferences from '@/components/UserSettingsComponent/UserPreferences.vue'
    import ApiKeys from '@/components/UserSettingsComponent/ApiKeys.vue'
    import AuditLogs from '@/components/UserSettingsComponent/AuditLogs.vue'
    import DefaultPermissions from '@/components/AdminComponents/DefaultPermissions.vue'
    import { default_title } from '@/constants'

    @Component({
        components: {
            UserProfile,
            UserPreferences,
            ApiKeys,
            AuditLogs,
            DefaultPermissions
        },
    })

    export default class UserSettingsView extends Vue {
        tab: string = ""

        mounted() {
            document.title = default_title
        }
    }
</script>

<style scoped>
    .scrollable {
        overflow-y: auto;
        max-height: 100%;
    }

    .scroll-container {
        max-height: 100%;
        display: flex;
        flex-direction: column;
    }
</style>
