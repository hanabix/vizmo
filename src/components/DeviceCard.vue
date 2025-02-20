<script setup lang="ts">
import { ref, onMounted } from "vue"
import * as WitMotion from "../types/witmotion"
import { SerialPort } from "../types/port"

const { device } = defineProps<{
  device: BluetoothDevice
}>()

const agent = ref<SerialPort | null>(null)

device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected')
})

async function loadAgent() {
  if (device.gatt) {
    const server = device.gatt
    if (!server.connected) await server.connect()
    const port = await SerialPort.of(server, WitMotion.WT9011DCL)
    const n = await port.ask(WitMotion.battery)
    console.log(n)
  }

}
onMounted(loadAgent)
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div>
        <h3 class="font-medium text-gray-700">{{ device.name ?? device.id }}</h3>
      </div>
    </div>
    <button class="text-gray-700 hover:text-gray-900">
      <span class="material-icons">more_vert</span>
    </button>
  </div>
</template>