<template>
    <v-card>
      <span v-html="markdownHTML()">
      </span>
      
</v-card>

</template>


<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { Entity, IRElement, IRElementType } from '@/store/modules/IRElements/types'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
const namespace: string = 'IRElements';

@Component({
  components: {
   
    },
})

export default class MarkdownPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
    @Prop() enrichment: any

    markdownHTML(){
        return DOMPurify.sanitize(marked.parse(this.enrichment.data.markdown))
    }
    

}
</script>
<style scoped>
        table { border-collapse: collapse; }
        tr { border-bottom: solid 1px black; }
        .theme--light tbody tr:nth-child(even) {background-color: #f2f2f2;}
        .theme--dark tbody tr:nth-child(even) {background-color: #1d1d1d;}
</style>