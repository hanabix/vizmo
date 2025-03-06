import type { PlotlyHTMLElement, PlotData, Layout, Config } from 'plotly.js-dist-min'
import { newPlot, react, purge } from 'plotly.js-dist-min'
import type { Disposable } from '../types'

export interface Vector3Plot extends Disposable, Pick<PlotlyHTMLElement, 'on'> {
  react(data: [number, number, number][]): void
}

const layout: Partial<Layout> = {
  showlegend: false,
  xaxis: { visible: false, showspikes: true, spikemode: 'across', spikesnap: 'cursor', spikedash: 'solid', spikethickness: 1 },
  yaxis: { tickmode: 'array', tickvals: [0], ticktext: ['0'] },
  margin: { t: 10, r: 0, b: 20, l: 20 },
}

const traces: Partial<PlotData>[] = [
  { name: 'X', line: { color: '#ff0000' }, hovertemplate: '<extra></extra>' },
  { name: 'Y', line: { color: '#00ff00' }, hovertemplate: '<extra></extra>' },
  { name: 'Z', line: { color: '#0000ff' }, hovertemplate: '<extra></extra>' }
].map(trace => ({
  ...trace,
  type: 'scatter',
  mode: 'lines',
  x: [],
  y: []
}))

export default async function create(root: HTMLElement): Promise<Vector3Plot> {
  const config: Partial<Config> = { responsive: true, displayModeBar: false }
  const dom = await newPlot(root, traces, layout, config)
  return {
    react: (data) => {
      const indices = Array.from({ length: data.length }, (_, i) => i)
      traces[0].x = indices
      traces[1].x = indices
      traces[2].x = indices
      traces[0].y = data.map(([x]) => x)
      traces[1].y = data.map(([_, y]) => y)
      traces[2].y = data.map(([_, __, z]) => z)
      react(dom, traces, layout, config)
    },
    dispose: () => {
      purge(dom)
    },
    ...dom
  }
}