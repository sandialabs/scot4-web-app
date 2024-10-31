<template>
<v-navigation-drawer
      :value="showQuickSettings"
      clipped
      right
      absolute
      temporary
      @input="onVisibleChanged"
    >
      <v-spacer></v-spacer>
        <v-list
      subheader
    >
      <v-subheader>Display</v-subheader>

      <v-list-item>
      <v-switch
      v-model="darkModeSwitch"
      label="Dark Mode"
      @change="onDarkModeChange"
        ></v-switch>        
    
      </v-list-item>
    <v-divider></v-divider>


    <v-list
      flat
      subheader
      three-line
    >
      <v-subheader>Interactions</v-subheader>

      <v-list-item-group
        v-model="settings"
        multiple
        active-class=""
      >
        <v-list-item>
          <template v-slot:default="{ active }">
            <v-list-item-action>
              <v-checkbox :input-value="active"></v-checkbox>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title>Browser Notifications</v-list-item-title>
              <v-list-item-subtitle>Notify me about updates</v-list-item-subtitle>
            </v-list-item-content>
          </template>
        </v-list-item>
   
      </v-list-item-group>
    </v-list>
      <v-divider></v-divider>
        <v-list-item>
            <v-list-item-content>
              <v-list-item-title> <v-btn to="/profile"> Full Settings </v-btn></v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-list>
    </v-navigation-drawer>
   
    </template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import { Action, Getter, } from 'vuex-class';
const namespace: string = 'user';
@Component({
  components: {
    },
})

export default class QuickSettingsDrawer extends Vue{
@Getter('showQuickSettings', { namespace }) showQuickSettings: boolean;
@Getter('currentUserPreferences', { namespace }) currentUserPreferences: Record<string, any>|undefined
@Getter('inboxView', { namespace }) inboxView: boolean
@Getter('darkMode', { namespace }) darkMode: boolean
@Action('settingsButtonClicked', { namespace }) settingsButtonClicked: CallableFunction
@Action('updateUserPreferences', { namespace }) updateUserPreferences: CallableFunction;

// Need this for when settings drawer is closed by clicking outside of it
async onVisibleChanged(newValue: boolean) {
    if (this.showQuickSettings != newValue) {
        this.settingsButtonClicked()
    }
}

async onInboxViewChange(value: boolean) {
      if (this.currentUserPreferences !=null && this.currentUserPreferences != undefined){
        const newUserPreferences: any = {}
        Object.assign(newUserPreferences, this.currentUserPreferences)
        newUserPreferences['inboxView'] = value
        this.updateUserPreferences({newUserPreferences: newUserPreferences})

      }
      else{
        const userPreferences = {inboxView:value}
        this.updateUserPreferences({newUserPreferences: userPreferences})

      }
    }

async onDarkModeChange(value: boolean) {
    if (this.currentUserPreferences !=null && this.currentUserPreferences != undefined){
        const newUserPreferences: any = {}
        Object.assign(newUserPreferences, this.currentUserPreferences)
        newUserPreferences['darkMode'] = value

        this.updateUserPreferences({newUserPreferences: newUserPreferences})
      }
       else{
        const userPreferences = {darkMode:value}
        this.updateUserPreferences({newUserPreferences: userPreferences})

      }
    }

darkModeSwitch: boolean = false
inboxViewSwitch: boolean = false
mini: boolean = false 
items: Array<any> = []

selected: number|null= null
settings:Array<any> = []


mounted(){
  this.darkModeSwitch = this.darkMode
  this.inboxViewSwitch = this.inboxView
}

@Watch('darkMode')
darkModeChanged (){
    this.darkModeSwitch = this.darkMode
}

@Watch('inboxView')
inboxViewChanged() {
    this.inboxViewSwitch = this.inboxView
}

}
</script>
