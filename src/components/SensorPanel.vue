<script setup lang="ts">
import { ref, onMounted } from "vue"
import type { Sensor, Features, Settings } from "../modules/wit-motion"
import { sensorFrom, Rate } from "../modules/wit-motion"
import Status from './SensorStatus.vue'
import Simulator from './VSimulator.vue'

const { device, remove } = defineProps<{
  device: BluetoothDevice
  remove: () => void
}>()

const connecting = ref<boolean>(false)
const sensorRef = ref<Sensor<Features & Settings>>()
const battery = ref<number>(0)
const firmware = ref<string>('--')

device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected')
  sensorRef.value = undefined
})

async function connect() {
  connecting.value = true
  try {
    const sensor = await sensorFrom(device.gatt!)
    battery.value = await sensor.get('battery')
    firmware.value = await sensor.get('firmware')

    console.log(await sensor.get('rate').then(r => Rate[r]))

    sensorRef.value = sensor
  } catch (error) {
    console.error('连接设备失败:', error)
  } finally {
    connecting.value = false
  }
}

onMounted(connect)
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 flex flex-col">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="font-medium text-gray-700">{{ device.name ?? device.id }}</h3>
        <Status v-if="sensorRef" :battery="battery" :firmware="firmware" />
      </div>
      <button v-if="!connecting" @click="remove"
        class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex items-center" title="断开连接">
        <span class="material-icons">bluetooth_disabled</span>
      </button>
    </div>

    <Simulator v-if="sensorRef" v-bind="sensorRef" class="mt-4"/>
    <button v-else @click="connect" :disabled="connecting"
      class="text-blue-500 mt-4 p-1 rounded-lg hover:bg-gray-50 flex items-center justify-center" title="重新连接">
      <span class="material-icons" :class="{ 'animate-ping': connecting }">link</span>
    </button>
  </div>

</template>