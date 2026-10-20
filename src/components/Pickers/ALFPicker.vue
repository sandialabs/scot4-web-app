<template>
    <v-menu class="flex-fill mx-2">
        <template v-slot:activator="{ props }">
            <v-btn v-if="alfData=='red'" size="x-small" v-bind="props" variant="plain" color="red" style="max-width: 68px; text-shadow: -1px 1px 1px black, 1px 1px 1px black,-1px -1px 1px black, 1px -1px 1px black, 0 0 0.05em black; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF-R
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
            <v-btn v-else-if="alfData=='orange'" size="x-small" v-bind="props" variant="plain" color="orange" style="max-width: 68px; text-shadow: -1px 1px 1px black, 1px 1px 1px black,-1px -1px 1px black, 1px -1px 1px black, 0 0 0.05em black; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF-O
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
            <v-btn v-else-if="alfData=='amber'" size="x-small" v-bind="props" variant="plain" color="amber" style="max-width: 68px; text-shadow: -1px 1px 1px black, 1px 1px 1px black,-1px -1px 1px black, 1px -1px 1px black, 0 0 0.05em black; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF-A
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
            <v-btn v-else-if="alfData=='yellow'" size="x-small" v-bind="props" variant="plain" color="yellow" style="max-width: 68px; text-shadow: -1px 1px 1px black, 1px 1px 1px black,-1px -1px 1px black, 1px -1px 1px black, 0 0 0.05em black; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF-Y
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
            <v-btn v-else-if="alfData=='green'" size="x-small" v-bind="props" variant="plain" color="green" style="max-width: 68px; text-shadow: -1px 1px 1px black, 1px 1px 1px black,-1px -1px 1px black, 1px -1px 1px black, 0 0 0.05em black; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF-G
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
            <v-btn v-else size="x-small" v-bind="props" variant="plain" style="max-width: 68px; font-size: 12px; padding-bottom: 0px !important; padding-top: 0px !important;">
                ALF&nbsp;&nbsp;&nbsp;
                <FontAwesomeIcon color="black" style="font-size: 10px" :icon="faChevronDown" />
            </v-btn>
        </template>
        <v-list>
            <span class="pa-2">Action Light Framework (ALF) Color</span>
            <v-list-item v-for="item in ALFOptions" :key="item" @click="alfItemClick(item)">
                <template v-slot:prepend>
                    <svg style="width: 12px; height: 12px;" class="mr-1">
                        <circle v-if="item == 'Red'" r="5" cx="6" cy="6"
                                style="fill: red; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Orange'" r="5" cx="6" cy="6"
                                style="fill: orange; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Amber'" r="5" cx="6" cy="6"
                                style="fill: orange; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Yellow'" r="5" cx="6" cy="6"
                                style="fill: yellow; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Green'" r="5" cx="6" cy="6"
                                style="fill: green; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'White' || item == 'Clear'" r="5" cx="6" cy="6"
                                style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                    </svg>
                </template>
                {{ item }}
            </v-list-item>
            <v-divider />
            <v-list-item href="https://www.google.com/search?q=permissive+actions+protocol" target="_blank">What is ALF?</v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { ALFCode, IRElementAPIPaths, IRElementType } from '@/types/irelement'
import { usePUT_APIStore, useBusStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

const incomingProps = defineProps({
    data: String,
    targetType: String,
    targetId: Number,
    obj: Object,
    entryIds: {
        type: Array<number>,
        required: false,
        default: [],
    }
})
const alfData = ref("")
const ALFOptions: Array<string> = Object.keys(ALFCode).map(val => val == 'amber_strict' ? 'Amber+Strict' : val).map((s) => s[0].toUpperCase() + s.substring(1)).filter(val => val != 'White')
const API_PUT = usePUT_APIStore()
const Bus = useBusStore()

onMounted(() => {
    alfData.value = incomingProps.data
})

watch(() => incomingProps.data, () => {
    alfData.value = incomingProps.data
})

function alfItemClick(item: any) {
    let newAlf = ALFCode[item.toLowerCase().replace('+', '_') as keyof typeof ALFCode]
    alfData.value = newAlf
    UpdateALF()
}

async function UpdateALF() {
    //update the entries first if any
    if (incomingProps.entryIds.length > 0) {
        await API_PUT.UpdateManyElementsByIds(IRElementAPIPaths[IRElementType.Entry], incomingProps.entryIds, { alf: alfData.value })
    }
    const targetType = incomingProps.targetType == "entry" ? IRElementAPIPaths[IRElementType.Entry] : IRElementAPIPaths[incomingProps.targetType]
    await API_PUT.UpdateElementById(targetType, incomingProps.targetId, { alf: alfData.value })
        .then((newObj) => {
            if (incomingProps.obj) {
                Object.assign(incomingProps.obj, newObj)
            }
        })
}
</script>
