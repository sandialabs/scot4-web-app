<template>
  <v-app id="inspire">
    <v-main v-if="currentThreatModel=='mitre_enterprise'">
 <MitreModel/>
    </v-main>
        <v-main v-else-if="currentThreatModel=='mitre_ics'">
 <MitreICSModel/>
    </v-main>
    <v-main v-else>
            <v-select
          :items="threatModels"
          filled
          label="Select A Threat Model to Visualize"
        @change=modelSelected
        ></v-select>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import IRCalendarComponent from '@/components/IRCalendarComponent.vue'
import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
import MitreModel from '@/components/ThreatModelComponents/MitreModel.vue'
import MitreICSModel from '@/components/ThreatModelComponents/MitreICSModel.vue'
const namespace: string = 'team';

@Component({
  components: {
   ScotNavBar,
   QuickSettingsDrawer,
   MitreModel,
   MitreICSModel
    },
})

export default class ThreatModelView extends Vue{
@Getter('showQuickSettings', { 'namespace':'user' }) showQuickSettings: boolean;

threatModels = [{"text":"MITRE-Enterprise", "value": "mitre_enterprise"}, {"text":"MITRE-ICS", "value":"mitre_ics"}]
currentThreatModel = null

modelSelected(e:any){
this.$router.push(`/threat_model/${e}`)
}

@Watch('$route', { immediate: true, deep: true })
   async onUrlChange(newVal: any) {
       if(newVal.params.type !=undefined)
       {
           this.currentThreatModel = newVal.params.type
       }
       else{
           this.currentThreatModel = null
       }

}
}

</script>
