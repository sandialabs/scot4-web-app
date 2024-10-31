<template>
    <v-container fluid class="pa-0">
        <v-progress-circular v-if="retrievingPromotions"
                             indeterminate
                             color="primary">
        </v-progress-circular>
        <v-container v-else v-for="(promotionObject, index) in promotionObjects" :key=index class="pa-0 mb-4" fluid>
            <v-card v-if="promotionObject.type == 'alert'">
                <v-card-title>
                    <u> {{ promotionObject.alertGroupTitle}}</u>
                </v-card-title>
                <v-card-subtitle>
                    Promoted from Alertgroup {{ promotionObject.alertGroupId}}
                </v-card-subtitle>
                <v-card-text>
                    <v-simple-table>
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left">
                                        ID
                                    </th>
                                    <th class="text-left">
                                        Element Type
                                    </th>
                                    <th class="text-left" v-for="header in Object.keys(Object.values(promotionObject.elementData)[0])" :key=header>
                                        {{ header }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(row, rowId) in promotionObject.elementData" :key=row.id>
                                    <td>
                                        <router-link :to="'/alertgroups/' + promotionObject.alertGroupId">
                                            {{ rowId }}
                                        </router-link>
                                    </td>
                                    <td>
                                        {{ promotionObject.type }}
                                    </td>
                                    <td v-for="(value, key) in row" :key=key>
                                        <v-container fluid class="pa-0" style="width:100%" v-if="isObjectOrArray(promotionObject.elementDataFlaired[rowId][key]) != false && flairVisible">
                                            <span v-for="(nestedItem, index) in isObjectOrArray(promotionObject.elementDataFlaired[rowId][key])" :key=index style="width:100%; white-space: pre-wrap" class="text-left mt-n1 mb-1">
                                                <FlairedTextComponent v-if="plain_alert_columns.includes(key.value)==false" :templateText="nestedItem" />
                                                <span v-else class="text-left">
                                                    {{nestedItem}}
                                                </span>
                                                <br>
                                            </span>
                                        </v-container>
                                        <v-container fluid class="pa-0" style="width:100%" v-else-if="isObjectOrArray(value) != false && (!flairVisible || !promotionObject.elementDataFlaired[rowId][key])">
                                            <span v-for="(nestedItem, index) in isObjectOrArray(value)" :key=index style="width:100%; white-space: pre-wrap" class="text-left mt-n1 mb-1">
                                                <FlairedTextComponent v-if="plain_alert_columns.includes(key.value)==false" :templateText="nestedItem" />
                                                <span v-else class="text-left">
                                                    {{nestedItem}}
                                                </span>
                                                <br>
                                            </span>
                                        </v-container>
                                        <FlairedTextComponent v-else-if="rowId in promotionObject.elementDataFlaired && flairVisible && promotionObject.elementDataFlaired[rowId][key]"
                                                              :templateText="promotionObject.elementDataFlaired[rowId][key]">
                                        </FlairedTextComponent>
                                        <span v-else>{{ value }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                </v-card-text>
            </v-card>
            <v-card v-else v-for="entry in promotionObject.entries" :key="entry.id" class="ck-content mb-1 content-card">
                <v-card-title>
                    {{ promotionObject.promotedTitle }}
                </v-card-title>
                <v-card-subtitle>
                    Promoted from
                    <router-link :to="'/' + pluralizeElementType(promotionObject.type) + '/' + promotionObject.id.toString()">
                        {{ promotionObject.type }} {{ promotionObject.id }}
                    </router-link>
                </v-card-subtitle>
                <v-card-text>
                    <span v-if="entry == null"></span>
                    <span v-else-if="!entry.entry_data.flaired_html || !flairVisible" v-html="entry.entry_data.html"></span>
                    <FlairedTextComponent v-else :templateText="entry.entry_data.flaired_html"></FlairedTextComponent>
                </v-card-text>
            </v-card>
        </v-container>
    </v-container>
</template>


<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Action, Getter, Mutation } from 'vuex-class';
import { EntryClassEnum, IRElementType, IRElement, LinkedElement } from '@/store/modules/IRElements/types'
import FlairedTextComponent from '../WYSIWYGCell/FlairPlugin/FlairedTextComponent.vue'
import { plain_alert_columns } from '../../../../constants';
import { convertFromSnakeCase } from '../../../../utils/elementUtils'
import _ from 'lodash';

const namespace: string = 'IRElements';


@Component({
    components: {
        FlairedTextComponent
    },
})

export default class PromotedCellView extends Vue{
    @Prop() entryId: number;
    @Getter('entryById', { namespace }) entryById: CallableFunction
    @Getter('selectedElementLinkedElements', { namespace }) selectedElementLinkedElements: { [key in IRElementType]: Array<LinkedElement> };
    @Getter('flairVisible', { namespace }) flairVisible: boolean
    @Getter('selectedElementAbortController', { namespace }) selectedElementAbortController: AbortController | null
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;
    @Mutation('errorOccurred') errorOccurred: CallableFunction;

    promotionObjects: Array<any> = []
    retrievingPromotions: boolean = true
    plain_alert_columns = plain_alert_columns
    async mounted(){
        // So I think we don't want to be keeping all this data in the vuex state, that could lead to a ton of bloating. Rather 
        // just keep this data local to the component(s).
        await this.$nextTick()
        const promotionSources = this.entryById(this.entryId).entry_data.promotion_sources
        const alertgroups: any = { unflaired: {}, flaired: {}, objects: {} }
        const alertgroupAlerts: any = {}
        for (const index in promotionSources) {
            try {
                const promotionObject: any = {}
                promotionObject.id = promotionSources[index].id
                promotionObject.type = promotionSources[index].type
                const elementType: IRElementType = IRElementType[convertFromSnakeCase(promotionObject.type) as keyof typeof IRElementType]
                let linkedElement: IRElement | undefined = undefined
                // Pull from linked elements cache if possible
                if (this.selectedElementLinkedElements) {
                    linkedElement = this.selectedElementLinkedElements[elementType].find(e => e.element.id == promotionObject.id)?.element
                    // For alerts, also look in previously-retrieved alertgroups
                    // Retrieve element if it has not yet been retrieved for this item
                    if (!linkedElement && !(elementType == IRElementType.Alert && alertgroupAlerts[promotionObject.id])) {
                        const resp = await Vue.prototype.$api.elements.retrieveElementbyID(promotionObject.id, elementType, this.selectedElementAbortController)
                        linkedElement = resp.data as IRElement
                        this.selectedElementLinkedElements[elementType].push({ element: linkedElement, entries: [] })
                    }
                }
                else {
                    linkedElement = await Vue.prototype.$api.elements.retrieveElementbyID(promotionObject.id, elementType, this.selectedElementAbortController).data
                }
                if (elementType == IRElementType.Alert && (linkedElement || alertgroupAlerts[promotionObject.id])) {
                    let elementData: any = {}
                    let elementDataFlaired: any = {}
                    const linkedAlertgroupId = linkedElement ? linkedElement.alertgroup_id : alertgroupAlerts[promotionObject.id]
                    if (linkedElement) {
                        elementData = linkedElement.data
                        elementDataFlaired = linkedElement.data_flaired
                    }
                    else {
                        const position = alertgroups.objects[linkedAlertgroupId].full_alert_data.findIndex((a: any) => a.id == promotionObject.id)
                        elementData = { ...alertgroups.objects[linkedAlertgroupId].full_alert_data[position] }
                        elementDataFlaired = { ...alertgroups.objects[linkedAlertgroupId].full_alert_data_flaired[position] }
                        delete elementData.id
                        delete elementData.status
                        delete elementData.promoted_ids
                        delete elementDataFlaired.id
                        delete elementDataFlaired.status
                        delete elementDataFlaired.promoted_ids
                    }
                    if (alertgroups.unflaired[linkedAlertgroupId] == undefined) {
                        let linkedAlertgroup: IRElement | undefined = undefined
                        if (this.selectedElementLinkedElements) {
                            linkedAlertgroup = this.selectedElementLinkedElements[IRElementType.Alertgroup].find(e => e.element.id == linkedAlertgroupId)?.element
                            // Retrieve alertgroup if not in linked elements cache
                            if (!linkedAlertgroup) {
                                const alertGroupResp = await Vue.prototype.$api.elements.retrieveElementbyID(linkedAlertgroupId, IRElementType.Alertgroup, this.selectedElementAbortController)
                                linkedAlertgroup = alertGroupResp.data as IRElement
                                this.selectedElementLinkedElements.Alertgroup.push({ element: linkedAlertgroup, entries: [] })
                            }
                        }
                        else {
                            linkedAlertgroup = await Vue.prototype.$api.elements.retrieveElementbyID(linkedAlertgroupId, IRElementType.Alertgroup, this.selectedElementAbortController).data
                        }
                        if (linkedAlertgroup) {
                            promotionObject['alertGroupTitle'] = linkedAlertgroup.subject
                            promotionObject['alertGroupId'] = linkedAlertgroup.id
                            const elementDataObject = { [promotionObject.id]: elementData }
                            const elementDataFlairedObject = { [promotionObject.id]: elementDataFlaired }
                            promotionObject['elementData'] = elementDataObject
                            promotionObject['elementDataFlaired'] = elementDataFlairedObject
                            alertgroups.unflaired[linkedAlertgroup.id as number] = elementDataObject
                            alertgroups.flaired[linkedAlertgroup.id as number] = elementDataFlairedObject
                            alertgroups.objects[linkedAlertgroup.id as number] = linkedAlertgroup
                            if (linkedAlertgroup.full_alert_data) {
                                for (const alert_data of linkedAlertgroup.full_alert_data) {
                                    alertgroupAlerts[alert_data.id] = linkedAlertgroup.id
                                }
                            }
                            this.promotionObjects.push(promotionObject)
                        }
                    }
                    else {
                        alertgroups.unflaired[linkedAlertgroupId][promotionSources[index].id] = elementData
                        alertgroups.flaired[linkedAlertgroupId][promotionSources[index].id] = elementDataFlaired
                    }
                }
                else if (linkedElement){
                    const promotedData = linkedElement
                    if ('subject' in promotedData) {
                        promotionObject['promotedTitle'] = promotedData.subject
                    }
                    else if ('name' in promotedData) {
                        promotionObject['promotedTitle'] = promotedData['name']
                    }
                    else {
                        promotionObject['promotedTitle'] = '<NO TITLE>'
                    }
                    // Get all of the object entries - maybe trim this down a bit to save space?
                    // Request from IR team: put ALL summary (or regular if no summary) entries into the promotion, leave this way for now
                    const entryResp = await Vue.prototype.$api.elements.retrieveElementEntriesbyID(promotionSources[index].id, elementType)
                    const summaryEntries = entryResp.data.result.filter((e: any) => e.entry_class == EntryClassEnum[EntryClassEnum.summary])
                    const normalEntries = entryResp.data.result.filter((e: any) => e.entry_class == EntryClassEnum[EntryClassEnum.entry])
                    if (summaryEntries.length > 0) {
                        promotionObject['entries'] = summaryEntries
                    }
                    else if (normalEntries.length > 0) {
                        promotionObject['entries'] = normalEntries
                    }
                    else {
                        promotionObject['entries'] = []
                    }
                    this.promotionObjects.push(promotionObject)
                }
            }
            // Suppress exceptions from cancellation
            catch (e: any) {
                if (!e.__CANCEL__) {
                    this.errorOccurred(e)
                }
            }
        }
        this.retrievingPromotions = false
    }

    pluralizeElementType(elementType: string) {
        if (elementType == "entity") {
            return "entities"
        }
        else if (elementType == "dispatch") {
            return "dispatches"
        }
        else if (elementType == "entityclass") {
            return "entity classes"
        }
        else {
            return elementType + "s"
        }
    }

    isObjectOrArray(value: string) {
        try {
            let obj = JSON.parse(value)
            if (Array.isArray(obj)) {
                return obj
            }
            else {
                return false
            }
        }
        catch (e) {
            return false
        }
    }
}

</script>
<style scoped>
.ck-editor__editable {
    max-height: 400px;
}


.content-card {
    max-height: 50vh;
    overflow: auto;
}
</style>