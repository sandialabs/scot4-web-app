<template>
    <v-app-bar app absolute clipped-left id="ScotAppBar" :height=60>
        <router-link to="/">
            <v-img width="50px" src="@/assets/scot-logo.png"></v-img>
        </router-link>
        <v-tabs class="mt-n4"
                id="NavBarTabs"
                hide-slider
                optional>
            <v-menu offset-y
                    v-for="tab in tabs"
                    :key="tab.tabName"
                    style="color: inherit">
                <template v-slot:activator="{ on, attrs }">
                    <v-tab :key=tab.tabName
                           :id=tab.tabName
                           v-bind="attrs"
                           v-on="on"
                           :class="{'grey lighten-1': routeMatches($route.path, tab) && !$vuetify.theme.dark, 'grey darken-3': routeMatches($route.path, tab) && $vuetify.theme.dark}">
                        <v-container :class="{'pb-0': routeMatches($route.path, tab)}">
                            <v-row no-gutters>
                                <v-col>
                                    {{ tab.tabName }}
                                    <v-icon right>
                                        mdi-menu-down
                                    </v-icon>
                                </v-col>
                            </v-row>
                            <v-row no-gutters v-if="routeMatches($route.path, tab)" class="text-caption mt-n2"><v-col>{{ subTabForRoute(routeMatches($route.path, tab), tab) }}</v-col></v-row>
                        </v-container>
                    </v-tab>
                </template>

                <v-list :class="{'grey lighten-3': !$vuetify.theme.dark, 'grey darken-4': $vuetify.theme.dark}">
                    <router-link v-for="(item, index) in tab.subTabs"
                                 :to="tab.routes[index]"
                                 :key="item"
                                 :id="item"
                                 custom
                                 v-slot="{ href, isActive }">
                        <v-list-item :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}"
                                        :href="href">
                            {{ item }}
                        </v-list-item>
                    </router-link>
                </v-list>
            </v-menu>
            <router-link to="/team/calendar"
                         v-slot="{ isActive }">
                <v-tab v-if="currentIH != undefined && currentIH.length > 1" to="/team/calendar" id="calendarTab"
                       :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                    Incident Handlers: <br>
                    {{currentIH[0].username}} <br>
                    {{currentIH[1].username}}
                </v-tab>
                <v-tab v-else-if="currentIH != undefined && currentIH.length > 0" to="/team/calendar" id="calendarTab"
                       :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                    Incident Handler: {{currentIH[0].username}}
                </v-tab>
                <v-tab v-else to="/team/calendar" id="calendarTab"
                       :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                    Incident Handler: &lt;None&gt;
                </v-tab>
            </router-link>
        </v-tabs>


        <v-chip v-if="globalSettings.environment_level" label style="overflow: inherit">
            {{globalSettings.environment_level}}
        </v-chip>


        <v-text-field hide-details
                      prepend-icon="mdi-magnify"
                      @keydown="onSearchKeyDown"
                      v-model="searchInput"
                      :loading="currentlySearching"
                      :append-icon="clearSearchIcon"
                      @click:append="onClearSearchResults"
                      single-line></v-text-field>

        <v-btn @click="settingsButtonClicked()" icon>
            <v-icon>mdi-cog</v-icon>
        </v-btn>


        <v-menu v-if="notifications != undefined" offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-badge overlap class="mt-2" :value="unAckdNotifications >0 && ackingNotifications == false" :content=" unAckdNotifications > 0 ? unAckdNotifications: null">
                    <v-btn @click="onAckNotifications" v-on="on" v-bind="attrs" class="mr-n2 mt-n2" icon>
                        <v-icon>mdi-bell</v-icon>
                    </v-btn>
                </v-badge>
            </template>
            <v-list v-if="notifications.length > 0">
                <v-list-item v-for="notification in notifications" :key="notification.id">
                    <v-list-item-content>
                        <v-list-item-title>
                            {{ notification.message }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-divider />
            </v-list>
            <v-list v-else>
                <v-list-item ß>
                    <v-list-item-content>
                        <v-list-item-title>
                            No New Notifications
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
        <v-btn v-else icon>
            <v-icon>mdi-bell</v-icon>
        </v-btn>
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on">
                    <v-icon>mdi-help-circle</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item target="_blank" :link="true" :href="apiDocsLink()">
                    <v-list-item-icon>
                        <v-icon>mdi-api</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>
                            API Docs
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <ScotExternalLinks></ScotExternalLinks>
            </v-list>
        </v-menu>

        <v-menu offset-y v-if="currentUser != undefined">
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on">
                    <v-icon id="userIcon">mdi-account</v-icon>
                </v-btn>
            </template>
            <v-list>
                <router-link to="/profile" custom v-slot="{ href }">
                    <v-list-item :href="href">
                        <v-list-item-content>
                            <v-list-item-title>
                                {{ currentUser.fullname }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                                @{{ currentUser.username }}
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </router-link>
                <v-divider />
                <router-link v-if="currentUser.is_superuser == true" to="/admin" custom v-slot="{ href }">
                    <v-list-item id="adminButton" :href="href">
                        <v-list-item-content>
                            <v-list-item-title>
                                Administration
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </router-link>
                <v-divider v-if="currentUser.is_superuser == true" />
                <v-list-item id="logoutButton" link @click="logout()">
                    <v-list-item-content>
                        <v-list-item-title>
                            Logout
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>

    </v-app-bar>
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class';
import { User, Notification } from '@/store/modules/user/types'
import { Settings } from '../../store/modules/team/types';
import ScotExternalLinks from '@/components/NavigationComponents/ScotExternalLinks.vue'

const namespace: string = 'user';

@Component({
  components: {
        ScotExternalLinks
    },
})

export default class ScotNavBar extends Vue{
@Action('settingsButtonClicked', { namespace }) settingsButtonClicked: any;
@Action('logout', { namespace }) logoutAction: CallableFunction
@Action('clearSelectedElement', { 'namespace': 'IRElements' }) clearIRElement: CallableFunction
@Action('getCurrentIH', { 'namespace': 'team' }) getCurrentIH: CallableFunction
@Action('retrieveGlobalSettings', { 'namespace': 'team' }) retrieveGlobalSettings: CallableFunction
@Getter('currentIH', { 'namespace': 'team'}) currentIH: Array<any>
@Getter('currentUser', { namespace }) currentUser: User
@Getter('globalSettings', { 'namespace': 'team' }) globalSettings: Settings
@Getter('isLoggedIn', { namespace }) isLoggedIn: boolean
@Action('searchText', { namespace}) searchText: CallableFunction
@Getter('searchResults', { namespace }) searchResults: any 
@Action('clearSearchResults', { namespace }) clearSearchResults: CallableFunction
@Action('changeShowSearchOverlay', { namespace }) changeShowSearchOverlay: CallableFunction
@Action('ackNotifications', { namespace }) ackNotifications: CallableFunction

@Getter('notifications', { namespace }) notifications: Array<Notification>
@Getter('unAckdNotifications', { namespace }) unAckdNotifications: number

responseItems: Array<string> = ["Alertgroups", "Events", "Incidents"]
threatItems: Array<string> = ["Dispatches", "Intels", "Products", "Feeds", "Entities"]
toolItems: Array<string> = ["Tasks", "Signatures", "Guides", "Pivots", "Entity Classes"]
vulnerabilityItems: Array<string> = ["Vuln Feed", "Vuln Track"]
accountItems:Array<string> = ["Logout"]
tabs: Array<any> = [
    { tabName: "Response", subTabs: this.responseItems, routes: this.responseItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
    { tabName: "Threat", subTabs: this.threatItems, routes: this.threatItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
    { tabName: "Vulnerability", subTabs: this.vulnerabilityItems, routes: this.vulnerabilityItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
    { tabName: "Tools", subTabs: this.toolItems, routes: this.toolItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
]


searchResultsExists = false
 

clearSearchIcon: string |undefined = ""
settings: boolean = false
currentPage: string | null = null
notificationsMenuDisplayed: boolean = false
ackingNotifications: boolean = false 
async onAckNotifications(){
  if (this.notificationsMenuDisplayed == true){
      this.ackingNotifications = true
      await this.ackNotifications({notifications: this.notifications})
      this.ackingNotifications = false
  }
  this.notificationsMenuDisplayed = !this.notificationsMenuDisplayed

}

async logout(){
  this.$router.push('/login').catch((err:any) => {return})
  await this.clearIRElement()
  await this.logoutAction()
}

routeMatches(route: string, tab: any) {
    for (const tabRoute of tab.routes) {
        if (route.startsWith(tabRoute)) {
            return tabRoute
        }
    }
    return null
}

searchInput: string | undefined = ""
currentlySearching: boolean = false
apiDocsLink(){
  return process.env.VUE_APP_API_BASE.replace('/v1', '/docs')
}
subTabForRoute(route: string, tab: any) {
    const idx = tab.routes.indexOf(route)
    return tab.subTabs[idx]
}

async onClearSearchResults(){
  if (this.currentlySearching === false){
    await this.clearSearchResults()
    this.searchResultsExists = false
    this.clearSearchIcon = undefined
    this.searchInput = ""
  }
}

async onSearchKeyDown(e:KeyboardEvent){
  if(e.key === 'Enter' && this.currentlySearching === false){
    this.currentlySearching = true
    await this.searchText({searchText: this.searchInput})
    this.currentlySearching = false
    this.changeShowSearchOverlay({value: true})
    this.clearSearchIcon = "mdi-close"
  }

}

async mounted() {
    if (this.isLoggedIn) {
        await this.getCurrentIH()
        await this.retrieveGlobalSettings()
    }
}

@Watch('isLoggedIn')
async loggedInChanged(newVal: boolean) {
    if (newVal) {
        await this.getCurrentIH()
        await this.retrieveGlobalSettings()
    }
}

}
</script>
<style scoped>

.v-app-bar-title__content{
  width: 200px !important
}

/* Override "primary" color to make selections look nicer */
.v-application .theme--light .primary--text .v-tab {
    color: #2c3e50;
}

.v-application .theme--dark .primary--text .v-tab {
    color: #adbfd2;
}

em{
  background-color: yellow;
}

</style>
