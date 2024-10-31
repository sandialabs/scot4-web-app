<template>
    <v-card>
<v-treeview :items="computedItems()"></v-treeview>
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

export default class JsonTreePane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
    @Prop() enrichment: any

    recurseNode(node:Record<string|number,any>|string|number, treeItem:any, currentId:any){
      
      
      if ((typeof node === 'string' || node instanceof String) ||(typeof node === 'number' || node instanceof Number) ){
          treeItem.push({id:currentId.id, name: node})
          currentId.id += 1
          return
      }

      for (let [key, value] of Object.entries(node)){

        if ((typeof value === 'object' || value instanceof Object) && value != null ){
          let item = {id: currentId.id , name: `${key}: `, children:[] }
          currentId.id += 1
          treeItem.push(item)
          if (!Array.isArray(value)){
            value = [value]

          }
          for (const childNode of value){
              this.recurseNode(childNode, item.children, currentId)
            }

      }

          
          else if ((typeof value === 'string' || value instanceof String) ||(typeof value === 'number' || value instanceof Number) || value == null ){
            let item = {id: currentId.id , name: `${key}: ${value}` }
            currentId.id += 1
            treeItem.push(item)
          }

      }
        
    }

    computedItems(){
      let treeItems:Array<any> = []
      let parsedJSON:any = this.enrichment.data
      let currentId = {id:1}
      if(!Array.isArray(parsedJSON)){
        parsedJSON = [parsedJSON]
      }
      for(const node of parsedJSON){
          let rootItem:any = []
          this.recurseNode(node, rootItem, currentId)
          treeItems.push(rootItem)
        }
      return treeItems.flat()
    }

}
</script>