import { readonly, ref, shallowReactive } from 'vue'
import { sensorFrom, type Sensor, type UUIDs } from '../wit-motion'

const _agents = ref<Agent[]>([])
export const agents = readonly(_agents)

export interface Agent {
  readonly id: string
  readonly name: string
  sensor?: Sensor
  selected: boolean
}

interface InnerAgent extends Agent {
  disconnect: () => void
}

export async function request(u: UUIDs) {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{
        services: [u.service],
      }],
    })

    if (agents.value.some(a => a.id === device.id)) return

    _agents.value.push(useAgent(device, u))

    device.addEventListener('gattserverdisconnected', () => {
      console.log(`Device ${device.name ?? device.id} disconnected`)
      _agents.value = agents.value.filter(a => a.id !== device.id)
    })
  } catch (e) {
    console.error(e)
  }
}

export function disconnect(...agents: Agent[]) {
  agents.forEach((a) => (a as InnerAgent).disconnect())
}

export function toggle(selected: boolean, ...agents: Agent[]) {
  agents.forEach((a) => a.selected = selected)
}

function useAgent(device: BluetoothDevice, u: UUIDs) {
  const agent = shallowReactive<InnerAgent>({
    id: device.id,
    name: device.name ?? device.id,
    sensor: undefined,
    selected: true,
    disconnect: () => { if (device.gatt?.connected) device.gatt?.disconnect() }
  })
  sensorFrom(device.gatt!, u).then(s => agent.sensor = s, e => console.error(e))
  return agent
}
