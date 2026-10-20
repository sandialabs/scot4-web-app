<template>
    <v-container v-if="!signatureData && !isLoading">
        <h5 class="text-center">No Associated Signaure Data</h5>
    </v-container>
    <v-container v-else-if="signatureData && !isLoading" class="pane-container">
        <v-list>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-2" label="Signature Type" v-model="signatureData.type"
                                @focus="SetActiveField('type')" @update:model-value="SetActiveField('type')" @blur="UpdateSignature('type', signatureData.type, 'type')"></v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-2" label="Signature Description" v-model="signatureData.description"
                                @focus="SetActiveField('description')" @update:model-value="SetActiveField('description')" @blur="UpdateSignature('description', signatureData.description, 'description')"></v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.data?.external_location != null">
                <v-text-field density="compact" variant="outlined" class="pt-2" readonly label="External Location" @focus="SetActiveField('data.external_location')" @blur="UpdateSignature('data', null, 'data.external_location')" v-model="signatureData.data.external_location" hint="The external location where this signature is stored (blank if only stored in SCOT)">
                    <template v-slot:append>
                        <a :href="signatureData.data.external_location" target="_blank">
                            <v-icon v-if="signatureData.data.external_location">
                                mdi-open-in-new
                            </v-icon>
                        </a>
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data?.target">
                <div class="d-flex justify-space-between">
                    <v-text-field class="mb-0 flex-shrink-0 flex-grow-0 pt-2" variant="outlined" @focus="SetActiveField('data.target.type')" @update:model-value="SetActiveField('data.target.type')" @blur="UpdateSignature('data', null, 'data.target.type')" label="Reference Type" style="width: 49%" hint="The SCOT datatype that orignated this signature" v-model="signatureData.data.target.type" density="compact"></v-text-field>
                    <v-text-field class="flex-shrink-0 flex-grow-0 pt-2" variant="outlined" @focus="SetActiveField('data.target.id')" @update:model-value="SetActiveField('data.target.id')" @blur="UpdateSignature('data', null, 'data.target.id')" label="Reference ID" style="width: 49%" hint="The id of the SCOT datatype that originated this signature" v-model="signatureData.data.target.id" density="compact"></v-text-field>
                </div>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data" class="mt-n1">
                <v-combobox density="compact" variant="outlined" class="pt-2" v-model="signatureData.data.signature_group" @focus="SetActiveField('data.signature_group')" @update:model-value="SetActiveField('data.signature_group')" @blur="UpdateSignature('data', null, 'data.signature_group')" label="Signature Groups" hint="Group signatures under common names" multiple chips deletable-chips></v-combobox>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data" class="mt-n1">
                <v-select density="compact" variant="outlined" class="pt-2" v-model="signatureData.data.action" @focus="SetActiveField('data.action')" @update:model-value="SetActiveField('data.action')" @blur="UpdateSignature('data', null, 'data.action')" :items="actionItems" label="Action" hint="The automated action that should take place when this signature is triggered" chips multiple></v-select>
            </v-list-item>
        </v-list>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { usePUT_APIStore, useBusStore } from '@/stores'
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';

const emit = defineEmits(['RefreshElement'])
let incomingProps = defineProps(['data'])
let signatureData = ref<any>(null)
let isLoading = ref(true)
let activeField = ref<string | null>(null)
let pendingSaveCount = ref(0)
let saveChain = Promise.resolve()

const API_PUT = usePUT_APIStore()
const Bus = useBusStore()
const actionItems: Array<string> = ["alert", "block"]

watch(
    () => incomingProps.data,
    (newData) => {
        if (!activeField.value && pendingSaveCount.value == 0) {
            signatureData.value = CloneSignatureData(newData)
        }
    },
    { deep: true, immediate: true }
)

onMounted(() => {
    isLoading.value = false
})

function CloneSignatureData(data: any) {
    if (data === undefined) {
        return undefined
    }
    return data ? JSON.parse(JSON.stringify(data)) : null
}

function SetActiveField(field: string) {
    activeField.value = field
}

function UpdateSignature(updateField: string, updateValue: any, field: string) {
    if (updateValue == null) {
        updateValue = signatureData.value?.[updateField]
    }

    const signatureId = signatureData.value?.id
    const updatePayload = { [updateField]: CloneSignatureData(updateValue) }
    pendingSaveCount.value++

    if (activeField.value == field) {
        activeField.value = null
    }

    saveChain = saveChain
        .catch(() => null)
        .then(() => API_PUT.UpdateElementById(IRElementAPIPaths[IRElementType.Signature], signatureId, updatePayload))
        .then((v) => {
            v ? emit('RefreshElement', v) : null
        })
        .finally(() => {
            pendingSaveCount.value--
        })
}

</script>

<style scoped>
    .v-list-item {
        cursor: default;
    }
</style>