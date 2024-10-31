<template>
 <v-card>
  <v-data-table
    :headers="headers"
    :items="platforms" 
    sort-by="calories"
    class="elevation-1"
  >
    <template v-slot:top>
      <v-toolbar
        flat
      >
        <v-toolbar-title>Registered External Platforms</v-toolbar-title>
        <v-divider
          class="mx-4"
          inset
          vertical
        ></v-divider>
        <v-spacer></v-spacer>
        <v-dialog
          v-model="dialog"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-on="on"
            >
              Register Orchestration Platform (Airflow)
            </v-btn>
          </template>

<v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step
        :complete="e1 > 1"
        step="1"
      >
        Airflow Host (IP or Hostname)
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step
        :complete="e1 > 2"
        step="2"
      >
        Name of step 2
      </v-stepper-step>

      <v-divider></v-divider>

      <v-stepper-step step="3">
        Name of step 3
      </v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content step="1">
        <v-card
          class="mb-3"
        >
             <v-text-field
             single-line
            label="Platform Name"
            outlined
          ></v-text-field>
        
        </v-card>

        <v-btn
          color="primary"
          @click="e1 = 2"
        >
          Continue
        </v-btn>

        <v-btn text>
          Cancel
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="2">
        <v-card
          class="mb-3"
         
        >
        <v-autocomplete
            v-model="platformOption"
            :items="platformOptions"
            
            label="Platform Option"
          ></v-autocomplete>
        
        </v-card>

        <v-btn
          color="primary"
          @click="e1 = 3"
        >
          Continue
        </v-btn>

        <v-btn text>
          Cancel
        </v-btn>
      </v-stepper-content>

      <v-stepper-content step="3">
      <SplunkConfigForm /> 
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
        </v-dialog>
      </v-toolbar>
    </template>
  </v-data-table>
 </v-card>
</template>

<script lang="ts">
import { Component, Vue} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import SplunkConfigForm from '@/components/AdminComponents/PlatformsPanel/SplunkConfigForm.vue'
const namespace: string = 'admin';
@Component({
  components: {
    SplunkConfigForm
    },
})
export default class PlatformPanel extends Vue{
platforms = []
headers = [{text: 'Platform Name', align: 'start', sortable: true, value:'name'}, {'text':'Created Date', 'value':'created'}]
platformOptions = ["Splunk", "Microsoft Sentinel"]
dialog = false
platformOption = ""
dialogDelete = false
e1 = 1
}
</script>