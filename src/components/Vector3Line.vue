<script setup lang="ts">
import { onMounted, ref, watch, inject } from 'vue'
import * as Plotly from 'plotly.js-dist-min'
import Key from './key'
import { complain } from '../modules/utils'

const chartRef = ref<HTMLDivElement>()
const data = ref<{ x: number, y: number, z: number }[]>([])
const maxPoints = 100
const meters = inject(Key.meters) ?? complain('failed to inject meters')

const layout: Partial<Plotly.Layout> = {
  showlegend: false,
  xaxis: { visible: false, showspikes: true, spikemode: 'across', spikesnap: 'cursor', spikedash: 'solid', spikethickness: 1 },
  yaxis: { tickmode: 'array', tickvals: [0], ticktext: ['0'] },
  height: 60,
  margin: { t: 10, r: 0, b: 20, l: 20 },
}

const traces = [
  { name: 'X', line: { color: '#ff0000' }, hovertemplate: '<extra></extra>' },
  { name: 'Y', line: { color: '#00ff00' }, hovertemplate: '<extra></extra>' },
  { name: 'Z', line: { color: '#0000ff' }, hovertemplate: '<extra></extra>' }
].map(trace => ({
  ...trace,
  type: 'scatter' as const,
  mode: 'lines' as const,
  x: [] as number[],
  y: [] as number[]
}))

function updateChart() {
  if (!chartRef.value || data.value.length === 0) return

  const indices = Array.from({length: data.value.length}, (_, i) => i)
  traces[0].x = indices
  traces[1].x = indices
  traces[2].x = indices
  traces[0].y = data.value.map(d => d.x)
  traces[1].y = data.value.map(d => d.y)
  traces[2].y = data.value.map(d => d.z)

  Plotly.react(chartRef.value, traces, layout, {responsive: true, displayModeBar: false})
}

onMounted(() => {
  if (!chartRef.value) return
  Plotly.newPlot(chartRef.value, traces, layout)
})

watch(meters, (newValue) => {
  data.value.push({
    x: newValue[0][0],
    y: newValue[0][1],
    z: newValue[0][2]
  })

  if (data.value.length > maxPoints) {
    data.value.shift()
  }

  updateChart()
}, { immediate: true })
</script>

<template>
  <div ref="chartRef"></div>
</template>