<template>
    <v-card>
        <v-card-title>Send Global Announcement</v-card-title>
        <v-card-subtitle>Announcements will be sent to all users as a notification</v-card-subtitle>
        <v-card-text>
            <v-text-field v-model="announcementText"
                          label="Announcement Text">
            </v-text-field>
            <v-row>
                <v-col>
                    <v-select :items="priorityChoices" label="Priority" v-model="priority"></v-select>
                </v-col>
                <v-col cols="7">
                    <v-row no-gutters>
                        <v-col class="pr-3">
                            <v-text-field v-model="expireAmount" label="Expiration"
                                          @input="onExpiresInput" :error-messages="errorText"
                                          :error="errorText != null"
                                          hint="The amount of time that the announcement will be shown to any user who logs in that hasn't seen it yet (default 12 hours)">
                            </v-text-field>
                        </v-col>
                        <v-col>
                            <v-select :items="timespanChoices" v-model="expireUnit"></v-select>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn color="green" @click="submitAnnouncement" :loading="submitLoading">
                Submit Announcement
                <template v-slot:loader v-if="submitComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter, Mutation, } from 'vuex-class';
    import { Settings } from '@/store/modules/team/types';
    import { PriorityEnum } from '@/store/modules/user/types';

    @Component({
      components: {
        },
    })

    export default class GlobalAnnouncements extends Vue{
        @Action('sendBroadcastNotification', { namespace: 'user' }) sendBroadcastNotification: CallableFunction

        announcementText: string = ''
        priority: string = 'Medium'
        priorityChoices = Object.keys(PriorityEnum)
        expireAmount: string = ''
        expireUnit: string = 'Minutes'
        timespanChoices: Array<string> = ['Seconds', 'Minutes', 'Hours']
        submitLoading: boolean = false
        submitComplete: boolean = false
        errorText: string | null = null

        async submitAnnouncement(){
            const now = new Date()
            const rawInput = Number.parseInt(this.expireAmount)
            if (Number.isNaN(rawInput)){
                this.errorText = 'You must enter a number'
                return
            }
            var expireDate = undefined;
            if (this.expireUnit == 'Seconds'){
                expireDate = new Date(now.getTime() + rawInput*1000)
            }
            if (this.expireUnit == 'Minutes'){
                expireDate = new Date(now.getTime() + rawInput*60000)
            }
            else {
                expireDate = new Date(now.getTime() + rawInput*3600000)
            }
            this.submitLoading = true
            const result = await this.sendBroadcastNotification({
                expires: expireDate.toISOString(),
                priority: this.priority.toLowerCase(),
                notificationText: this.announcementText
            })
            if (result) {
                this.submitComplete = true
                await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
                this.submitComplete = false
            }
            this.submitLoading = false
        }

        onExpiresInput(){
            this.errorText = null
        }
    }
</script>
