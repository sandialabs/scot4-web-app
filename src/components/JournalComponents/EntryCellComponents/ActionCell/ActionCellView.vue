<template>
<v-card elevation="3">
    <v-row>
      <v-col cols="4">
        <v-combobox
          v-model="select"
          :items="playbooks"
          label="Select an Action"
        ></v-combobox>
      </v-col>
      <v-col cols="4">
        <v-combobox
          v-model="select"
          :items="playbooks"
          label="Parameters"
        ></v-combobox>
      </v-col>
    </v-row>
</v-card>
</template>






<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry } from '@/store/modules/IRElements/types'

const namespace: string = 'IRElements';


@Component({
  components: {
    },
})

export default class ActionCellView extends Vue{
@Prop() entryId: number;
@Getter('entryById', { namespace }) entryById: CallableFunction
@Action('editEntryModeOff', { namespace }) toggleEditEntryModeOff: CallableFunction
playbooks: Array<string> = ["Block IP"]
select: Array<string> = []

async onCancel(){
    await this.toggleEditEntryModeOff({entryId: this.entryId})
}
}



</script>
<style>
.ck-editor__editable {
    max-height: 400px;
}
</style>