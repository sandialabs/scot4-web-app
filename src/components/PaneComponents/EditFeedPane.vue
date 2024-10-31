<template>
    <v-card :loading="loading">
        <v-list v-if="feedSelected != null">
            <v-list-item >
                <v-text-field label="Feed URI" @blur="updateFeedField('uri')" v-model="feedSelected.uri"></v-text-field>
            </v-list-item>
            <v-list-item>
                <v-text-field label="Feed Type" @blur="updateFeedField('type')" v-model="feedSelected.type"></v-text-field>
            </v-list-item>
            <v-subheader>Feed Attributes</v-subheader>
            <v-divider />
            <v-list-item-group>
                <v-list-item v-for="(val, propName) in feedSelected.data" :key=propName dense>
                    <v-list-item-content>
                        <v-text-field @blur="updateFeedField('data')" :label="propName" v-model="feedSelected.data[propName]" dense></v-text-field>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
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

export default class EditFeedPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
    feedSelected: IRElement | null = null
    loading: boolean = false

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Feed) {
            this.feedSelected = this.selectedElement
        }
        else {
            this.feedSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange(newVal: Array<any>, oldVal: Array<any>) {
        if (this.selectedElement?.ElementType == IRElementType.Feed) {
            this.feedSelected = this.selectedElement
        }
        else {
            this.feedSelected = null
        }
    }
    
    // All individual fields get updated when their text boxes are modified
    async updateFeedField(fieldToUpdate: string) {
        if (this.feedSelected) {
            const updateData = {
                [fieldToUpdate]: this.feedSelected[fieldToUpdate]
            }
            this.loading = true
            this.updateElementInList({ elementId: this.feedSelected.id, elementType: IRElementType.Feed, updateData: updateData })
            this.loading = false
        }
    }
}
</script>