<template>
  <LineChartGenerator
    :chart-options=chartOptions
    :chart-data="enrichment.data.chart_data"
    :chart-id="enrichmentID()"
    dataset-id-key="label"
  />
</template>

<script lang="ts">
import { Line as LineChartGenerator } from 'vue-chartjs/legacy'
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { Entity, IRElement, IRElementType } from '@/store/modules/IRElements/types'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
} from 'chart.js'
const namespace: string = 'IRElements';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
)

@Component({
  components: {
   LineChartGenerator
    },
})

export default class LineChartPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
    @Prop() enrichment: any

    chartOptions: any = {responsive:true, maintainAspectRatio: false,}
    enrichmentID()
    {
      return this.enrichment.id.toString()
    }
}
</script>