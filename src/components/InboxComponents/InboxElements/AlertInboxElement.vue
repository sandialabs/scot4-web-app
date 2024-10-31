<template>
<v-container align="start" >
<v-row>
<v-sheet elevation=24 outlined width="100%" :color="inboxElementStyle()" style="{border-width:'thick'}">
<v-row>
<v-col>
<h1>{{element.id}}</h1>
</v-col>
<v-col>
<h2>{{element.subject}}</h2>
</v-col>
</v-row>
<v-divider></v-divider>
<v-row no-gutters>
<v-col>
<v-chip-group>
  <v-chip
      class="ma-2"
      color="red"
      text-color="white"
    >
{{element.open_count}}
</v-chip>
  <v-chip
      class="ma-2"
      color="green"
      text-color="white"
    >
{{element.closed_count}}
</v-chip>
  <v-chip
      class="ma-2"
      color="orange"
      text-color="white"
    >
{{element.promoted_count}}
</v-chip>
</v-chip-group>
</v-col>
<v-col>
<p class="mb-0">
Created: {{element.created}}
</p>
<p>
Updated: {{element.updated}}
</p>

</v-col>
</v-row>
<v-row justify="center" class="mt-n6">

<v-col>
<v-chip-group>
<v-chip v-for="tag in element.tags" :key="tag.id">
{{tag.name}}
</v-chip>
</v-chip-group>
</v-col>
</v-row>
<v-row justify="center" class="mt-n6">
<v-col>
<v-chip-group>
<v-chip v-for="source in element.sources" :key="source.id">
{{source.name}}
</v-chip>
</v-chip-group>
</v-col>
</v-row>
<v-divider></v-divider>
<v-spacer></v-spacer>

</v-sheet>
</v-row>

</v-container>
</template>

<script lang="ts">
import { Component, Prop, Vue} from 'vue-property-decorator'
import { IRElementMeta } from '@/store/modules/IRElements/types'
@Component
export default class AlertInboxElement extends Vue{
@Prop({ default: null })
element: IRElementMeta


inboxElementStyle() {
  if (this.element !=null && this.element !=undefined){
  if (this.element.open_count != undefined && this.element.open_count > 0 && this.element.promoted_count==0){
    return "red lighten-4"
  }

   else if (this.element.open_count != undefined && this.element.open_count == 0 && this.element.promoted_count==0){
    return "green lighten-5"
  }
  else{
    return  "amber lighten-4"
  }
  }
  else{
    return "red lighten-4"
  }
  
}
}
</script>