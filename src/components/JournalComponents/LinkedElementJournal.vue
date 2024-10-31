<template>
<v-container fluid v-if="elementEntries!=null">
  <EntryCell v-for="entry in elementEntries" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :entryType="entry.entry_class" :entryId="entry.id" :key="entry.id">
  </EntryCell>
  <v-divider/>
</v-container>
</template>






<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry, NewEntry } from '@/store/modules/IRElements/types'
import EntryCell from '@/components/JournalComponents/EntryCellComponents/EntryCell.vue'
const namespace: string = 'IRElements';

@Component({
  components: {
    EntryCell
    },
})

export default class LinkedElementJournal extends Vue{
@Prop({default: null}) linkedElementType:IRElementType|null
@Prop({default: null}) linkedElementId: number|null
@Prop({default: null}) linkedElementIndex: number|null 

@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Getter('selectedElementEntries', { namespace }) selectedElementEntries: Array<Entry|NewEntry>|null;
@Action('retrieveLinkedElementEntries', { namespace }) retrieveLinkedElementEntries: CallableFunction

elementEntries: Array<Entry|NewEntry>|undefined = []

async mounted(){

  if (this.linkedElementType !=null && this.linkedElementId !=null && this.linkedElementIndex !=null)
  {
      await this.retrieveLinkedElementEntries({linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, linkedElementType: this.linkedElementType})
      if (this.selectedElement && this.selectedElement.linkedElements && this.linkedElementIndex !=null)
      {
        this.elementEntries = this.selectedElement.linkedElements[this.linkedElementType][this.linkedElementIndex as number].entries

      }
  }

}
}
</script>