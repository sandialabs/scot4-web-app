<template>
    <v-container fluid class="pa-0">
        <v-progress-circular v-if="retrievingPromotions"
                             indeterminate
                             color="primary">
        </v-progress-circular>
        <v-card v-else-if="error">
            Error: {{error}}
        </v-card>
        <v-container v-else-if="promotionObjects.length > 0" v-for="(promotionObject, index) in promotionObjects" :key=index class="pa-0" fluid>
            <v-card v-if="promotionObject.type == 'alert'">
                <v-card-title>
                    <u> {{ promotionObject.alertGroupTitle}}</u>
                </v-card-title>
                <v-card-subtitle>
                    Promoted from Alertgroup {{ promotionObject.alertGroupId}}
                </v-card-subtitle>
                <v-simple-table>
                    <template v-slot:default>
                        <thead>
                            <tr>
                                <th class="text-left">
                                    ID
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
                                <td v-for="(value, key) in row" :key=key>
                                    <v-container fluid class="pa-0" style="width:100%" v-if="isObjectOrArray(promotionObject.elementDataFlaired[rowId][key]) != false && flairVisible">
                                        <span v-for="(nestedItem, index) in isObjectOrArray(promotionObject.elementDataFlaired[rowId][key])" :key=index style="width:100%; white-space: pre-wrap" class="text-left mt-n1 mb-1">
                                            <FlairedTextComponent v-if='plain_alert_columns.includes(key.value)==false' :templateText="nestedItem" />
                                            <span v-else class="text-left">
                                                {{nestedItem}}
                                            </span>
                                            <br>
                                        </span>
                                    </v-container>
                                    <v-container fluid class="pa-0" style="width:100%" v-else-if="isObjectOrArray(value) != false && (!flairVisible || !promotionObject.elementDataFlaired[rowId][key])">
                                        <span v-for="(nestedItem, index) in isObjectOrArray(value)" :key=index style="width:100%; white-space: pre-wrap" class="text-left mt-n1 mb-1">

                                            <FlairedTextComponent v-if='plain_alert_columns.includes(key.value)==false' :templateText="nestedItem" />
                                            <span v-else class="text-left">
                                                {{nestedItem}}
                                            </span>
                                            <br>
                                        </span>
                                    </v-container>
                                    <FlairedTextComponent v-else-if="rowId in promotionObject.elementDataFlaired && flairVisible"
                                                          :templateText="promotionObject.elementDataFlaired[rowId][key]">
                                    </FlairedTextComponent>
                                    <span v-else>{{ value }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </template>
                </v-simple-table>
            </v-card>
        </v-container>
        <v-container v-else>
            No promoted alerts
        </v-container>
    </v-container>
</template>


<script lang="ts">import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Action, Getter, Mutation } from 'vuex-class';
import { IRElementType, IRElement, LinkedElement } from '@/store/modules/IRElements/types'
import FlairedTextComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairedTextComponent.vue'
import { plain_alert_columns } from '../../constants';
import { convertFromSnakeCase } from '../../utils/elementUtils'

const namespace: string = 'IRElements';

@Component({
    components: {
        FlairedTextComponent
    },
})

export default class PromotedCellView extends Vue {
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementLinkedElements', { namespace }) selectedElementLinkedElements: { [key in IRElementType]: Array<LinkedElement> };
    @Getter('flairVisible', { namespace }) flairVisible: boolean
    @Getter('selectedElementAbortController', { namespace }) selectedElementAbortController: AbortController | null
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;
    @Mutation('errorOccurred') errorOccurred: CallableFunction;

    promotionObjects: Array<any> = []
    retrievingPromotions: boolean = true
    plain_alert_columns = plain_alert_columns
    error = null

    async mounted() {
        await this.retrievePromotions()
    }

    @Watch("selectedElement")
    async onElementChange() {
        if (!this.retrievingPromotions) {
            this.promotionObjects = []
            await this.retrievePromotions()
        }
    }

    async retrievePromotions() {
        this.retrievingPromotions = true
        const promotions = this.selectedElement?.promoted_from_sources || []
        const alertgroups: any = { unflaired: {}, flaired: {}, objects: {} }
        const alertgroupAlerts: any = {}
        try {
            for (const promotion of promotions) {
                const promotionObject: any = {}
                promotionObject.id = promotion.p0_id
                promotionObject.type = promotion.p0_type
                const elementType: IRElementType = IRElementType[convertFromSnakeCase(promotionObject.type) as keyof typeof IRElementType]
                // Retrieve only promoted alerts for this tab
                if (elementType == IRElementType.Alert) {
                    let linkedAlert = this.selectedElementLinkedElements[elementType].find(e => e.element.id == promotionObject.id)?.element
                    // Retrieve alert if it has not yet been retrieved for this item
                    if (!linkedAlert && !alertgroupAlerts[promotionObject.id]) {
                        const resp = await Vue.prototype.$api.elements.retrieveElementbyID(promotionObject.id, elementType, this.selectedElementAbortController)
                        linkedAlert = resp.data as IRElement
                        this.selectedElementLinkedElements.Alert.push({ element: linkedAlert, entries: [] })
                    }
                    // Pull alertgroup from cache (if necessary)
                    const linkedAlertgroupId = linkedAlert ? linkedAlert.alertgroup_id : alertgroupAlerts[promotionObject.id]
                    let elementData: any = {}
                    let elementDataFlaired: any = {}
                    if (linkedAlert) {
                        elementData = linkedAlert.data
                        elementDataFlaired = linkedAlert.data_flaired
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
                        let linkedAlertgroup = this.selectedElementLinkedElements[IRElementType.Alertgroup].find(e => e.element.id == linkedAlertgroupId)?.element
                        // Retrieve alertgroup if not in linked elements cache
                        if (!linkedAlertgroup) {
                            const alertGroupResp = await Vue.prototype.$api.elements.retrieveElementbyID(linkedAlertgroupId, IRElementType.Alertgroup, this.selectedElementAbortController)
                            linkedAlertgroup = alertGroupResp.data as IRElement
                            this.selectedElementLinkedElements.Alertgroup.push({ element: linkedAlertgroup, entries: [] })
                        }
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
                    // If already alerts in this alertgroup, push into alertgroup dictionary
                    else {
                        alertgroups.unflaired[linkedAlertgroupId][promotionObject.id] = elementData
                        alertgroups.flaired[linkedAlertgroupId][promotionObject.id] = elementDataFlaired
                    }
                }
            }
        }
        // Suppress exceptions from cancellation
        catch (e: any) {
            if (!e.__CANCEL__) {
                this.errorOccurred(e)
            }
        }
        this.retrievingPromotions = false
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