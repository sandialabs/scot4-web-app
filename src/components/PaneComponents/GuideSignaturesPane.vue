<template>
<v-container fluid v-if="selectedElement.associated_sig_guide_map!=null && sigSelected == null && signatures.length > 1">
    <v-data-table
      :headers="signatureTableHeaders"
      :items="signatures"
      item-key="id"
      class="elevation-1"
      @click:row="onRowClick"
    >
    </v-data-table>
</v-container>

<v-container fluid v-else-if="selectedElement.associated_sig_guide_map!=null && sigSelected == null && signatures.length ==0">
   No Associated Signatures
</v-container>

<v-container fluid v-else>
      <v-system-bar v-if="signatures >1">
        <v-tooltip
          v-model="showBackToolTip"
          top
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click="clearSelectedSig"
            >
              <v-icon color="grey lighten-1">
                mdi-keyboard-backspace
              </v-icon>
            </v-btn>
          </template>
          <span>Go back to signature table</span>
        </v-tooltip>

</v-system-bar>


    <v-card>
        <v-card-title>
            Signature Name: {{sigSelected.element.name}}
        </v-card-title>
        <v-card-subtitle>
            Signature Type: {{sigSelected.element.type}}
        </v-card-subtitle>
            <v-list>
                <v-subheader>Signature Attributes</v-subheader>
                <v-divider/>
                <v-list-item-group>
                <v-list-item v-for="(val, propName) in sigSelected.element.data" :key=propName>
                <v-list-item-content>
                    <v-list-item-title>
                    {{propName}}: {{val}}
                    </v-list-item-title>
                </v-list-item-content>
                </v-list-item>
                </v-list-item-group>
            </v-list>
        <v-card-actions>
            Signature Owner: {{sigSelected.element.owner}}
            <v-spacer/>
            Last Modified: {{sigSelected.element.modified}}
        </v-card-actions>
    </v-card>
    
</v-container>
</template>






<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry, NewEntry } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class SignaturesPane extends Vue{
@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Action('retrieveLinkedSignatures', { namespace }) retrieveLinkedSignatures: CallableFunction

sigSelected: any = null
sigEnum: IRElementType = IRElementType.Signature
signatures: Array<any> = []
signatureTableHeaders: Array<any> = [{"text": "ID", "value":"id"}, {"text":"Name", "value":"name"}, {"text":"Signature Type", "value":"type"}, {"text":"Owner", "value":"owner"}, {"text": "Last Modified", "value":"modified"}]
async mounted(){
    this.signatures = []
    this.sigSelected = null
    if (this.selectedElement?.ElementType == IRElementType.Signature) {
        this.signatures = [{ "element": this.selectedElement }]
        this.sigSelected = this.signatures[0]
    }
    else if (this.selectedElement && this.selectedElement.associated_sig_guide_map !=null)
    {
        await this.retrieveLinkedSignatures({associatedSigGuideMap: this.selectedElement.associated_sig_guide_map})
        if (this.selectedElement.linkedElements){
        this.signatures = this.selectedElement.linkedElements[IRElementType.Signature]
        if (this.signatures.length == 1){
            this.sigSelected = this.signatures[0]
        }
        }
    }
        
}


clearSelectedSig(){
    this.sigSelected = null
}

onRowClick(row: any){
  this.sigSelected = row
}
showBackToolTip:boolean = false

}
</script>