<!-- App.vue -->
<template>
    <v-app>
        <ScotNavBar />
        <v-main style="max-height: 100vh">
            <QuickSettingsDrawer />
            <v-dialog v-if="searchResults != undefined" :value="showSearchOverlay">
                <v-card rounded :light="darkMode" :dark="!darkMode" v-click-outside="onClickOutsideOverlay" elevation="5">
                    <v-card-title class="text-decoration-underline">Search Results</v-card-title>
                    <v-card-subtitle> {{ searchResults.length }} results </v-card-subtitle>
                    <v-list two-line>
                        <v-list-item v-for="(result, index) in searchResults" :key="result.entry_id" :href="constructSearchLink(result.target_type, result.target_id, result.entry_id)" :link=true target="_blank">
                            <v-list-item-icon>
                                <v-icon> mdi-magnify</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title class="text-decoration-underline" v-html="result.target_type.charAt(0).toUpperCase() + result.target_type.slice(1) + ' ' + result.target_id + ' : ' + result.parent_text"></v-list-item-title>
                                <v-list-item-subtitle>
                                    <i>
                                        {{ "Entry " }}
                                        <b>{{  result.entry_id}} </b>
                                    </i>
                                </v-list-item-subtitle>
                                <v-list-item-subtitle v-html="result.entry_text">
                                </v-list-item-subtitle>
                                <v-divider inset
                                           v-if="index < searchResults.length - 1"
                                           :key="index"></v-divider>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-card>
            </v-dialog>
            <router-view>
            </router-view>
        </v-main>
        <v-footer app padless>
            <v-card elevation=0 width="100%" class="text-center">
                <v-card-text>
                </v-card-text>
            </v-card>
        </v-footer>
        <v-snackbar v-model="showErrorPopup"
                    multi-line>
            {{ errorText }}

            <template v-slot:action="{ attrs }">
                <v-btn color="red"
                       text
                       v-bind="attrs"
                       @click="showErrorPopup = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
    import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
    import { Action, Getter, Mutation } from 'vuex-class';
    import { Watch } from 'vue-property-decorator'
    import { IRElementType } from './store/modules/IRElements/types';

    @Component({
        components: {
            ScotNavBar,
            QuickSettingsDrawer
        },
    })
    export default class App extends Vue {

        @Getter('showQuickSettings', { 'namespace': 'user' }) showQuickSettings: boolean;
        @Getter('darkMode', { 'namespace': 'user' }) darkMode: boolean
        @Getter('firehose', { 'namespace': 'user' }) firehose: EventSource | undefined
        @Getter('error') error: boolean
        @Getter('searchResults', { 'namespace': 'user' }) searchResults: any
        @Action('clearSearchResults', { 'namespace': 'user' }) clearSearchResults: CallableFunction
        @Getter('errorText') errorText: string
        @Getter('showSearchOverlay', { 'namespace': 'user' }) showSearchOverlay: boolean
        @Action('changeShowSearchOverlay', { 'namespace': 'user' }) changeShowSearchOverlay: CallableFunction
        @Mutation('clearError') clearError: CallableFunction
        metaInfo() {
            return { meta: [{ "http-equiv": "Content-Security-Policy", "content": "upgrade-insecure-requests" }] }
        }

        showErrorPopup: boolean = false

        @Watch('showErrorPopup')
        errorSnackbarChange(newValue: boolean) {
            if (!newValue) {
                this.clearError()
            }
        }

        @Watch('error')
        errorChange(newVal: boolean) {
            if (newVal) {
                this.showErrorPopup = true
            }
        }

        constructSearchLink(targetType: string, targetId: number, entryId: number): string {
            return window.location.protocol + "//" + window.location.host + "/#/" + this.targetTypePluralized(targetType) + "/" + targetId + "/" + entryId
        }

        targetTypePluralized(targetType: string): string | null {
            if (targetType == IRElementType.Entity.toLowerCase()) {
                return "entities"
            }
            else if (targetType == IRElementType.Dispatch.toLowerCase()) {
                return "dispatches"
            }
            else if (targetType == IRElementType.EntityClass.toLowerCase()) {
                return "entity classes"
            }
            else if (targetType == IRElementType.Entry.toLowerCase()) {
                return "entries"
            }
            else {
                return targetType + "s"
            }
        }

        async onClickOutsideOverlay() {
            await this.changeShowSearchOverlay({ value: false })
        }

        @Watch('darkMode')
        onDarkModeChange() {
            this.$vuetify.theme.dark = this.darkMode
        }
        transitionName() {
            if (this.$route.meta && this.$route.meta.transitionName != undefined) {
                return this.$route.meta.transitionName
            }
            else {
                return "fast"
            }
        }
    }
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.theme--light.v-data-table {
    color: rgba(0, 0, 0, 1)
}

html {
    overflow: hidden;
    background-color: black;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: .25s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  
}

.fast-enter-active,
.fast-leave-active {
  transition-duration: .05s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fast-enter,
.fast-leave-active {
  opacity: 0
}

/* Fixes for splitpanes package when in dark mode */
.theme--dark .splitpanes.default-theme .splitpanes__pane {
    background-color: #121212;
}

.theme--dark .splitpanes.default-theme .splitpanes__splitter {
    background-color: #00000026;
}

.theme--dark .splitpanes.default-theme .splitpanes__splitter::before,
.theme--dark .splitpanes.default-theme .splitpanes__splitter::after {
    background-color: #fff;
}

.theme--dark .default-theme.splitpanes--horizontal > .splitpanes__splitter {
    border-top: 1px solid #121212;
}

.theme--dark .default-theme.splitpanes--vertical > .splitpanes__splitter {
    border-left: 1px solid #121212;
}
</style>
