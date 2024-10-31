<template>
  <span class="mb-n1">
    <v-btn small v-if="expand === false" color="green" class="spanChild" @click="onEntityClassAdd">
  Attach Entity Class
</v-btn>
<v-autocomplete
  v-show="expand"
  class = "spanChild mb-n4"
  v-model="select"
  :items="autoCompleteEntityClasses"
  :filter="filter"
  label="Entity Classes"
  :menu-props="{closeOnContentClick:true}"
  multiple
  outlined
  dense
  >
  
  <template v-slot:selection="data">
            <v-chip
            small
              :key="data.item.name"
              v-bind="data.attrs"
              input-value="false"
              :disabled="data.disabled"
              @click="data.select"
            >

            <v-icon v-if="data.item.icon" left>
            {{data.item.icon}}
            </v-icon>
            <span v-if="data.item.display_name">
              {{ data.item.display_name }}

            </span>
            <span v-else>
              {{  data.item }}
            </span>
            </v-chip>
          </template>
          

<template v-slot:item="{parent, item, on, attrs}">
    <v-list-item @click="itemClicked(parent, item, on, attrs)">
    <v-icon class="pr-2">
    {{item.icon}}
    </v-icon>
     {{item.display_name}}
    </v-list-item>
</template>

</v-autocomplete>
  <v-btn  color="green" v-if="expand === true && submitting == false" class="spanChild" :icon=true @click="onEntityClassSubmit">
  <v-icon >
    mdi-check
  </v-icon>
</v-btn>
<v-progress-circular v-if="expand === true && submitting == true" indeterminate class="spanChild">
</v-progress-circular>
  </span>              
</template>

<script lang="ts">
    import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
    import { State, Action, Getter } from 'vuex-class';
    import { EntryClassEnum, IRElement, IRElementQuickButton, IRElementType, Entry, NewEntry, IRElementStatus } from '@/store/modules/IRElements/types'
    import { User } from '@/store/modules/user/types';
    const namespace: string = 'IRElements';
    @Component({
        components: {
        },
    })

    export default class PivotAttachEntityClass extends Vue {
        @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
        @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
        @Getter('elementType', { namespace }) elementType: IRElementType | null;
        @Action('attachEntityClassesToPivot', { namespace }) attachEntityClassesToPivot: CallableFunction
        @Prop(Number) readonly pivotId: number


      autoCompleteEntityClasses = []
      expand:boolean = false
      submitIconName:string = "mdi-check"
      submitting:boolean = false

      selectArray():Array<any>{
        return Array.from(this.select)
      }
      async onEntityClassAdd(){
        this.expand = !this.expand
          if (this.autoCompleteEntityClasses == undefined || this.autoCompleteEntityClasses.length == 0)
           {
            const resp = await Vue.prototype.$api.elements.retrieveAllEntityClasses()
            this.autoCompleteEntityClasses = resp.data.result

           }
  
      }

      select:Array<any> = []
      itemClicked(parent:any, item:any, on:any, attrs:any){
       
        if( this.select.indexOf(item) == -1){
            this.select.push(item)

        }
        
  
      }
      async onEntityClassSubmit(){
        if (this.selectedElement && this.selectedElement.entity_classes){
            this.submitting = true
            let newEntityClasses = this.selectedElement.entity_classes.map((a:any) => a.name)
            for (const item of this.select){
                if (item.name){
                  newEntityClasses.push(item.name)
                }
                else{
                  newEntityClasses.push(item)
                }
            }
            await this.attachEntityClassesToPivot({pivotId: this.pivotId, entityClasses:newEntityClasses})
            this.submitting = false
            this.select = []
            this.expand = false
        }
      }
      
       filter (item:any, queryText:any) {
        
        if (item.header) {
          
          return false
        }

        const hasValue = (val:any) => val != null ? val : ''

        const query = hasValue(queryText)

        return item.display_name.toString()
          .toLowerCase()
          .indexOf(query.toString().toLowerCase()) > -1
      }


    }
</script>
<style>

.spanChild {
  display: inline-block;
  
}



</style>