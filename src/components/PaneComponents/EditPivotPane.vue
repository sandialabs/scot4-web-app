<template>
    <v-card :loading="loading">
        <v-list v-if="pivotSelected != null">
            <v-list-item>
                <v-text-field label="Pivot Description" @blur="updatePivotField('description')" v-model="pivotSelected.description"></v-text-field>
            </v-list-item>
            <v-list-item>
                <v-text-field label="Pivot Template" @blur="updatePivotField('template')" v-model="pivotSelected.template"></v-text-field>
            </v-list-item>
            <v-list-item>
            <v-row justify="start">
                <v-col>
                    Attached to Entity Types:
                    <v-tooltip  bottom v-for="entity_type in pivotSelected.entity_types" :key=entity_type.id>
                                                <template v-slot:activator="{ on }">
                                                    <v-chip small class="pr-3" >
                                                        <span v-on="on">{{entity_type.name}}</span>
                                                        <v-icon dense v-if="!pivotUpdating" @click="removePivotEntityType(entity_type.name)">
                                                            mdi-close
                                                        </v-icon>
                                                        <v-progress-circular indeterminate v-else>
                                                        </v-progress-circular>
                                                    </v-chip>
                                                </template>
                                                <span>{{ entity_type.description}}</span>
                                            </v-tooltip>  
                                            </v-col>
                                            <v-col>
                <PivotAttachEntityType :pivotId="pivotSelected.id">
                </PivotAttachEntityType>
                                            </v-col>
            </v-row> 
        </v-list-item>
            <v-list-item>
                <v-row justify="start">
                    <v-col>
                    Attached to Entity Classes:
                    <v-tooltip  bottom v-for="icon in pivotSelected.entity_classes" :key=icon.id>
                                                <template v-slot:activator="{ on }">
                                                    <v-chip small class="pr-3" >
                                                        <v-icon dense v-if="icon.icon" v-html="icon.icon" v-on="on">
                                                        </v-icon>
                                                        <span v-else v-on="on">{{icon.display_name}}</span>
                                                        <v-icon dense v-if="!pivotUpdating" @click="removePivotEntityClass(icon.name)">
                                                            mdi-close
                                                        </v-icon>
                                                        <v-progress-circular indeterminate v-else>
                                                        </v-progress-circular>
                                                    </v-chip>
                                                </template>
                                                <span>{{ icon.description}}</span>
                                            </v-tooltip>  
                </v-col>
                <v-col>
           <PivotAttachEntityClass :pivotId="pivotSelected.id">
           </PivotAttachEntityClass>
        </v-col>
                </v-row>
            </v-list-item>  

       
        </v-list>
    </v-card>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
import PivotAttachEntityClass from '@/components/PivotComponents/PivotAttachEntityClass.vue';
import PivotAttachEntityType from '@/components/PivotComponents/PivotAttachEntityType.vue';
const namespace: string = 'IRElements';

@Component({
  components: {
    PivotAttachEntityClass,
    PivotAttachEntityType
    },
})

export default class EditPivotPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
    @Action('attachEntityTypesToPivot', { namespace }) attachEntityTypesToPivot: CallableFunction
    @Action('attachEntityClassesToPivot', { namespace }) attachEntityClassesToPivot: CallableFunction

    pivotSelected: IRElement | null = null
    loading: boolean = false
    pivotUpdating:boolean = false
    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Pivot) {
            this.pivotSelected = this.selectedElement
        }
        else {
            this.pivotSelected = null
        }
    }
    @Watch('selectedElement')
    async onSelectedElementChange(newVal: Array<any>, oldVal: Array<any>) {
        if (this.selectedElement?.ElementType == IRElementType.Pivot) {
            this.pivotSelected = this.selectedElement
        }
        else {
            this.pivotSelected = null
        }
        
    }

    async removePivotEntityType(entityTypeName:string)
    {
        if(this.selectedElement && this.selectedElement.entity_types)
        {
            let updatedEntityTypes = this.selectedElement.entity_types.map((a:any) => a.name)
            const removeIndex = updatedEntityTypes.indexOf(entityTypeName)
            if (removeIndex !== -1){
                updatedEntityTypes.splice(removeIndex,1)
            }
            await this.attachEntityTypesToPivot({pivotId: this.selectedElement.id, entityTypes:updatedEntityTypes})


        }

    }

    async removePivotEntityClass(entityClassName:string)
    {
        if(this.selectedElement && this.selectedElement.entity_classes)
        {
            let updatedEntityClasses = this.selectedElement.entity_classes.map((a:any) => a.name)
            const removeIndex = updatedEntityClasses.indexOf(entityClassName)
            if (removeIndex !== -1){
                updatedEntityClasses.splice(removeIndex,1)
            }
            await this.attachEntityClassesToPivot({pivotId: this.selectedElement.id, entityClasses:updatedEntityClasses})

        }

    }
    // All individual fields get updated when their text boxes are modified
    async updatePivotField(fieldToUpdate: string) {
        if (this.pivotSelected) {
            const updateData = {
                [fieldToUpdate]: this.pivotSelected[fieldToUpdate]
            }
            this.loading = true
            this.updateElementInList({ elementId: this.pivotSelected.id, elementType: IRElementType.Pivot, updateData: updateData })
            this.loading = false
        }
    }
}
</script>