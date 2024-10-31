<template>
    <v-dialog v-model="dialogOpen" max-width="600px">
        <v-card>
            <v-card-title>
                Add {{type.charAt(0).toUpperCase() + type.slice(1)}}
            </v-card-title>
            <v-combobox filled
                        v-model="addedTagsSources"
                        multiple
                        :items="autoCompleteResults.map(a => a.name)"
                        rounded
                        solo-inverted
                        dense
                        chips
                        deletable-chips
                        autofocus
                        :delimiters="[' ']"
                        @keydown.enter="dialogEnterKeyPressed"
                        @update:list-index="menuIndex = $event"
                        @update:search-input="searchInputUpdate"
                        menu-props="rounded"
                        :loading="loading"
                        :disabled="submitLoading">
            </v-combobox>
            <v-card-actions>
                <v-btn @click="onTagSourceDialogSubmit()" color="green" :loading="submitLoading">
                    Add
                </v-btn>
                <v-btn @click="dialogOpen = false">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
    import { Action } from 'vuex-class'
    import { IRElement, IRElementType } from '../../store/modules/IRElements/types'

    const namespace = "IRElements"

    @Component({
        components: {
        },
    })
    export default class AddTagSourceDialog extends Vue {
        @Prop() target: IRElement | null
        @Prop({ default: false }) value: boolean
        @Prop() type: string

        @Action('retrieveSources', { namespace }) retrieveSources: CallableFunction
        @Action('retrieveTags', { namespace }) retrieveTags: CallableFunction
        @Action('submitTagsOrSources', { namespace }) submitTagsOrSources: CallableFunction

        addedTagsSources: Array<any> = []
        autoCompleteResults: Array<any> = []
        loading: boolean = false
        dialogOpen: boolean = false
        searchInput: string | null = null
        menuIndex: number = -1
        submitLoading: boolean = false
        targetElementType: IRElementType | null = null

        async created() {
            if (this.target && 'entry_class' in this.target) { // Target is an entry
                this.targetElementType = IRElementType.Entry
            }
            else if (this.target && 'entry_annotation' in this.target) { // Target is an entity
                this.targetElementType = IRElementType.Entity
            }
            else if (this.target?.ElementType) {
                this.targetElementType = this.target.ElementType
            }
            this.dialogOpen = this.value
        }

        transformDateString(dateString: string | Date) {
            const date: any = new Date(dateString)
            const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
            return date.toLocaleDateString(undefined, options) + ' ' + date.toLocaleTimeString('en-US')
        }

        @Watch('value')
        async onValueChange(newVal: boolean) {
            this.dialogOpen = newVal
            if (this.dialogOpen) {
                if (this.type.toLowerCase() == "tag") {
                    this.autoCompleteResults = await this.retrieveTags({ limit: 25 })
                }
                else if (this.type.toLowerCase() == "source") {
                    this.autoCompleteResults = await this.retrieveSources({ limit: 25 })
                }
            }
        }

        @Watch('dialogOpen')
        async onDialogChange(newVal: boolean) {
            this.$emit('input', newVal)
        }

        async searchInputUpdate(newSearch: string) {
            this.searchInput = newSearch
            this.loading = true
            if (this.type.toLowerCase() == "tag") {
                this.autoCompleteResults = await this.retrieveTags({ limit: 25, name: newSearch })
            }
            else if (this.type.toLowerCase() == "source") {
                this.autoCompleteResults = await this.retrieveSources({ limit: 25, name: newSearch })
            }
            this.loading = false
        }

        dialogEnterKeyPressed() {
            if (this.menuIndex == -1) {
                this.onTagSourceDialogSubmit()
            }
        }

        async onTagSourceDialogSubmit() {
            if (this.target != null) {
                if (this.searchInput && !this.addedTagsSources.includes(this.searchInput)) {
                    this.addedTagsSources.push(this.searchInput)
                }
                this.submitLoading = true
                await this.submitTagsOrSources({ newTagsOrSources: this.addedTagsSources, type: this.type, targetElementType: this.targetElementType, targetElementId: this.target.id })
                this.dialogOpen = false
                this.submitLoading = false
                this.addedTagsSources = []
            }
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