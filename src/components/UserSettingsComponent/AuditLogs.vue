<template>
    <v-card flat>
        <v-card-title>Audit Logs</v-card-title>
        <v-card-text>
            <v-form>
                <v-row>
                    <v-col>
                        <v-select v-model="user"
                                  :disabled="!currentUser.is_superuser"
                                  :items="usernames"
                                  label="Username"
                                  @change="retrieveAudits"
                                  multiple
                                  clearable></v-select>
                    </v-col>
                    <v-col>
                        <v-menu v-model="dateRangeMenu"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                max-width="290px"
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field :value="formatDateRange(dateRange)"
                                              label="Date Range"
                                              hint="YYYY-MM-DD HH:MM ~ YYYY-MM-DD HH:MM 24h format"
                                              persistent-hint
                                              clearable
                                              prepend-icon="mdi-calendar"
                                              v-bind="attrs"
                                              @input="dateRangeFieldChanged"
                                              v-on="on"></v-text-field>
                            </template>
                            <v-date-picker :value="getDateRangeStrings(dateRange)"
                                           @input="onDatePickerInput"
                                           range
                                           no-title></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col>
                        <v-select v-model="logType"
                                  label="Log Type"
                                  :items="auditTypeChoices"
                                  @change="retrieveAudits"
                                  multiple
                                  clearable></v-select>
                    </v-col>
                    <v-col>
                        <v-select v-model="thingType"
                                  :items="objectTypeChoices"
                                  label="Object Type"
                                  @change="retrieveAudits"
                                  clearable></v-select>
                    </v-col>
                    <v-col>
                        <v-text-field v-model="thingId"
                                      label="Object ID"
                                      @change="retrieveAudits"></v-text-field>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
        <v-data-table :headers="auditColumns"
                      :items="auditEntries"
                      :single-select=true
                      :items-per-page="auditsPerPage"
                      width="100%"
                      dense
                      show-expand
                      single-expand
                      :loading=retrievingAudits
                      :server-items-length=totalAuditCount
                      :sort-by="sortBy"
                      :sort-desc="sortDesc"
                      :page="page"
                      @update:page=onPageChange
                      @update:items-per-page=onLimitChange
                      @update:sort-by="sortColumnChanged"
                      @update:sort-desc="sortDescChanged"
                      :footer-props="{'items-per-page-text': 'audits per page', 'items-per-page-options':[25,50,100], 'show-first-last-page':true, 'show-current-page':true }">
            <template v-slot:[`item.when_date`]="{ header, item }">
                <span v-if="$vuetify.breakpoint.xl" class="no-line-breaks">
                    {{ transformDateString(item[header.value])['date'] }} {{ transformDateString(item[header.value])['time'] }}
                </span>
                <span v-else class="no-line-breaks">
                    {{ transformDateString(item[header.value])['date'] }}<br />{{ transformDateString(item[header.value])['time'] }}
                </span>
            </template>
            <template v-slot:[`item.user_agent`]="{ header, item }">
                <span class="ellipsis-hide">
                    {{ item[header.value] }}
                </span>
            </template>
            <template v-slot:expanded-item="{ headers, item }">
                <td :colspan="headers.length">
                    <span v-if="item.what.startsWith('delete') && item.thing_type != 'permission'">
                        <v-btn v-if="currentUser.is_superuser" small class="ma-1" @click="deleteDialog = true, selectedItem = item">Delete Permanently</v-btn>
                        <v-btn small class="ma-1" @click="undeleteDialog = true, selectedItem = item">Undelete</v-btn>
                        <br />
                    </span>
                    <span v-if="JSON.stringify(item.audit_data).length > 130 && !item.showmore" class="ellipsis-hide">
                        {{ item.audit_data }}
                        <br /><a @click="showMoreClicked(item)">Show More</a>
                    </span>
                    <span v-else>
                        {{ item.audit_data }}
                    </span>
                </td>
            </template>
        </v-data-table>
        <v-dialog max-width="400px"
                  v-model="deleteDialog">
            <v-card>
                <v-card-title>Delete Permanently</v-card-title>
                <v-card-text v-if="selectedItem">
                    <p>
                        Are you sure you want to permanently delete the record for {{ selectedItem.thing_type }} {{ selectedItem.thing_id }}?
                        This will prevent this information from being undeleted in the future.
                        <b>This action cannot be undone.</b>
                    </p>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="red" :loading="deleteLoading"
                           @click="confirmDelete(selectedItem)">
                        Delete
                    </v-btn>
                    <v-btn @click="deleteDialog = false">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog max-width="400px"
                  v-model="undeleteDialog">
            <v-card>
                <v-card-title>Undelete Item</v-card-title>
                <v-card-text v-if="selectedItem">
                    <p>
                        Are you sure you want to undelete {{ selectedItem.thing_type }} {{ selectedItem.thing_id }}?
                        This will restore it and any of its entries. If the box below is checked, it will also be restored with its
                        original id (otherwise, a new object is created with a new id).
                    </p>
                    <v-checkbox label="Keep Original IDs" v-model="undeleteKeepId"></v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-btn color="green" :loading="undeleteLoading"
                           @click="confirmUndelete(selectedItem, undeleteKeepId)">
                        Undelete
                    </v-btn>
                    <v-btn @click="undeleteDialog = false">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class'
    import { IRElementType } from '../../store/modules/IRElements/types'
    import { Audit } from '../../store/modules/team/types'
    import { User } from '../../store/modules/user/types'
    import { convertToSnakeCase, convertFromSnakeCase } from '../../utils/elementUtils'

    const namespace: string = 'team'

    @Component({
    })
    export default class UserProfile extends Vue {
        @Getter('currentUser', { namespace: 'user' }) currentUser: User
        @Getter('usernames', { namespace }) usernames: Array<string>
        @Getter('auditEntries', { namespace }) auditEntries: Array<Audit>
        @Getter('totalAuditCount', { namespace }) totalAuditCount: number
        @Action('retrieveAllUsernames', { namespace }) retrieveAllUsernames: CallableFunction
        @Action('retrieveAuditsWithFilter', { namespace }) retrieveAuditsWithFilter: CallableFunction
        @Action('deleteAudit', { namespace }) deleteAudit: CallableFunction
        @Action('undeleteElement', { namespace: 'IRElements' }) undeleteElement: CallableFunction

        auditTypeChoices: Array<string> = ["create", "read", "update", "delete", "login", "undelete"]
        objectTypeChoices: Array<string> = []
        auditColumns = [
            { 'text': "ID", 'value': "id", "align": "left", "width": "7em" },
            { 'text': "Time", 'value': "when_date", "align": "left", "width": "1%"},
            { 'text': "Username", 'value': "username", "align": "left", "width": "10em" },
            { 'text': "Action", 'value': "what", "align": "left", "width": "14em" },
            { 'text': "Object Type", 'value': "thing_type", "align": "left", "width": "10em" },
            { 'text': "Object ID", 'value': "thing_id", "align": "left", "width": "9em" },
            { 'text': "Source IP", 'value': "src_ip", "align": "left", "width": "11em" },
            { 'text': "User Agent", 'value': "user_agent", "align": "left", "width": "" },
        ]

        user: Array<string> = []
        dateRange: Array<Date> = []
        logType: Array<string> = []
        thingType: IRElementType | null = null
        thingId: number | null = null

        auditAbortController: AbortController | null = null
        undeleteDialog: boolean = false
        undeleteLoading: boolean = false
        undeleteKeepId: boolean = true
        deleteDialog: boolean = false
        deleteLoading: boolean = false
        dateRangeMenu = false
        selectedItem: any = null
        auditsPerPage: number = 25
        retrievingAudits: boolean = false
        sortBy?: string = "id"
        sortDesc: boolean = true
        sortInProgress: boolean = false
        page: number = 1

        async mounted() {
            this.retrieveAllUsernames()
            this.objectTypeChoices = Object.values(IRElementType)
            if (!this.currentUser.is_superuser) {
                this.user = [this.currentUser.username]
            }
            await this.retrieveAudits()
        }

        async showMoreClicked(item: any) {
            Vue.set(item, "showmore", true)
        }

        dataWillOverflow(item: any) {
            return JSON.stringify(item.audit_data).length > 100
        }

        transformDateString(dateString: string) {
            const date: any = new Date(dateString)
            const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
            return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
        }

        generateFilterDict() {
            var when_date;
            if (this.dateRange.length != 0) {
                if (this.dateRange.length == 2) {
                    when_date = `(${this.dateRange[0].toISOString()}, ${this.dateRange[1].toISOString()})`
                }
                else {
                    when_date = `[${this.dateRange.map(i => i.toISOString()).toString()}]`
                }
            }
            var what;
            if (this.logType.length != 0) {
                what = `[${this.logType.toString()}]`
            }

            const filterDict = {
                skip: (this.page - 1) * this.auditsPerPage,
                limit: this.auditsPerPage,
                sort: this.sortBy == undefined ? undefined : ((this.sortDesc ? "-" : "") + this.sortBy),
                when_date: when_date,
                who: this.user,
                what: what,
                thing_type: this.thingType ? convertToSnakeCase(this.thingType) : undefined,
                thing_id: this.thingId || undefined,
                abortController: this.auditAbortController
            }
            return filterDict
        }

        async retrieveAudits() {
            this.retrievingAudits = true
            const newAbortController = new AbortController()
            if (this.auditAbortController) {
                this.auditAbortController.abort()
            }
            this.auditAbortController = newAbortController
            await this.retrieveAuditsWithFilter(this.generateFilterDict())
            if (this.auditAbortController == newAbortController) {
                this.auditAbortController = null
            }
            this.retrievingAudits = false
        }

        async confirmUndelete(item: any, keepId: boolean) {
            this.undeleteLoading = true
            const parameters = {
                elementId: item.thing_id,
                elementType: IRElementType[convertFromSnakeCase(item.thing_type) as keyof typeof IRElementType],
                keep_id: keepId
            }
            const success = this.undeleteElement(parameters)
            if (success) {
                this.retrieveAudits()
                this.undeleteDialog = false
                this.selectedItem = null
            }
            this.undeleteLoading = false
        }

        async confirmDelete(item: any) {
            this.deleteLoading = true
            const success = await this.deleteAudit(item.id)
            if (success) {
                this.deleteDialog = false
                this.selectedItem = null
            }
            this.deleteLoading = false
        }

        formatDateString(date: Date) {
            if (!date) {
                return ""
            }
            return date.toLocaleDateString('en-CA') + ' ' + date.getHours() + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
        }

        dateRangeFieldChanged(newValue: string) {
            if (newValue == null) {
                Vue.set(this, "dateRange", [])
                this.retrieveAudits()
                return
            }
            const dates = newValue.split('~', 2).map((d) => d.trim().split(" ")[0])
            const times = newValue.split('~', 2).map((d) => d.trim().split(" ")[1])
            const hours = times.map((t) => t?.trim().split(":")[0])
            const minutes = times.map((t) => t?.trim().split(":")[1])
            const newDateRange = this.parseStringDateRange(dates)
            if (newDateRange.length == 0) {
                Vue.set(this, "dateRange", [])
                this.retrieveAudits()
            }
            else if (newDateRange.length == 2 && hours.length == 2 && minutes.length == 2 && hours.every((h) => h) && minutes.every((m) => m)) {
                newDateRange[0].setHours(+hours[0]!)
                newDateRange[0].setMinutes(+minutes[0]!)
                newDateRange[1].setHours(+hours[1]!)
                newDateRange[1].setMinutes(+minutes[1]!)
                Vue.set(this.dateRange, "0", newDateRange[0])
                Vue.set(this.dateRange, "1", newDateRange[1])
                this.retrieveAudits()
            }
        }

        formatDateRange(dateRange: Array<Date>) {
            if (dateRange.length == 0) {
                return ""
            }
            else {
                return this.formatDateString(dateRange[0]) + ' ~ ' + this.formatDateString(dateRange[1]) 
            }
        }

        getDateRangeStrings(dateRange: any) {
            if (dateRange.length == 0) {
                return []
            }
            if (dateRange.length == 1) {
                return [dateRange[0].toLocaleDateString('en-CA')]
            }
            else {
                const start = dateRange[0].toLocaleDateString('en-CA')
                const end = dateRange[1].toLocaleDateString('en-CA')
                if (start == end) {
                    return [start]
                }
                else {
                    return [start, end]
                }
            }
        }

        parseStringDateRange(input: Array<string>) {
            var newDateRange: Array<Date> = []
            if (input.length == 0) {
                newDateRange = []
            }
            else if (input.length == 1) {
                const dateParts = input[0].split('-') // Javascript's date parsing is frustrating
                newDateRange[0] = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2])
                newDateRange[1] = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2], 23, 59, 59)
            }
            else {
                const startParts = input[0].split('-') // Javascript's date parsing is frustrating
                const endParts = input[1].split('-')
                if (input[0] > input[1]) { // Normalize so start < end
                    newDateRange[0] = new Date(+endParts[0], +endParts[1] - 1, +endParts[2])
                    newDateRange[1] = new Date(+startParts[0], +startParts[1] - 1, +startParts[2], 23, 59, 59)
                }
                else {
                    newDateRange[0] = new Date(+startParts[0], +startParts[1] - 1, +startParts[2])
                    newDateRange[1] = new Date(+endParts[0], +endParts[1] - 1, +endParts[2], 23, 59, 59)
                }
            }
            return newDateRange
        }

        onDatePickerInput(input: Array<string>) {
            this.dateRange = this.parseStringDateRange(input)
            this.retrieveAudits()
        }

        async onPageChange(page: number) {
            // Don't fire this if the change was made programmatically
            if (page != this.page) {
                this.page = page
                this.retrieveAudits()
            }
        }

        async onLimitChange(limit: number) {
            this.auditsPerPage = limit
            this.retrieveAudits()
        }

        async sortColumnChanged(column: string | undefined) {
            if (!this.retrievingAudits) {
                this.sortBy = column
                this.scheduleSort()
            }
        }

        async sortDescChanged(desc: boolean) {
            if (!this.retrievingAudits) {
                this.sortDesc = desc
                this.scheduleSort()
            }
        }

        // This is done asynchronously so that multiple sort events going off at once don't make multiple requests
        async scheduleSort() {
            if (!this.sortInProgress) {
                this.sortInProgress = true
                this.$nextTick(() => {
                    this.sortInProgress = false
                    this.retrieveAudits()
                })
            }
        }
    }
</script>
<style scoped>
    .v-data-table .ellipsis-hide {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        max-width: 70em;
        display: block;
    }

    .v-data-table .no-line-breaks {
        word-break: normal;
        overflow-wrap: normal;
        white-space: nowrap;
    }

    .scroll-container {
        max-height: 100%;
        display: flex;
        flex-direction: column;
    }

</style>