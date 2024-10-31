<template>
<v-row class="fill-height">
    <v-col>
      <v-sheet height="64">
        <v-toolbar
          flat
        >
          <v-btn
            outlined
            class="mr-4"
            color="grey darken-2"
            @click=goBackToToday
          >
            Today
          </v-btn>
          <v-btn
            fab
            text
            small
            @click=changeMonth(-1)
            color="grey darken-2"
          >
            <v-icon small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            fab
            text
            small
            @click=changeMonth(1)
            color="grey darken-2"
          >
            <v-icon small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
           <v-toolbar-title>
            {{ currentMonth }} {{ currentYear }}
          </v-toolbar-title>
        </v-toolbar>
          </v-sheet>
    <v-sheet height="85vh">
      <v-calendar
        ref="calendar"
        type="month"
        event-end="end_date"
        event-start="start_date"
        event-name="username"
        event-category="position"
        :event-color="getEventColor"
        :events=calendarEvents
        :start=startDate
        :end=endDate
        @click:event="eventClick"
        @click:date="dayClick"
        @click:day="dayClick"
      ></v-calendar>
      <v-dialog max-width="600px"
                v-model="dialogOpen">
          <v-card>
              <v-card-title v-if="dialogEdit">Edit Incident Handler</v-card-title>
              <v-card-title v-if="!dialogEdit">Add Incident Handler</v-card-title>
              <v-card-text v-if="dialogEvent">
                  <v-date-picker range full-width show-adjacent-months :value="getDateRange(dialogEvent)" @input="onDatePickerInput">
                  </v-date-picker>
                  <v-text-field label="Start" :value="formatDateString(dialogEvent.start_date)" @change="startDateFieldChanged"></v-text-field>
                  <v-text-field label="End" :value="formatDateString(dialogEvent.end_date)" @change="endDateFieldChanged"></v-text-field>
                  <v-select v-model="dialogEvent.username" :items="usernames" label="User"></v-select>
                  <v-combobox :items="positionChoices" label="Position" v-model="dialogEvent.position"></v-combobox>
              </v-card-text>
              <v-card-actions>
                  <v-btn color="green" :loading="dialogSaveLoading" @click="dialogSubmit">
                      {{ dialogEdit ? 'Save Changes' : 'Create' }}
                  </v-btn>
                  <v-btn @click="dialogOpen = false">
                      Cancel
                  </v-btn>
                  <v-btn v-if="dialogEdit" color="red" :loading="dialogDeleteLoading" @click="dialogDelete">
                      Delete
                  </v-btn>
              </v-card-actions>
          </v-card>
      </v-dialog>
    </v-sheet>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';

const namespace: string = 'team';

@Component
export default class IRCalendarComponent extends Vue{
@Action('retrieveCalendarEvents', { namespace }) retrieveCalendarEvents: CallableFunction
@Action('retrieveAllUsernames', { namespace }) retrieveAllUsernames: CallableFunction
@Action('createCalendarEvent', { namespace }) createCalendarEvent: CallableFunction
@Action('updateCalendarEvent', { namespace }) updateCalendarEvent: CallableFunction
@Action('deleteCalendarEvent', { namespace }) deleteCalendarEvent: CallableFunction
@Action('getCurrentIH', { 'namespace': 'team' }) getCurrentIH: CallableFunction
@Getter('calendarEvents', { namespace }) calendarEvents: Array<any>
@Getter('usernames', { namespace }) usernames: Array<string>

dialogOpen: boolean = false
dialogEdit: boolean = false
dialogEvent: any | null = null
dialogSaveLoading = false
dialogDeleteLoading = false
currentMonth: string = ""
startRange: string =""
endRange: string = ""
currentYear: number = 0
currentMonthNumber:number = 0
startDate: Date|string = "1970-01-01"
endDate: Date|string = "1970-02-01"
monthNames: Array<string> = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
positionChoices: Array<string> = ["Incident Handler", "Hunter"]

async mounted():Promise<any>{
    var date = new Date()
    this.currentYear = date.getFullYear()
    this.currentMonthNumber = date.getMonth()
    this.currentMonth =  new Date().toLocaleString('default', { month: 'long' });
    this.startDate = new Date(date.getFullYear(), date.getMonth(), 1)
    // Adjust start date to the first day of the week that the day is in
    const adjustedStartDate = new Date(this.startDate.valueOf() - (this.startDate.getDay() * 24 * 60 * 60 * 1000))
    this.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    // Adjust end date to the last day of the week that the day is in
    const adjustedEndDate = new Date(this.endDate.valueOf() + ((6 - this.endDate.getDay()) * 24 * 60 * 60 * 1000))
    this.startRange = adjustedStartDate.toISOString();
    this.endRange = adjustedEndDate.toISOString();
    await this.retrieveCalendarEvents({ startRange: this.startRange, endRange: this.endRange })
    await this.retrieveAllUsernames()
}

async goBackToToday():Promise<any>{
    var date = new Date()
    this.currentYear = date.getFullYear()
    this.currentMonthNumber = date.getMonth()
    this.currentMonth =  new Date().toLocaleString('default', { month: 'long' });
    this.startDate = new Date(date.getFullYear(), date.getMonth(), 1)
    // Adjust start date to the first day of the week that the day is in
    const adjustedStartDate = new Date(this.startDate.valueOf() - (this.startDate.getDay() * 24 * 60 * 60 * 1000))
    this.endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
    // Adjust end date to the last day of the week that the day is in
    const adjustedEndDate = new Date(this.endDate.valueOf() + ((6 - this.endDate.getDay()) * 24 * 60 * 60 * 1000))
    this.startRange = adjustedStartDate.toISOString();
    this.endRange = adjustedEndDate.toISOString();
    await this.retrieveCalendarEvents({startRange: this.startRange, endRange: this.endRange})
}

getEventColor(event:Record<any, any>):string{
    if(event.position == "Incident Handler"){
        return "green"
    }
    else{
        return "blue"
    }
}

async changeMonth(delta: number): Promise<any>{
    this.currentMonthNumber = this.currentMonthNumber + delta
    if (this.currentMonthNumber >= 12 || this.currentMonthNumber < 0) {
        this.currentYear += Math.floor(this.currentMonthNumber/12)
        this.currentMonthNumber = ((this.currentMonthNumber % 12) + 12) % 12 // modulo
    }
    this.currentMonth =  this.monthNames[this.currentMonthNumber]
    this.startDate = new Date(this.currentYear, this.currentMonthNumber, 1)
    // Adjust start date to the first day of the week that the day is in
    const adjustedStartDate = new Date(this.startDate.valueOf() - (this.startDate.getDay() * 24 * 60 * 60 * 1000))
    this.startRange = adjustedStartDate.toISOString();
    this.endDate = new Date(this.currentYear, this.currentMonthNumber + 1, 0, 23, 59, 59, 999)
    // Adjust end date to the last day of the week that the day is in
    const adjustedEndDate = new Date(this.endDate.valueOf() + ((6 - this.endDate.getDay()) * 24 * 60 * 60 * 1000))
    this.endRange = adjustedEndDate.toISOString();
    await this.retrieveCalendarEvents({startRange: this.startRange, endRange: this.endRange})

}

formatDateString(date: Date) {
    return date.toLocaleDateString('en-CA') + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
}

getDateRange(event: any) {
    if (!event.start_date && !event.end_date) {
        return []
    }
    const start = event.start_date.toLocaleDateString('en-CA')
    const end = event.end_date.toLocaleDateString('en-CA')
    if (!event.start_date || start == end ) {
        return [end]
    }
    else if (!event.end_date) {
        return [start]
    }
    else {
        return [start, end]
    }
}

onDatePickerInput(input: Array<string>) {
    if (input.length == 0) {
        this.dialogEvent.start_date = null
        this.dialogEvent.end_date = null
    }
    else if (input.length == 1) {
        const dateParts = input[0].split('-') // Javascript's date parsing is frustrating
        this.dialogEvent.start_date = new Date(+dateParts[0], +dateParts[1]-1, +dateParts[2])
        this.dialogEvent.end_date = new Date(+dateParts[0], +dateParts[1]-1, +dateParts[2], 23, 59, 59)
    }
    else {
        const startParts = input[0].split('-') // Javascript's date parsing is frustrating
        const endParts = input[1].split('-')
        if (input[0] > input[1]) { // Normalize so start < end
            this.dialogEvent.start_date = new Date(+endParts[0], +endParts[1] - 1, +endParts[2])
            this.dialogEvent.end_date = new Date(+startParts[0], +startParts[1] - 1, +startParts[2], 23, 59, 59)
        }
        else {
            this.dialogEvent.start_date = new Date(+startParts[0], +startParts[1] - 1, +startParts[2])
            this.dialogEvent.end_date = new Date(+endParts[0], +endParts[1] - 1, +endParts[2], 23, 59, 59)
        }
    }
}

startDateFieldChanged(newValue: string) {
    this.dialogEvent.start_date = new Date(newValue)
}

endDateFieldChanged(newValue: string) {
    this.dialogEvent.end_date = new Date(newValue)
}

async eventClick(params: any, e: MouseEvent) {
    this.dialogEvent = { ...params.event }
    this.dialogEdit = true
    this.dialogOpen = true
    e.stopPropagation()
}

async dayClick(params: any, e: MouseEvent) {
    const startDate = new Date(params.year, params.month-1, params.day)
    const endDate = new Date(params.year, params.month-1, params.day, 23, 59, 59, 999)
    this.dialogEvent = {
        "start_date": startDate,
        "end_date": endDate,
        "username": null,
        "position": "Incident Handler"
    }
    this.dialogEdit = false
    this.dialogOpen = true
}

async dialogSubmit() {
    this.dialogSaveLoading = true
    let succeeded = false
    if (this.dialogEdit) {
        const updateData = {
            'start_date': this.dialogEvent.start_date,
            'end_date': this.dialogEvent.end_date,
            'username': this.dialogEvent.username,
            'position': this.dialogEvent.position
        }
        succeeded = await this.updateCalendarEvent({ id: this.dialogEvent.id, updateData })
    }
    else {
        succeeded = await this.createCalendarEvent(this.dialogEvent)
    }
    this.dialogSaveLoading = false
    if (succeeded) {
        this.dialogOpen = false
        await this.getCurrentIH()
    }
}

async dialogDelete() {
    this.dialogDeleteLoading = true
    const succeeded = await this.deleteCalendarEvent(this.dialogEvent.id)
    this.dialogDeleteLoading = false
    if (succeeded) {
        this.dialogOpen = false
        await this.getCurrentIH()
    }
}
}
</script>