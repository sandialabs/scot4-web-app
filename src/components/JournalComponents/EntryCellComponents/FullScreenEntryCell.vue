<template>
<div class="fullscreen">
<EntryCellViewSystemBar 
v-if="entryEditModeById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)==false" 
:fullScreenMode=true :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex 
:linkedElementId=linkedElementId :entryId="entryId" :treePath=treePath>
</EntryCellViewSystemBar>
<component class="entryView" :fullScreen=true v-if="entryEditModeById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)==false" v-bind:is="entryComponentMap[entryType]['view']" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :entryId="entryId" :treePath=treePath ></component>
<component class="entryEdit" :fullScreen=true v-else-if="entryEditModeById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)==true" v-bind:is="entryComponentMap[entryType]['edit']" :entryId="entryId" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :treePath=treePath></component>
<v-progress-linear v-else indeterminate color="yellow darken-2"></v-progress-linear>  
</div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry, EntryClassEnum } from '@/store/modules/IRElements/types'
import WYSIWYGCellView from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/WYSIWYGCellView.vue'
import WYSIWYGCellEdit from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/WYSIWYGCellEdit.vue'
import ActionCellEdit from '@/components/JournalComponents/EntryCellComponents/ActionCell/ActionCellEdit.vue'
import ActionCellView from '@/components/JournalComponents/EntryCellComponents/ActionCell/ActionCellView.vue'
import PromotedCellView from '@/components/JournalComponents/EntryCellComponents/PromotedCell/PromotedCellView.vue'
import SummaryCellView from '@/components/JournalComponents/EntryCellComponents/SummaryCell/SummaryCellView.vue'
import EntryCellViewSystemBar from '@/components/JournalComponents/EntryCellComponents/EntryCellViewSystemBar.vue'
import FlairComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairComponent.vue'
import Vuetify from 'vuetify/lib'

const namespace: string = 'IRElements';

@Component({
  components: {
    WYSIWYGCellView,
    WYSIWYGCellEdit,
    ActionCellView,
    ActionCellEdit,
    PromotedCellView,
    SummaryCellView,
    EntryCellViewSystemBar
    },
})

export default class FullScreenEntryCell extends Vue{
@Prop() entryId: number;
@Prop({default:""}) treePath: string;
@Prop() entryType: EntryClassEnum
@Prop({default: null}) linkedElementType:IRElementType|null
@Prop({default: null}) linkedElementId: number|null
@Prop({default: null}) linkedElementIndex: number|null 
@Getter('entryEditModeById', { namespace }) entryEditModeById: CallableFunction
@Getter('entryById', { namespace }) entryById: CallableFunction
@Action('toggleExpandEntry', { namespace }) toggleExpandEntry: CallableFunction
@Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
@Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, Record<string, any>>
@Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
@Action('openFlairMenu', { namespace }) openFlairMenu: CallableFunction; 
@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;


 flairLoaded:boolean = false

 entryComponentMap: Record<string, Record<string,string>> = {
   "entry": {"view": "WYSIWYGCellView", "edit": "WYSIWYGCellEdit"},
   "promotion": {"view": "PromotedCellView"},
   "summary": {"view": "WYSIWYGCellView", "edit": "WYSIWYGCellEdit"},
   "action": {"view":"ActionCellView", "edit":"ActionCellEdit"},
   "recipie": {"view": "CyberChefCellView", "edit": "CyberChefCellEdit"}
 }

mounted(){
    window.journal = this

}


@Watch('entitiesLoaded')
async onEntitiesLoaded(newVal:any){
  await this.$nextTick()
  if (newVal == true){
    await this.flairProcedure()
    this.flairLoaded = true
}

}

async flairProcedure(){
  const elements = this.$el.getElementsByClassName('entityFlair')
  for (const element of elements){
     const value =  element.getAttribute('value')
     const type = element.getAttribute('type')
    
     // eslint-disable-next-line
     let children:any = null
     if(element !=null){
       children = element.getAttribute('children')
       children = JSON.parse(children)
     }

    if(children !=null && children.length > 0){
      children = children.map((child:any)=> this.selectedElementEntities[child.type][child.value])
    }
    else{
      children = []
    }

     const entity = this.selectedElementEntities[String(type)][String(value)]
     if (entity == undefined){
       console.log('HERE IS UNDEFINED ENTITY')
       console.log(type)
       console.log(value)
       console.log(this.selectedElementEntities[String(type)])
     }
      const FlairComponentView = Vue.extend(FlairComponent)
      FlairComponentView.use(Vuetify)
        const component = new FlairComponentView({
            propsData:{
                entity: entity,
                vuetify: this.$vuetify,
                addFlairedEntity: this.addFlairedEntity,
                children: children,
                openFlairMenu: this.openFlairMenu
            },
        }).$mount()
        element.appendChild(component.$el)

  }
  
  }

}



</script>

<style scoped>
/deep/ .ck-editor__editable_inline {
    max-height: 100%;
    overflow: scroll;
}

/* Content cards always take up the whole screen in full-screen mode */
/deep/ .content-card {
    max-height: 90vh;
}

.fullscreen {
    display: flex;
    flex-direction: column;
    max-height: 100%;
}
</style>