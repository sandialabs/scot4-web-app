<template>
<v-card elevation="3">
    <v-row>
      <v-col cols="4">
        <v-combobox
          v-model="selectDag"
          :items="dags"
          label="Select an Action"
        ></v-combobox>
      </v-col>
      <v-col cols="4">
        <v-combobox
          v-model="selectParameters"
          :items="parameters"
          label="Parameters"
        ></v-combobox>
      </v-col>
    </v-row>
        <v-card-actions>
      <v-btn
        color="green"
        text
        @click="onRunAction"
        elevation="3"
      >
        Submit
      </v-btn>

      <v-btn
        color="red"
        text
        elevation="3"
        @click="onCancel"
      >
        Cancel
      </v-btn>
    </v-card-actions>
</v-card>
</template>






<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry, EntryClassEnum } from '@/store/modules/IRElements/types'
import { User }from '@/store/modules/user/types'

const namespace: string = 'IRElements';


@Component({
  components: {
    },
})

export default class ActionCellEdit extends Vue{
@Prop() entryId: number;
@Prop({default: null}) linkedElementType:IRElementType|null
@Prop({default: null}) linkedElementId: number|null
@Prop({default: null}) linkedElementIndex: number|null 
@Prop({default:""}) treePath: string;

@Getter('entryById', { namespace }) entryById: CallableFunction
@Getter('selectedElement', { namespace }) selectedElement: IRElement
@Getter('elementType', { namespace }) elementType: IRElementType
@Action('editEntryModeOff', { namespace }) editEntryModeOff: CallableFunction
@Action('cacheEditorContent', { namespace }) cacheEditorContent: CallableFunction
@Action('retrieveCachedEditorContent', { namespace }) retrieveCachedEditorContent: CallableFunction
@Action('updateOrCreateEntryContent', { namespace }) updateOrCreateEntryContent: CallableFunction
@Getter('currentUser', { 'namespace':'user' }) currentUser: User;
dags: Array<string> = ["DNS Blackhole Domain"]
selectDag: string =""
selectParameters:Array<string> = []
parameters:Array<string>=[]


async onRunAction(){
 console.log(this.selectDag)
 console.log(this.selectParameters)
 //await this.updateOrCreateEntryContent({entryId: this.entryId, entryType: EntryClassEnum.action, elementId: this.selectedElement.id, elementType: this.elementType, entryOwner: this.currentUser.username, entryContent: {'dag':this.selectDag, 'parameters':this.selectParameters},
  //linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: this.treePath})
}

async onCancel(){
    await this.editEntryModeOff({entryId: this.entryId})
}

}



</script>
<style>
.ck-editor__editable {
    max-height: 400px;
}
</style>