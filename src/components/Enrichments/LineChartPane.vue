<template>
    <div class="linechart-enrichment-container" v-if="chartData">
        <LineChartGenerator
            :options="chartOptions"
            :data="chartData"
            :id="id"
            dataset-id-key="label"
            class="linechart-enrichment"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import {Line as LineChartGenerator} from "vue-chartjs"
import { Chart, Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement } from 'chart.js';

const incomingProps = defineProps(['data'])
const enrichmentData: any = reactive(incomingProps.data)

Chart.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
)

const chartOptions = {responsive: true, maintainAspectRatio: false}
const id = computed(() => `linechart-enrichment-${enrichmentData?.id}`)
const chartData = computed(() => enrichmentData?.data?.chart_data)
</script>

<style scoped>
.linechart-enrichment-container {
    position: relative;
    width: 100%;
    height: 380px;
}

.linechart-enrichment {
    background-color: rgb(var(--v-theme-surface));
}
</style>
