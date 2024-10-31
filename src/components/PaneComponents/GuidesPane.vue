<template>
<v-container fluid v-if="selectedElement.associated_sig_guide_map!=null && guideSelected == null && guides.length > 0">
    <v-data-table
      :headers="guideTableHeaders"
      :items="guides"
      item-key="id"
      class="elevation-1"
      @click:row="onRowClick"
    >
    </v-data-table>
</v-container>

<v-container fluid v-else-if="selectedElement.associated_sig_guide_map!=null && guideSelected == null && guides.length == 0">
   No associated Guides
</v-container>


<v-container fluid v-else>
      <v-system-bar v-if="guides.length >1">
        <v-tooltip
          v-model="showBackToolTip"
          top
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
              @click="clearSelectedGuide"
            >
              <v-icon color="grey lighten-1">
                mdi-keyboard-backspace
              </v-icon>
            </v-btn>
          </template>
          <span>Go back to guides table</span>
        </v-tooltip>

</v-system-bar>
 <v-toolbar>
      <v-toolbar-title>Guide #{{guideSelected.element.id}}: <b>{{ guideSelected.element.subject }} </b> </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click="addNewWYSIWYGEntry()" icon>
        <v-icon>mdi-plus-thick</v-icon>
      </v-btn>

      <v-btn icon>
        <v-icon>mdi-arrow-top-right-thick</v-icon>
      </v-btn>
    </v-toolbar>

    <Journal :linkedElementType="'Guide'" :linkedElementId="guideSelected.element.id" :linkedElementIndex="guides.indexOf(guideSelected)" dense></Journal>

    <v-btn color="green" @click="addNewWYSIWYGEntry()" >
        Add Entry
      </v-btn>
    
</v-container>
</template>






<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, EntryClassEnum, Entry, NewEntry } from '@/store/modules/IRElements/types'
import { User } from '@/store/modules/user/types'
import Journal from '@/components/JournalComponents/Journal.vue'
const namespace: string = 'IRElements';

@Component({
  components: {
    Journal
    },
})

export default class GuidesPane extends Vue{
@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Action('retrieveLinkedGuides', { namespace }) retrieveLinkedGuides: CallableFunction
@Getter('currentUser', { 'namespace':'user' }) currentUser: User;
@Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;

guideSelected: any = null
guideEnum: IRElementType = IRElementType.Guide
guides: Array<any> = []
guideTableHeaders: Array<any> = [{"text": "ID", "value":"id"}, {"text":"Subject", "value":"subject"}, {"text":"Owner", "value":"owner"}, {"text": "Last Modified", "value":"modified"}]

async mounted(){
    this.guides = []
    this.guideSelected = null
    if (this.selectedElement && this.selectedElement.associated_sig_guide_map !=null){
        await this.retrieveLinkedGuides({associatedSigGuideMap: this.selectedElement.associated_sig_guide_map})
        if (this.selectedElement.linkedElements && this.selectedElement.linkedElements.Guide){
            this.guides = this.selectedElement.linkedElements[IRElementType.Guide]
        }
    }
    if (this.guides.length == 1){
        this.guideSelected = this.guides[0]
    }
}

@Watch("selectedElement.id")
async onSelectedElementChange() {
    this.guides = []
    this.guideSelected = null
    if (this.selectedElement && this.selectedElement.associated_sig_guide_map != null) {
        await this.retrieveLinkedGuides({ associatedSigGuideMap: this.selectedElement.associated_sig_guide_map })
        if (this.selectedElement.linkedElements && this.selectedElement.linkedElements.Guide) {
            this.guides = this.selectedElement.linkedElements[IRElementType.Guide]
        }
    }
    if (this.guides.length == 1) {
        this.guideSelected = this.guides[0]
    }
}

clearSelectedGuide(){
    this.guideSelected= null
}

onRowClick(row: any){
  this.guideSelected = row
}
showBackToolTip:boolean = false


async addNewWYSIWYGEntry(){
      // Only allow one entry to be added at a time. So check to see if any entries have an entry id of -1. 
      if (this.selectedElement && this.selectedElement.linkedElements !=null){

          const newEntryAlreadyExists = this.selectedElement.linkedElements[IRElementType.Guide][this.guides.indexOf(this.guideSelected)].entries.findIndex(entry => entry.id===-1) != -1
            if (newEntryAlreadyExists ==false){
            const newEntryPayload = {'owner':this.currentUser.username, 'IRElementType':IRElementType.Guide, 'IRElementTypeId': this.guideSelected.id, 'EntryClassEnum':EntryClassEnum[EntryClassEnum.entry]}
            await this.addNewEntryWithEditModeOn({newEntryPayload: newEntryPayload, linkedElementType: IRElementType.Guide, linkedElementId: this.guideSelected.id, linkedElementIndex: this.guides.indexOf(this.guideSelected)})
            }
            else{
              console.log('New Entry already exists')
            }
            
      }

      
}

}
</script>