<template>
    <v-container v-if="isLoading">
        <LoadingCard />
    </v-container>
    <v-container v-else class="pa-0" fluid>
        <JournalToolbar :entry="entry" :entities="incomingProps.entities" type="promotion"
            @expand="isEntryExpanded = !isEntryExpanded" :expanded="isEntryExpanded"
            :isNotModal="true" @reply="(entry) => emit('newentry', entry)" :maximized="incomingProps.maximized"/>
        <v-container fluid v-if="isEntryExpanded" class="promoted-cell">
            <v-card v-for="promoted in promotedData" :key="promoted.id" :elevation="0">
                <v-card-title>
                    <u>{{ promoted.promotedTitle }}</u>
                </v-card-title>
                <v-card-subtitle>
                    Promoted from
                    <router-link :to="'/' + TextPipe.PluralizeString(promoted.target_type) + '/' + promoted.id">
                        {{ promoted.target_type }} {{ promoted.id }}
                    </router-link>
                </v-card-subtitle>
                <v-chip color="red" size="small" variant="flat" class="ml-4" style="color: black !important" v-if="promoted.unflaired">Unflaired Alertgroup</v-chip>
                <v-card-text v-if="promoted.target_type == 'alertgroup'">
                    <v-data-table density="compact" :loading="isLoading" hide-default-footer :items="getAlertData(promoted)" :headers="promoted.headers">
                        <template v-for="header in promoted.headers" :key="header.key" v-slot:[`item.${header.key}`]="{value}">
                            <router-link v-if="header.key == 'id'" :to="`/alertgroups/${promoted.id}`">
                                {{ value }}
                            </router-link>
                            <span v-else-if="header.key == 'element type'">
                                {{ value }}
                            </span>
                            <v-container v-else-if="ObjectOrArrayPipe.IsObjectOrArray(value)" class="alert-container pa-0">
                                <span v-for="(nestedItem, index) in ObjectOrArrayPipe.IsObjectOrArray(value)" :key=index>
                                    <span v-html="nestedItem"/>
                                </span>
                            </v-container>
                            <FlairWrapper v-else-if="Flair.GetFlairActive && incomingProps.entities" :template-text="value" class="alert-container" :entities="incomingProps.entities" />
                            <span v-else v-html="value"/>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card v-for="entry in promoted.entries" v-else>
                    <v-card-text class="entry-cell">
                        <span v-if="entry == null" />
                        <span v-else-if="!entry.entry_data.flaired_html || !Flair.GetFlairActive || !incomingProps.entities" v-html="entry.entry_data.html" />
                        <FlairWrapper v-else :templateText="entry.entry_data.flaired_html" :entities="incomingProps.entities" />
                    </v-card-text>
                    <v-divider thickness="4px"></v-divider>
                </v-card>
            </v-card>
        </v-container>
    </v-container>
</template>

<style lang="css" scoped>
.scot-theme-light .v-table :deep(tr td:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, .08);
}

.scot-theme-light .v-table :deep(tr th:nth-of-type(odd)) {
    background-color: #ebebeb !important;
}

.scot-theme-dark .v-table :deep(tr td:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, .80);
}

.scot-theme-dark .v-table :deep(tr th:nth-of-type(odd)) {
    background-color: #030303 !important;
}
/* These just style alert data cells, the headers keep the default config below */
:deep(.v-table td:has(.alert-container)) {
    width: 150px;
    max-width: 200px;
    max-height: 200px;
    min-height: 22px;
    overflow-wrap: break-word;
    word-break: break-all;
    text-align: left !important;
    white-space: normal !important;
    padding: 0px 8px !important;
}

.promoted-cell {
    padding: 0px;
    min-height: 50px !important;
    max-height: 50vh;
    overflow: auto;
    background-color: none !important;
}
</style>

<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import LoadingCard from '@/components/Loaders/LoadingCard.vue';
import { useGET_APIStore, useFlairStore } from '@/stores'
import { useTextPipe, useObjectOrArrayPipe } from '@/pipes';
import FlairWrapper from '@/components/Flair/FlairWrapper.vue';
import { EntryClassEnum, IRElementAPIPaths, IRElementType, IRElementTypeSingular } from '@/types/irelement';
import JournalToolbar from '../JournalToolbar.vue';
import { isAxiosError } from 'axios';

const API_GET = useGET_APIStore()
const Flair = useFlairStore()
const TextPipe = useTextPipe()
const ObjectOrArrayPipe = useObjectOrArrayPipe()
const incomingProps = defineProps(['source', 'promotionSources', 'entities', 'editing', 'expanded', 'maximized'])
const emit = defineEmits(['newentry'])
const isLoading = ref(true)
const promotedData = ref([] as any[])
let entry = reactive(incomingProps.source)
let isEntryExpanded = ref(incomingProps.expanded)

watch(
    () => incomingProps.expanded,
    () => {
        isEntryExpanded.value = incomingProps.expanded
    }
)

function getAlertData(promoted) {
    if (!Flair.GetFlairActive || !incomingProps.entities) {
        return promoted.data
    }

    function allAreBlank(alert: any) {
        const { id, ...data } = alert
        delete data["element type"]
        return Object.values(data).every((v: any) => ["", "NULL", null].includes(v))
    }
    if (promoted.data_flaired.every(allAreBlank)) {
        promoted.unflaired = true
        return promoted.data
    }
    else {
        promoted.unflaired = false
        return promoted.data_flaired
    }
}

function mergeFlairEntities(flairResults: any) {
    if (flairResults.totalCount) {
        incomingProps.entities.totalCount += flairResults.totalCount
    }
    if (flairResults.result) {
        for (const result of flairResults.result) {
            if (!incomingProps.entities.result.some(e => e.id == result.id)){
                incomingProps.entities.result.push(result)
                incomingProps.entities.resultCount += 1
            }
        }
    }
}

onMounted(async () => {
    if (incomingProps.promotionSources) {
        const retrievedAlertgroups: any = {}
        const alertAlertgroupMap: Record<number, number> = {}
        for (let i = 0; i < incomingProps.promotionSources.length; i++) {
            if (incomingProps.promotionSources[i].type == "alert") {
                const alertId = incomingProps.promotionSources[i].id
                if (alertId in alertAlertgroupMap) {
                    // alert already retrieved as part of alertgroup
                    const alertgroup = retrievedAlertgroups[alertAlertgroupMap[alertId]]
                    const promotedPosition = promotedData.value.findIndex((ag: any) => ag.id == alertgroup.id)
                    const alertPosition = alertgroup.full_alert_data.findIndex((a: any) => a.id == alertId)
                    const alertData = Object.assign({ id: alertId, "element type": incomingProps.promotionSources[i].type }, alertgroup.full_alert_data[alertPosition])
                    const alertDataFlaired = Object.assign({ id: alertId, "element type": incomingProps.promotionSources[i].type }, alertgroup.full_alert_data_flaired[alertPosition])
                    promotedData.value[promotedPosition].data.push(alertData)
                    promotedData.value[promotedPosition].data_flaired.push(alertDataFlaired)
                }
                else {
                    // alert not in previously-retrieved alertgroup
                    const alert = await API_GET.GET_IRElementPromotedAlerts(incomingProps.promotionSources[i].id)
                    if (alert && !isAxiosError(alert)) {
                        const alertgroup = await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.Alertgroup], alert.alertgroup_id)
                        const alertgroupEntities = await API_GET.GET_IRElementEntity(IRElementAPIPaths[IRElementType.Alertgroup], alert.alertgroup_id)
                        const data = [Object.assign({ id: alert.id, "element type": incomingProps.promotionSources[i].type }, alert.data)]
                        promotedData.value.push({
                            target_type: IRElementTypeSingular[IRElementType.Alertgroup],
                            id: alertgroup.id,
                            promotedTitle: alertgroup.subject,
                            data_flaired: [Object.assign({ id: alert.id, "element type": incomingProps.promotionSources[i].type }, alert.data_flaired)],
                            data: data,
                            headers: Object.keys(data[0]).map((key: string) => {
                                if (key != 'status' && key != 'promoted_ids') {
                                    let width = ""
                                    if (key == "id") {
                                        width = "1%"
                                    }
                                    else if (key == "element type") {
                                        width = "8em"
                                    }
                                    return {
                                        "title": key.toLowerCase(),
                                        "key": key,
                                        "align": "center",
                                        "width": width,
                                        "nowrap": true
                                    }   
                                }
                            })
                        })
                        mergeFlairEntities(alertgroupEntities)
                        retrievedAlertgroups[alertgroup.id] = alertgroup
                        for (const alertData of alertgroup.full_alert_data) {
                            alertAlertgroupMap[alertData.id] = alertgroup.id
                        }
                    }
                }

            }
            else if (incomingProps.promotionSources[i].type != "alertgroup") {
                await API_GET.GET_IRElementDataSelected(TextPipe.toIRElementAPIPath(incomingProps.promotionSources[i].type), incomingProps.promotionSources[i].id).then(async (elementData: any) => {
                    const obj: any = {
                        target_type: incomingProps.promotionSources[i].type,
                        id: incomingProps.promotionSources[i].id,
                        promotedTitle: "<NO TITLE>",
                        entries: [],
                    }

                    if ("subject" in elementData) {
                        obj["promotedTitle"] = elementData.subject
                    }
                    else if ("name" in elementData) {
                        obj["promotedTitle"] = elementData.name
                    }

                    await API_GET.GET_IRElementJournalEntries(TextPipe.toIRElementAPIPath(incomingProps.promotionSources[i].type), incomingProps.promotionSources[i].id).then((v: any) => {
                        const summaryEntries = v.result.filter((a: any) => a.entry_class == EntryClassEnum[EntryClassEnum.summary])
                        const normalEntries = v.result.filter((a: any) => a.entry_class == EntryClassEnum[EntryClassEnum.entry])
                        if (summaryEntries.length > 0) {
                            obj["entries"] = summaryEntries
                        }
                        else if (normalEntries.length > 0) {
                            obj["entries"] = normalEntries
                        }
                        promotedData.value.push(obj)
                    })

                    const elementEntities = await API_GET.GET_IRElementEntity(TextPipe.toIRElementAPIPath(incomingProps.promotionSources[i].type), incomingProps.promotionSources[i].id)
                    mergeFlairEntities(elementEntities)
                })
            }
        }
        isLoading.value = false
    }
})
</script>
