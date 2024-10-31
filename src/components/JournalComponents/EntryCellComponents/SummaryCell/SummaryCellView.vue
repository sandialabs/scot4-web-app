<template>
<v-card :color="$vuetify.theme.dark ? 'yellow darken-4' : 'yellow lighten-4'">
  <span v-if="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)!=null" v-html="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).entry_data.html"></span>
</v-card>
</template>

<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, EntryClassEnum } from '@/store/modules/IRElements/types'
import {User} from '@/store/modules/user/types'
const namespace: string = 'IRElements';


@Component({
  components: {
    
    },
})

export default class WYSIWYGCellView extends Vue{
@Prop() entryId: number;
@Prop({default: null}) linkedElementType:IRElementType|null
@Prop({default:""}) treePath: string;
@Prop({default: null}) linkedElementId: number|null
@Prop({default: null}) linkedElementIndex: number|null 
@Action('editEntryModeOn', { namespace }) editEntryModeOn: CallableFunction
@Action('removeEntryByID', { namespace }) removeEntryByID: CallableFunction
@Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;
@Getter('currentUser', { 'namespace':'user' }) currentUser: User;
@Getter('entryById', { namespace }) entryById: CallableFunction
@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Getter('elementType', { namespace }) elementType: IRElementType|null;
@Action('toggleExpandEntry', { namespace }) toggleExpandEntry: CallableFunction

async deleteEntry(){
  await this.removeEntryByID({entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId:this.linkedElementId, 
                                      linkedElementIndex:this.linkedElementIndex})
}

async editClicked(){
  await this.editEntryModeOn({entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId:this.linkedElementId, 
                                      linkedElementIndex:this.linkedElementIndex})
}
}


</script>
<style>
pre {
    white-space: pre-wrap;
}
</style>