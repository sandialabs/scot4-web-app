<template>
    <v-menu v-model="menuOpened" :close-on-click="false" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
            <v-btn color="green lighten-1" v-bind="attrs" v-on="on" v-if="entityText !='' && buttonVisible" x-small>Create Entity</v-btn>
        </template>
        <v-list dense>
            <v-subheader >
                Create Entity
            </v-subheader>
            <v-subheader style="color: red" v-if="warning">
                Please select entity type
            </v-subheader>
            <v-list-item>
                <v-text-field v-model="entityText">
                </v-text-field>
            </v-list-item>
        <v-list-item>
            <v-combobox
          v-model="selectedEntityType"
          :items="autoCompleteEntityTypes"
          label="Entity Type"
          outlined
          dense
        ></v-combobox>

            </v-list-item>
<v-list-item>
            <v-checkbox
      v-model="createEntityRegex"
      label="Create Entity Regex for future flairing"
    ></v-checkbox>
        </v-list-item>

        <v-list-item>
            <v-spacer></v-spacer>
            <v-btn color="green" small @click="createNewEntity()">
                Create
            </v-btn>
        </v-list-item>            
        </v-list>

    </v-menu>
</template>

<script lang="ts">
    import { Component, Vue, Prop } from 'vue-property-decorator'
    import { Getter, Action } from 'vuex-class';
    const namespace: string = 'IRElements';
    import { IRElement, IRElementType, EntryClassEnum, TLPCode } from '@/store/modules/IRElements/types'

    @Component({
        components: {
        },
    })
    export default class NewEntityMenu extends Vue {

        @Prop() entityText: string
        @Prop() entryId: number
        @Prop() buttonVisible: boolean
        @Action('createNewEntityFromText', { namespace }) createNewEntityFromText: CallableFunction
        @Action('reflairSelectedElementbyID', { namespace }) reflairSelectedElementbyID: CallableFunction

        createEntityLoading: boolean = false
        createEntityRegex:boolean = true
    
        menuOpened:boolean = false
        warning:boolean = false
        
    async createNewEntity() {
        this.createEntityLoading = true
        if (this.selectedEntityType == null){
            this.warning=true
        }
        else{
        await this.createNewEntityFromText({entityText: this.entityText, entityType: this.selectedEntityType, createEntityRegex: this.createEntityRegex})
        await this.reflairEntry()
        this.createEntityLoading = false
        this.menuOpened = false
        }

    }

    async reflairEntry() {
        await this.reflairSelectedElementbyID({elementType: IRElementType.Entry, elementID: this.entryId})   
    }
    selectedEntityType = null
    autoCompleteEntityTypes = []

    async mounted(){
          if (this.autoCompleteEntityTypes == undefined || this.autoCompleteEntityTypes.length == 0)
           {
            const resp = await Vue.prototype.$api.elements.retrieveAllEntityTypes()
            this.autoCompleteEntityTypes = resp.data.result.map((item:any) => item.name)
           }
  
      }

    }
</script>