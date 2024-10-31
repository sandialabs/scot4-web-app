<template>
    <v-card>
      <v-textarea :value="enrichment.data.plaintext" readonly auto-grow>
      </v-textarea>
      
</v-card>

</template>


<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { Entity, IRElement, IRElementType } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
   
    },
})

export default class PlainTextPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;  
    @Prop() enrichment: any
}
</script>