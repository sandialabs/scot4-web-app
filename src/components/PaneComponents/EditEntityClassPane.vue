<template>
    <v-card :loading="loading">
        <v-list v-if="EntityClassSelected != null">
            <v-list-item >
                <v-text-field label="Entity Class System Name" @blur="updateEntityClassField('name')" v-model="EntityClassSelected.name"></v-text-field>
            </v-list-item>
            <v-list-item >
                <v-text-field label="Entity Class Description" @blur="updateEntityClassField('description')" v-model="EntityClassSelected.description"></v-text-field>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class EditEntityClassPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
    EntityClassSelected: IRElement | null = null
    loading: boolean = false

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.EntityClass) {
            this.EntityClassSelected = this.selectedElement
        }
        else {
            this.EntityClassSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange(newVal: Array<any>, oldVal: Array<any>) {
        if (this.selectedElement?.ElementType == IRElementType.EntityClass) {
            this.EntityClassSelected = this.selectedElement
        }
        else { 
            this.EntityClassSelected = null
        }
        
    }
    // All individual fields get updated when their text boxes are modified
    async updateEntityClassField(fieldToUpdate: string) {
        if (this.EntityClassSelected) {
            const updateData = {
                [fieldToUpdate]: this.EntityClassSelected[fieldToUpdate]
            }
            this.loading = true
            this.updateElementInList({ elementId: this.EntityClassSelected.id, elementType: IRElementType.EntityClass, updateData: updateData })
            this.loading = false
        }
    }
}
</script>