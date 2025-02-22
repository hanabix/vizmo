<script setup lang="ts">
import { ref, onMounted } from "vue"
import * as WitMotion from "../types/witmotion"
import { SerialPort } from "../types/port"
import BatteryIndicator from './BatteryIndicator.vue'

const { device } = defineProps<{
  device: BluetoothDevice
}>()

const agent = ref<SerialPort | null>(null)
const battery = ref<number>(0)
const firmware = ref<string>('')
const meters = ref<WitMotion.Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])

device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected')
  agent.value = null
})

async function connect() {
  if (device.gatt) {
    const server = device.gatt
    if (!server.connected) await server.connect()
    const port = await SerialPort.of(server, WitMotion.WT9011DCL)
    agent.value = port

    battery.value = await port.ask(WitMotion.battery)
    firmware.value = await WitMotion.askFirmware(port)


    port.watch(WitMotion.meters, (data) => meters.value = data)
  }
}

onMounted(connect)
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-medium text-gray-700">{{ device.name ?? device.id }}</h3>
        <BatteryIndicator :value="battery" />
      </div>
      <button class="text-gray-700 hover:text-gray-900">
        <span class="material-icons">more_vert</span>
      </button>
    </div>

    <div class="mb-4">
      <small class="text-sm text-gray-500">ver: {{ firmware }}</small>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">加速度</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ meters[0][0].toFixed(2) }}</div>
          <div>Y: {{ meters[0][1].toFixed(2) }}</div>
          <div>Z: {{ meters[0][2].toFixed(2) }}</div>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">陀螺仪</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ meters[1][0].toFixed(2) }}</div>
          <div>Y: {{ meters[1][1].toFixed(2) }}</div>
          <div>Z: {{ meters[1][2].toFixed(2) }}</div>
        </div>
      </div>

      <div class="bg-gray-50 p-3 rounded">
        <h4 class="text-sm font-medium text-gray-600 mb-2">旋转角</h4>
        <div class="text-xs text-gray-500">
          <div>X: {{ meters[2][0].toFixed(2) }}°</div>
          <div>Y: {{ meters[2][1].toFixed(2) }}°</div>
          <div>Z: {{ meters[2][2].toFixed(2) }}°</div>
        </div>
      </div>
    </div>
  </div>
</template>