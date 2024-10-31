<template>

<v-container fluid >
    <v-row>
            <v-select
          :items="layers"
          filled
          placeholder="Please Select a layer"
          label="Element Layer"
        @change=layerSelected
        ></v-select>
    </v-row>
    <v-row v-if="!loading">
        <v-col cols="2" v-for="(mitreElementList,key) in mitreClasses" :key=key>
            <v-list>
                <v-subheader> {{key}} </v-subheader>
                <v-card  @click.stop="threatModelElementClicked(key, index)" v-for="(mitreElement,index) in mitreElementList" :key="mitreElement.id" ripple hover :color="colorScale[mitreElement.associated_link_count]">
                    <v-card-title>
                        {{mitreElement.title}}
                    </v-card-title>
                    <v-card-subtitle v-if="mitreElement.associated_link_count != undefined">
                        Linked {{selectedLayer}} Count: {{mitreElement.associated_link_count}}
                    </v-card-subtitle>
                </v-card>
            </v-list>

        </v-col>
        <v-dialog v-if="selectedThreatModelItemClass !=null && selectedThreatModelItemIndex !=null"
      v-model="dialog"
      
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ mitreClasses[selectedThreatModelItemClass][selectedThreatModelItemIndex].title }}
        </v-card-title>
        <v-card-text>
            {{ mitreClasses[selectedThreatModelItemClass][selectedThreatModelItemIndex].description }}
        </v-card-text>
        <v-list>
            <v-subheader> Linked {{selectedLayer}}s </v-subheader>

            <v-list-item v-for="link in mitreClasses[selectedThreatModelItemClass][selectedThreatModelItemIndex].associated_links" :key=link.v0_id>
            {{link.v0_id}}
            </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
    </v-row>
        <v-progress-circular v-else
      color="primary"
      size="100"
      indeterminate
    ></v-progress-circular>
    
</v-container>
</template>

<script lang="ts">
import { IRElementType } from '@/store/modules/IRElements/types';
import { Component, Prop, Vue} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';

const namespace: string = 'IRElements';

@Component
export default class MitreModel extends Vue{

loading = true
mitreClasses: Record<string, Array<any>> = {}

colorScale = {0: "red", 1: "yellow", 2: "orange", 3:"green"}
dialog=false
selectedThreatModelItemClass:string|null = null
selectedThreatModelItemIndex:number|null = null
selectedLayer: string|null = null
layers = ["Signature", "Alertgroup", "Alert", "Event", "Incident", "Intel", "Dispatch", "Actor", "Product", "Hunt"]
layersMap: Record<string, IRElementType> = {"Signature": IRElementType.Signature, "Alertgroup": IRElementType.Alertgroup, "Event":IRElementType.Event, "Alert":IRElementType.Alert, "Product": IRElementType.Product}
threatModelElementClicked(mitreElementClass:string, elementIndex:number){
    this.selectedThreatModelItemClass = mitreElementClass
    this.selectedThreatModelItemIndex = elementIndex
    this.dialog = true
}
async layerSelected(selectedLayer:string){
    this.loading = true
    this.selectedLayer = selectedLayer
      const linkResp = await Vue.prototype.$api.elements.retrieveElementsWithFilter(IRElementType.Link, {"v0_type":this.selectedLayer.toLowerCase(), "limit":10000, "v1_type":"threat_model_item"})

    for(const mitreClass of Object.keys(this.mitreClasses)){
        for (const mitreElement of this.mitreClasses[mitreClass])
        {
                const matchingSigs = linkResp.data.result.filter((link:any) => link.v1_id == mitreElement.id)
                mitreElement["associated_links"] = matchingSigs
                mitreElement["associated_link_count"] = matchingSigs.length
        }
    }
    this.loading=false
}
async mounted(){

  const resp = await Vue.prototype.$api.elements.retrieveElementsWithFilter(IRElementType.ThreatModelItem, {"_type":"mitre_ics", "limit":2000})
  for (const mitreElement of resp.data.result){
      for (const killChainPhaseObj of mitreElement.data.kill_chain_phases){
          if (killChainPhaseObj["kill_chain_name"] == "mitre-ics-attack"){
           
              if (!(killChainPhaseObj["phase_name"] in this.mitreClasses)){
                  
                  this.mitreClasses[killChainPhaseObj["phase_name"]] = [mitreElement]
              }
              else{
                  this.mitreClasses[killChainPhaseObj["phase_name"]].push(mitreElement)
              }
          }
      }
      
  }
     this.loading = false
  }

}


</script>