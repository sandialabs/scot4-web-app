<template>
    <v-card v-if="sigSelected !=null && sigSelected.stats !=null" :loading="loading">
    <v-row>
        <v-col>
            <h1>{{ sigSelected.stats.alert_stats.total_count }} linked alerts </h1>
        </v-col>
        <v-col>
            <h1>{{ sigSelected.stats.alert_stats.closed_count }} linked alerts closed </h1>
        </v-col>
        <v-col>
            <h1>{{ sigSelected.stats.alert_stats.promoted_count }} linked alerts promoted </h1>
        </v-col>
        <v-col>
            <h1>{{ sigSelected.stats.alert_stats.open_count }} linked alerts open </h1>
        </v-col>
    </v-row>
    <v-row>
    <v-col>
        <v-data-table
        :items="tableEntityCounts(sigSelected.stats.alert_stats.total_entity_value_counts)"
        :headers="tableEntityCountsHeaders()"
        caption="Total Linked Alerts Entity Counts">
        </v-data-table>
        </v-col>
        <v-col>
        <v-data-table
        :items="tableEntityCounts(sigSelected.stats.alert_stats.closed_entity_value_counts)"
        :headers="tableEntityCountsHeaders()"
        caption="Closed Linked Alerts Entity Counts">
        </v-data-table>
    </v-col>
    <v-col>
        <v-data-table
        :items="tableEntityCounts(sigSelected.stats.alert_stats.promoted_entity_value_counts)"
        :headers="tableEntityCountsHeaders()"
        caption="Promoted Linked Alerts Entity Counts">
        </v-data-table>
    </v-col>
    <v-col>
        <v-data-table
        :items="tableEntityCounts(sigSelected.stats.alert_stats.open_entity_value_counts)"
        :headers="tableEntityCountsHeaders()"
        caption="Open Linked Alerts Entity Counts">
        </v-data-table>
    </v-col>
</v-row>
    </v-card>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
import { Bar } from 'vue-chartjs/legacy'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
const namespace: string = 'IRElements';

@Component({
  components: {
    Bar
    },
})

export default class EditSignaturePane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    sigSelected: IRElement | null = null
    loading: boolean = false


    tableEntityCountsHeaders(){
        return [{"text":"Entity Value", "value": "entityValue"},{"text":"Count", "value":"entityCount"}]
    }
    tableEntityCounts(entityCounts:any){
        let returnVal = []
        for (const entityValue in entityCounts){
            returnVal.push({"entityValue":entityValue, "entityCount": entityCounts[entityValue]})
        }
        return returnVal
    }

    @Watch('selectedElement')
    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Signature) {
            this.sigSelected = this.selectedElement
        }
        else {
            this.sigSelected = null
        }
    }

}
</script>