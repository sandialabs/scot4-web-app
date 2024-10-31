<template>
    <v-dialog v-model="dialogOpen" max-width="800px">
        <v-progress-circular indeterminate v-if="loading"></v-progress-circular>
        <v-card v-else-if="target != null && target != undefined" class="flex-column-noscroll">
            <v-card-title>Entities for entry {{ target.id }}</v-card-title>
            <v-card-text class="flex-column-noscroll">
                <EntitiesPane :entities="entities"></EntitiesPane>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="dialogOpen = false">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
    import { Entry, IRElementType } from '../../store/modules/IRElements/types'
    import EntitiesPane from '@/components/PaneComponents/EntitiesPane.vue'

    @Component({
        components: {
            EntitiesPane
        },
    })
    export default class EntryEntityDialog extends Vue {
        @Prop({ default: null }) target: Entry
        @Prop({ default: false }) value: boolean

        loading: boolean = false
        dialogOpen: boolean = false
        entities: Array<any> = []

        async created() {
            this.dialogOpen = this.value
        }

        async loadEntities() {
            if (this.target){
                this.loading = true
                const respEntity = await Vue.prototype.$api.elements.retrieveElementEntitiesbyID(this.target.id, IRElementType.Entry)
                this.entities = respEntity.data.result
                this.loading = false
            }
        }

        @Watch('value')
        async onValueChange(newVal: boolean) {
            this.dialogOpen = newVal
            if (this.dialogOpen) {
                await this.loadEntities()
            }
        }

        @Watch('dialogOpen')
        async onDialogChange(newVal: boolean) {
            this.$emit('input', newVal)
        }
    }
</script>

<style>
    .v-dialog{
        display: flex;
        flex-direction: column;
    }

    .flex-column-noscroll {
        min-height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }
</style>