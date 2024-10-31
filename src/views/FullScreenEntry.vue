<template>
  <FullScreenEntryCell v-if="selectedElement !=null && selectedElement.id == elementId && this.entryType!=null" :entryType=entryType :treePath=treePath :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId  :entryId="entryId" />
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
import { Getter, Action } from 'vuex-class';
import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
import FullScreenEntryCell from '@/components/JournalComponents/EntryCellComponents/FullScreenEntryCell.vue'
import { IRElement, IRElementType, IRElementMeta } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    ScotNavBar,
    FullScreenEntryCell,
    QuickSettingsDrawer
    },
})

export default class FullScreenEntryView extends Vue{

@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Action('retrieveElementList', { namespace }) retrieveElementList: any;
@Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: any;
@Getter('elementList', { namespace }) elementList: Array<IRElementMeta>|null;
@Getter('showQuickSettings', { 'namespace':'user' }) showQuickSettings: boolean;
@Getter('entryById', { namespace }) entryById: CallableFunction

elementId: number|null = null
entryId: number|null = null
elementType: string|null =null
linkedElementType: string|null = null
linkedElementIndex: number|null = null
linkedElementId: number|null = null
treePath: string|null = null
pathMap: Record<string, IRElementType> = {"events":IRElementType.Event}
entryType: string|null = null
    async mounted(){
      this.elementId = Number(this.$route.params['elementId'])
      this.elementType = this.$route.params['elementType']
      this.entryId = Number(this.$route.params['entryId'])
      document.title = "SCOT Entry " + this.entryId.toString()
      if ((this.selectedElement?.id != this.elementId && this.elementType!=undefined) || (this.selectedElement==null && this.elementType !=undefined))
      {
              await this.retrieveSelectedElementbyID({elementID: this.elementId, elementType:this.pathMap[this.elementType]})
      }

      if (this.elementType !=null)
      {
      if (this.$route.query['linkedElementType'] != undefined)
      {
      this.linkedElementType = String(this.$route.query['linkedElementType'])

      }
      else{
        this.linkedElementType = null
      }

       if (this.$route.query['linkedElementIndex'] != undefined)
      {
      this.linkedElementIndex = Number(this.$route.query['linkedElementIndex'])

      }
      else{
        this.linkedElementIndex = null
      }
       if (this.$route.query['linkedElementId'] != undefined)
      {
      this.linkedElementId = Number(this.$route.query['linkedElementId'])

      }
      else{
        this.linkedElementId = null
      }
       if (this.$route.query['treePath'] != undefined)
      {
      this.treePath= String(this.$route.query['treePath'])
      }
      else{
        this.treePath = null
      }
      
      const entry = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)

      this.entryType = entry.entry_class

      }
    }
}

</script>

<style>

</style>
