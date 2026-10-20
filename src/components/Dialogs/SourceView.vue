<template>
    <v-card @keyup.enter="AddSources()">
        <v-card-text>
            <v-combobox :loading="loading" id="source-search-box" v-model="sourcesSelected" :no-data-text="loading ? 'Searching...' : 'No items found'" :hide-no-data="false"
                :items="sourcesOptions" hide-details autofocus auto-select-first label="Search for an option or make new" variant="outlined" hide-selected multiple
                autoComplete="off" @update:search="SearchSources" :delimiters="[' ']">
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label @click:close="RemoveSource(index)"/>
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
            <v-btn @click="AddSources()" :loading="submitLoading" :disabled="submitLoading" color="success" rounded="lg" elevation="1" variant="outlined">
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
import { useGET_APIStore, usePOST_APIStore, useDialogStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { NewSource } from '@/models';
import type { Source } from '@/types/irelement';
import {IRElementTypeSingular} from '@/types/irelement';
import { useTextPipe } from '@/pipes';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const textPipe = useTextPipe()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshQueueView', 'RefreshSelectedView'])
const loading = ref(false)
const sourcesSelected = ref([])
const sourcesOptions = ref([])
const existingIds = ref([])
const submitLoading = ref(false)
const submissionError = ref("")
const searchDelay = 250
let searchTimer: ReturnType<typeof setTimeout> | undefined
let latestSearchId = 0

onMounted(() => {
    if (incomingProps.params.existing) {
        existingIds.value = incomingProps.params.existing.map((a: Source) => a.id)
    }
    else if (incomingProps.params.selectedItem?.sources) {
        existingIds.value = incomingProps.params.selectedItem?.sources.map((a: Source) => a.id)
    }
    SearchSources()
})

function SearchSources(searchTerm: string | null = null) {
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
            const response = await API_GET.GET_IRElementSources(25, searchTerm, "-link_count")
            if (searchId === latestSearchId) {
                sourcesOptions.value = response.result.map((source: any) => {
                    return {title: `${source.name} (${source.link_count})`, value: source.name, description: source.description, id: source.id}
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

async function AddSources() {
    if (submitLoading.value) {
        return
    }

    const target_type = IRElementTypeSingular[incomingProps.params.targetType]
    const sourceData = sourcesSelected.value.reduce((sources: NewSource[], source: any) => {
        let sourceData: any = null
        if (typeof source == 'string') {
            sourceData = new NewSource(parseInt(incomingProps.params.targetId), target_type, source, "")
        } else {
            //filter out any ids that already exist
            if (!existingIds.value.includes(source.id)) {
                sourceData = new NewSource(parseInt(incomingProps.params.targetId), target_type, source.value, source.description)
            }
        }
        if (sourceData) {
            sources.push(sourceData)
        }
        return sources
    }, [])

    submitLoading.value = true
    submissionError.value = ""
    try {
        const newSources = await Promise.all(sourceData.map((source) => API_POST.POST_AddSource(source)))
        if (newSources.some((source) => !source)) {
            throw new Error("Unable to add one or more sources")
        }

        newSources.forEach((newSource: Source) => {
            if (incomingProps.params.existing) {
                incomingProps.params.existing.push(newSource)
            }
            else if (incomingProps.params.selectedItem?.sources) {
                incomingProps.params.selectedItem.sources.push(newSource)
            }
        })
        Dialog.ToggleDialog()
    } catch {
        submissionError.value = "Unable to add sources. Please try again."
    } finally {
        submitLoading.value = false
    }
}

async function RemoveSource(index: number) {
    sourcesSelected.value.splice(index, 1)
}
</script>
