<template>
    <v-dialog v-model="dialogOpen" max-width="600px">
        <v-card>
            <v-card-title>
                Add Class and/or Tag:
            </v-card-title>
            <v-card-text>
                <v-form ref="classifyForm">
                    <v-list dense>
                        <v-list-item v-for="entity in entities" :key="entity.id">
                            <v-list-item-content>
                                <v-list-item-title>
                                    <v-icon small class="mr-2">mdi-checkbox-blank-circle</v-icon>
                                    {{ entity.value}} ({{entity.type_name}})
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <!-- Section for Class -->
                    <v-divider></v-divider>
                    <v-subheader>Class</v-subheader>
                    <v-autocomplete
                        v-model="selectedClass"
                        :items="classes.map(type => type.name)"
                        label="Select Class"
                        required
                        solo
                        clearable
                    ></v-autocomplete>
                     <!-- Section for Tag -->
                    <v-divider></v-divider>
                    <v-subheader>Tag</v-subheader>
                    <v-autocomplete
                        v-model="selectedTag"
                        :items="tags.map(type => type.name)"
                        label="Select Tag"
                        solo
                        clearable
                        :loading="loading"
                        :search-input.sync="tagSearch"
                        @update:search-input="onTagSearch"
                    ></v-autocomplete>
                    <v-alert v-if="errorMessage" type="error" dismissible @input="errorMessage = ''">
                        {{ errorMessage }}
                    </v-alert>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="submitClassifyForm" color="green" :loading="submitLoading">
                    Submit
                </v-btn>
                <v-btn @click="closeModal">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { IRElementType} from "@/store/modules/IRElements/types"

@Component
export default class ClassifyModal extends Vue {
    @Prop({ default: false }) value!: boolean;
    @Prop({ default: () => [] }) selectedEntityIds!: number[];

    dialogOpen: boolean = false;
    selectedClass: string = '';
    selectedTag: string = '';
    classes: { id: number, name: string }[] = [];
    tags: { id: number, name: string }[] = [];
    entities: any[] = [];
    submitLoading: boolean = false;
    loading: boolean = false;
    classSearch: string = '';
    tagSearch: string = '';
    errorMessage: string = '';

    mounted() {
        this.dialogOpen = this.value;
        this.loadClassTypes();
    }

    @Watch('value')
    onValueChange(newVal: boolean) {
        this.dialogOpen = newVal;
    }

    @Watch('dialogOpen')
    onDialogChange(newVal: boolean) {
        this.$emit('input', newVal);
    }

    async loadClassTypes() {
        const abortController = new AbortController();
        try {
            const filterDict = {
                limit: -1
            };
            const response = await Vue.prototype.$api.elements.retrieveAllEntityClasses(filterDict)
            this.classes = response.data.result.map((item: any) => ({
                id: item.id,
                name: item.display_name
            }));
        } catch (error) {
            this.errorMessage = 'Error fetching class types';
            console.error('Error fetching class types:', error);
        }
    }

    async onTagSearch(search: string) {
        this.tagSearch = search;
        this.loading = true;
        try {
            const filterDict = {
                name: search,
                limit: 10
            };
            const response = await Vue.prototype.$api.elements.retrieveTags(filterDict); // Call the search API for tags
            this.tags = response.data.result.map((item: any) => ({
                id: item.id,
                name: item.name
            }));
            this.tags.filter(tag => tag.name); // filter out null or empty names
        } catch (error) {
            this.errorMessage = 'Error searching tags';
            console.error('Error searching tags:', error);
        } finally {
            this.loading = false;
        }
    }

    closeModal() {
        this.dialogOpen = false;
    }

    async submitClassifyForm() {
        if (this.selectedEntityIds.length === 0) {
            this.errorMessage = 'Please select at least one entity.';
            return;
        }
        if (!this.selectedClass && !this.selectedTag) {
            this.errorMessage = 'Please select at least one class or tag.';
            return;
        }
        this.submitLoading = true;
        try {
            if (this.selectedClass) {
                const selectedClassType = this.classes.find(type => type.name === this.selectedClass);
                if (!selectedClassType) {
                    this.errorMessage = 'Selected class not found';
                    return;
                }
                const entityClassesToAdd = [selectedClassType.id];
                // Call addEntityClass for each selected entity ID
                await Promise.all(this.selectedEntityIds.map(id => Vue.prototype.$api.elements.addEntityClass(id, entityClassesToAdd)));
            } 
            if (this.selectedTag) {
                const selectedTagType = this.tags.find(type => type.name === this.selectedTag);
                if (!selectedTagType) {
                    this.errorMessage = 'Selected tag not found';
                    return;
                }
                // Call addTag for each selected entity ID
                await Promise.all(this.selectedEntityIds.map(id => Vue.prototype.$api.elements.addEntityTag(id, selectedTagType.id)));
            }
            this.$emit('submit-success');
            this.submitLoading = false;
            this.dialogOpen = false;
            this.closeModal();
        } catch (error) {
            this.errorMessage = 'Error during classification or tagging';
            this.submitLoading = false;
            console.error('Error during classification or tagging:', error);
        }
        finally {
            this.selectedClass = '';
            this.selectedTag = '';
        }
    }
}
</script>