<template>
    <v-row class="mt-4">
    <v-col class="ma-4 active-user-panel">
        <div class="text-h5 text-center">Active Users</div>
        <v-chip-group column class="active-user-group">
            <v-chip class="grey pr-0" label v-for="user in orderedUserActivityKeys()" :key="user">
                {{user}} <v-chip small :class="{'grey lighten-5 ml-1': !$vuetify.theme.dark, 'grey darken-4 ml-1': $vuetify.theme.dark}">{{userTimeString(userActivity[user])}}</v-chip>
            </v-chip>
        </v-chip-group>
    </v-col>
    <v-col>
        <div class="text-center text-h3 d-flex flex-column align-center">
            <span>Welcome to SCOT</span>
            <v-img src="@/assets/scot-logo.png" height="50%" max-height="300px" max-width="300px"></v-img>
        </div>
    </v-col>
    <v-col class="game-panel ma-4">
        <div class="text-h5 text-center">Leaderboard</div>
        <v-carousel class="game-carousel" cycle hide-delimiters hide-delimiter-background :show-arrows="false">
            <v-carousel-item v-for="result in gameResults" :key="result.name">
                <div class="text-h6 text-center">{{result.name}} - {{result.tooltip}}</div>
                <v-list class="game-carousel">
                    <v-list-item dense class="game-list-item" v-for="count, user, idx in result.results" :key="user">
                        <v-list-item-content class="pa-0">
                            <span class="text-body-1">
                                <span v-if="idx == 0">&#x1F947;</span>
                                <span v-if="idx == 1">&#x1F948;</span>
                                <span v-if="idx == 2">&#x1F949;</span>
                                {{user}}
                                <v-chip>{{count}}</v-chip>
                            </span>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-carousel-item>
        </v-carousel>
    </v-col>
    </v-row>
</template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
import { default_title } from '@/constants';
import { Action, Getter } from 'vuex-class';
@Component({
  components: {
    ScotNavBar
    },
})

export default class Landing extends Vue {
    @Getter('gameResults', { namespace: 'team' }) gameResults: Array<any>
    @Getter('userActivity', { namespace: 'team' }) userActivity: any
    @Action('retrieveGameResults', { namespace: 'team' }) retrieveGameResults: CallableFunction
    @Action('retrieveUserActivity', { namespace: 'team' }) retrieveUserActivity: CallableFunction

    intervalTimer: number = -1

    userTimeString(time: string) {
        const activeTime = new Date(time)
        const secDiff = Math.abs(new Date().getTime() - activeTime.getTime()) / 1000
        if (secDiff > 120) {
            return Math.round(secDiff / 60).toString() + " minutes"
        }
        else {
            return Math.round(secDiff).toString() + " seconds"
        }
    }

    orderedUserActivityKeys() {
        return Object.keys(this.userActivity).sort((a: string, b: string) => (this.userActivity[b] > this.userActivity[a]) ? 1 : ((this.userActivity[a] > this.userActivity[b]) ? -1 : 0))
    }

    async mounted() {
        document.title = default_title
        this.retrieveGameResults()
        this.retrieveUserActivity()
        this.intervalTimer = setInterval(this.retrieveUserActivity, 30000)
    }

    destroyed() {
        clearInterval(this.intervalTimer)
    }
}
</script>

<style>
    .game-list-item {
        align-content: center;
        text-align: center;
    }

    .theme--light .game-panel {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .theme--dark .active-user-panel {
        background-color: rgb(40, 40, 40);
        color: rgb(250, 250, 250);
    }

    .theme--light .active-user-panel {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .theme--dark .game-panel {
        background-color: rgb(40, 40, 40);
        color: rgb(250, 250, 250);
    }

    .game-panel {
        padding: 12px;
        height: 50%;
        max-height: 300px;
        border-radius: 8px;
    }

    .active-user-panel {
        padding: 12px;
        height: 50%;
        border-radius: 8px;
    }

    .game-carousel {
        max-height: 200px;
    }

    .theme--light .game-carousel {
        background-color: rgb(250, 250, 250) !important;
    }

    .theme--dark .game-carousel {
        background-color: rgb(30, 30, 30);
    }

    .active-user-group .v-slide-group__content {
        justify-content: center;
    }
</style>
