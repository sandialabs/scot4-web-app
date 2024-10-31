<template>
    <v-card :loading="loading">
        <v-list v-if="incidentSelected != null && incidentSelected.data_ver != 'incident'">
            <v-list-item v-for="item, idx in v2Fields" :key="idx" dense v-ripple="false">
                <v-list-item-content>
                    <v-select dense hide-details class="flex-shrink-0 flex-grow-0"
                              :value="getChoiceWithDefault(incidentSelected.data[item], incidentChoicesV2[item])"
                              @input="incidentSelected.data[item] = $event" @blur="updateIncidentField('data')"
                              :items="incidentChoicesV2[item]"
                              :label="fieldNames[item]"></v-select>
                </v-list-item-content>
            </v-list-item>
            <v-list-item dense v-ripple="false" class="mt-n2">
                <v-list-item-content>
                    <v-select dense hide-details class="flex-shrink-0 flex-grow-0"
                              no-data-text="None"
                              v-model="incidentSelected.data.cia"
                              @blur="updateIncidentField('data')"
                              :items="ciaChoices"
                              label="Confidentiality/Integrity/Availability"
                              chips deletable-chips multiple></v-select>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <v-list v-else-if="incidentSelected != null">
            <v-list-item v-for="item, idx in v1Fields" :key="idx" dense v-ripple="false">
                <v-list-item-content>
                    <v-select dense hide-details class="flex-shrink-0 flex-grow-0"
                              :value="getChoiceWithDefault(incidentSelected.data[item], incidentChoicesV2[item])"
                              @input="incidentSelected.data[item] = $event" @blur="updateIncidentField('data')"
                              :items="incidentChoicesV2[item]"
                              :label="fieldNames[item]"></v-select>
                </v-list-item-content>
            </v-list-item>
        </v-list>
        <v-list v-if="incidentSelected != null">
            <v-list-item>
                <v-menu :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        top
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-combobox class="flex-shrink-0 flex-grow-0"
                                    :value="formatDateString(incidentSelected.occurred_date)"
                                    dense
                                    hide-details
                                    clearable
                                    label="Date/Time Occurred (local time)"
                                    v-bind="attrs"
                                    @click:clear="updateIncidentDateField('occurred_date', null)"
                                    @input="updateIncidentDateField('occurred_date', $event)"
                                    v-on="on"></v-combobox>
                    </template>
                    <v-date-picker v-model="incidentSelected.occurred_date"
                                   no-title
                                   @input="updateIncidentDateField('occurred_date', $event, true)"
                                   scrollable>
                    </v-date-picker>
                </v-menu>
            </v-list-item>
            <v-list-item>
                <v-menu :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        top
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-combobox class="flex-shrink-0 flex-grow-0"
                                    :value="formatDateString(incidentSelected.discovered_date)"
                                    dense
                                    hide-details
                                    clearable
                                    label="Date/Time Discovered (local time)"
                                    v-bind="attrs"
                                    @click:clear="updateIncidentDateField('discovered_date', null)"
                                    @input="updateIncidentDateField('discovered_date', $event)"
                                    v-on="on"></v-combobox>
                    </template>
                    <v-date-picker v-model="incidentSelected.discovered_date"
                                   no-title
                                   @input="updateIncidentDateField('discovered_date', $event, true)"
                                   scrollable>
                    </v-date-picker>
                </v-menu>
            </v-list-item>
            <v-list-item v-if="incidentSelected != null">
                <v-menu :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        top
                        min-width="auto">
                    <template v-slot:activator="{ on, attrs }">
                        <v-combobox class="flex-shrink-0 flex-grow-0"
                                    :value="formatDateString(incidentSelected.reported_date)"
                                    dense
                                    hide-details
                                    clearable
                                    label="Date/Time Reported (local time)"
                                    v-bind="attrs"
                                    @click:clear="updateIncidentDateField('reported_date', null)"
                                    @input="updateIncidentDateField('reported_date', $event)"
                                    v-on="on"></v-combobox>
                    </template>
                    <v-date-picker v-model="incidentSelected.reported_date"
                                   no-title
                                   @input="updateIncidentDateField('reported_date', $event, true)"
                                   scrollable>
                    </v-date-picker>
                </v-menu>
            </v-list-item>
            <v-list-item v-for="item, idx in extraIncidentFields()" :key="idx" dense v-ripple="false">
                <v-list-item-content>
                    <v-text-field dense hide-details class="flex-shrink-0 flex-grow-0"
                              v-model="incidentSelected.data[item]"
                              @blur="updateIncidentField('data')"
                              :label="item"></v-text-field>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-card>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'

const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class EditIncidentPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
    incidentSelected: IRElement | null = null
    loading: boolean = false
    fieldNames: Record<string, string> = {
        "type": "Incident Type",
        "threat_vector": "Threat Vectors",
        "sensitivity": "Incident Sensitivity",
        "information_impact": "Information Impact",
        "recoverability": "Recoverability",
        "occurred": "Date/Time Occurred",
        "cia": "Confidentiality/Integrity/Availability",
        "functional_impact": "Functional Impact",
        "assistance": "External Assistance Requested",
        "category": "Incident Category",
        "security_category": "Incident Security Category",
        "discovered": "Date/Time Discovered",
        "closed": "Date/Time Closed",
        "reported": "Date/Time Reported"
    }
    incidentChoices: any = {
        "type": [
            "NONE",
            "FYI",
            "Type 1 : Root Comprimise",
            "Type 1 : User Compromise",
            "Type 1 : Loss/Theft/Missing Desktop",
            "Type 1 : Loss/Theft/Missing Laptop",
            "Type 1 : Loss/Theft/Missing Media",
            "Type 1 : Loss/Theft/Missing Other",
            "Type 1 : Malicious Code Trojan",
            "Type 1 : Malicious Code Virus",
            "Type 1 : Malicious Code Worm",
            "Type 1 : Web Site Defacement",
            "Type 1 : Denial of Service",
            "Type 1 : Critical Infrastructure Protection",
            "Type 1 : Unauthorized Use",
            "Type 1 : Information Compromise",
            "Type 2 : Attempted Intrusion",
            "Type 2 : Reconnaissance Activity"
        ],
        "category": ["NONE", "IMI-1", "IMI-2", "IMI-3", "IMI-4"],
        "sensitivity": ["NONE", "OUO", "PII", "SUI", "UCNI", "Other"],
        "security_category": ["NONE", "Low", "Moderate", "High"],
        "critical_infrastructure": ["NO", "Yes"]
    }
    incidentChoicesV2: any = {
        "type": [
            "NONE",
            "Malicious Code",
            "Loss, Theft, or Missing",
            "PII", "Phishing",
            "Attempted Intrusion",
            "Classified Spillage",
            "Denial of Service",
            "Compromise or Intrusion",
            "Unauthorized Use"
        ],
        "threat_vector": [
            "OTHER",
            "Attrition",
            "Web",
            "Email",
            "External Removable Media",
            "Impersonation",
            "Improper Use",
            "Loss or Theft",
            "Unknown"
        ],
        "sensitivity": ["NONE", "OUO", "PII", "SUI", "UCNI", "Other"],
        "functional_impact": ["NONE", "HIGH", "MEDIUM", "LOW"],
        "information_impact": ["NONE", "Classified", "Proprietary", "Privacy", "Integrity"],
        "recoverability": [
            "NONE",
            "Regular",
            "Supplemented",
            "Extended",
            "not recoverable",
            "not applicable",
            "none"
        ],
        "assistance": ["no", "yes"]
    }
    ciaChoices = ["Confidentiality", "Integrity", "Availability"]
    v1Fields = ["type", "category", "sensitivity", "security_category", "critical_infrastructure"]
    v2Fields = ["type", "threat_vector", "sensitivity", "functional_impact", "information_impact", "recoverability", "assistance"]

    formatDateString(strdate: string) {
        if (!strdate) {
            return ''
        }
        const date = new Date(strdate)
        return date.toLocaleDateString('en-CA') + ' ' + (date.getHours() > 9 ? date.getHours() : '0' + date.getHours()) + ':' + (date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes())
    }

    getChoiceWithDefault(value: string, choices: Array<string>) {
        if (!value) {
            return choices[0];
        }
        return value; // Give back value even if not in choices
    }

    extraIncidentFields() {
        if (this.incidentSelected) {
            return Object.keys(this.incidentSelected.data).filter(key => !Object.keys(this.fieldNames).includes(key))
        }
        return []
    }

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Incident) {
            this.incidentSelected = this.selectedElement
            if (!this.incidentSelected.target) {
                this.incidentSelected.target = {}
            }
        }
        else {
            this.incidentSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange() {
        if (this.selectedElement?.ElementType == IRElementType.Incident) {
            this.incidentSelected = this.selectedElement
            if (!this.incidentSelected.target) {
                this.incidentSelected.target = {}
            }
        }
        else {
            this.incidentSelected = null
        }
    }
    
    // All individual fields get updated when their text boxes are modified
    async updateIncidentField(fieldToUpdate: string) {
        if (this.incidentSelected) {
            const updateData = {
                [fieldToUpdate]: this.incidentSelected[fieldToUpdate]
            }
            this.loading = true
            this.updateElementInList({ elementId: this.incidentSelected.id, elementType: IRElementType.Incident, updateData: updateData })
            this.loading = false
        }
    }

    async updateIncidentDateField(fieldToUpdate: string, value: string | null, fromDatePicker: boolean = false) {
        if (this.incidentSelected) {
            let actualValue = value ? new Date(value).toISOString() : null
            const dataKey = fieldToUpdate.substring(0, fieldToUpdate.length - 5) // Chop off the "_date" from the field name
            if (fromDatePicker && value) {
                const dateParts = value.split('-') // Javascript's date parsing is frustrating
                actualValue = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2]).toISOString()
            }
            this.incidentSelected.data[dataKey] = actualValue
            this.incidentSelected[fieldToUpdate] = actualValue
            const updateData: any = {
                [fieldToUpdate]: this.incidentSelected[fieldToUpdate],
                data: this.incidentSelected.data
            }
            this.loading = true
            this.updateElementInList({ elementId: this.incidentSelected.id, elementType: IRElementType.Incident, updateData: updateData })
            this.loading = false
        }
    }
}
</script>

<style>
    v-list-item::before {
        opacity: 0 !important;
    }
</style>