<template>
    <v-card @keyup.shift.enter="AddTags()">
        <v-card-text>
            <v-combobox :loading="loading" id="tag-search-box" v-model="tagsSelected" :no-data-text="loading ? 'Searching...' : 'No items found'" :hide-no-data="false" autofocus auto-select-first :items="tagsOptions" hide-details label="Search for an option or make new" variant="outlined" hide-selected multiple autoComplete="off" @update:search="SearchTags" :delimiters="[' ']">
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label
                        @click:close="RemoveTag(index)"/>
                </template>
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props" v-tooltip:bottom="item.raw.description"/>
                </template>
            </v-combobox>
            <div v-if="submissionError" class="text-error text-caption mt-2" role="alert">
                {{ submissionError }}
            </div>
        </v-card-text>
        <v-card-actions>
            <v-tooltip interactive location="left">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-icon icon="mdi-information-outline" v-bind="activatorProps"/>
                </template>
                <p class="text-caption">
                    Hotkeys
                </p>
                <v-divider/>
                <p class="text-caption">
                    ESC: Close
                </p>
                <p class="text-caption">
                    Shift+Enter: Submit
                </p>
                <p class="text-caption">
                    Tab: Select first entry and stop selecting
                </p>
                <p class="text-caption">
                    Enter: Select first entry and continue selecting
                </p>
                <p class="text-caption">
                    Space: Create new from text
                </p>
            </v-tooltip>
            <v-spacer/>
            <v-btn @click="AddTags()" :loading="submitLoading" :disabled="submitLoading" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" :disabled="submitLoading" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useGET_APIStore, usePOST_APIStore, useDialogStore, } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { NewTag } from '@/models';
import type { Tag } from '@/types/irelement';
import {IRElementTypeSingular} from '@/types/irelement';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshQueueView', 'RefreshSelectedView'])
const loading = ref(false)
const tagsSelected = ref([])
const tagsOptions = ref([])
const existingIds = ref([])
const submitLoading = ref(false)
const submissionError = ref("")
const searchDelay = 250
let searchTimer: ReturnType<typeof setTimeout> | undefined
let latestSearchId = 0

onMounted(() => {
    if (incomingProps.params.existing) {
        existingIds.value = incomingProps.params.existing.map((a: Tag) => a.id)
    }
    else if (incomingProps.params.selectedItem?.tags) {
        existingIds.value = incomingProps.params.selectedItem?.tags.map((a: Tag) => a.id)
    }
    SearchTags()
})

function SearchTags(searchTerm: string | null = null) {
    const searchId = ++latestSearchId
    if (searchTimer) {
        clearTimeout(searchTimer)
    }
    loading.value = true

    searchTimer = setTimeout(async () => {
        if (searchId !== latestSearchId) {
            return
        }

        try {
            const response = await API_GET.GET_SearchTags(searchTerm, null, 25, "-link_count")
            if (searchId === latestSearchId) {
                tagsOptions.value = response.result.map((tag: any) => {
                    return {title: `${tag.name} (${tag.link_count})`, value: tag.name, description: tag.description, id: tag.id}
                })
            }
        } finally {
            if (searchId === latestSearchId) {
                loading.value = false
            }
        }
    }, searchDelay)
}

onBeforeUnmount(() => {
    ++latestSearchId
    if (searchTimer) {
        clearTimeout(searchTimer)
    }
})

async function AddTags() {
    if (submitLoading.value) {
        return
    }

    const target_type = IRElementTypeSingular[incomingProps.params.targetType]
    const tagData = tagsSelected.value.reduce((tags: NewTag[], tag: any) => {
        let tagData: any = null
        if (typeof tag == 'string') {
            tagData = new NewTag(parseInt(incomingProps.params.targetId), target_type, tag, "")
        } else {
            //filter out any ids that already exist
            if (!existingIds.value.includes(tag.id)) {
                tagData = new NewTag(parseInt(incomingProps.params.targetId), target_type, tag.value, tag.description)   
            }
        }
        if (tagData) {
            tags.push(tagData)
        }
        return tags
    }, [])

    submitLoading.value = true
    submissionError.value = ""
    try {
        const newTags = await Promise.all(tagData.map((tag) => API_POST.POST_AddTag(tag)))
        if (newTags.some((tag) => !tag)) {
            throw new Error("Unable to add one or more tags")
        }

        newTags.forEach((newTag: Tag) => {
            if (incomingProps.params.existing) {
                incomingProps.params.existing.push(newTag)
            }
            if (incomingProps.params.selectedItem?.tags) {
                incomingProps.params.selectedItem.tags.push(newTag)
            }
        })
        Dialog.ToggleDialog()
    } catch {
        submissionError.value = "Unable to add tags. Please try again."
    } finally {
        submitLoading.value = false
    }
}

function RemoveTag(index: number) {
    tagsSelected.value.splice(index, 1)
}
</script>
