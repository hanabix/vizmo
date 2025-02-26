<script setup lang="ts">
import { ref, onMounted } from "vue"
import { agentOf, Rate, type Agent, type Meters, type Features, type Settings } from "../types/witmotion"
import DeviceInfo from './DeviceInfo.vue'
import DeviceMeters from './DeviceMeters.vue'

const { device, remove } = defineProps<{
  device: BluetoothDevice
  remove: () => void
}>()

const connecting = ref<boolean>(false)
const agentRef = ref<Agent<Features & Settings>>()
const battery = ref<number>(0)
const firmware = ref<string>('--')
const meters = ref<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])

device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected')
  agentRef.value = undefined
})

async function connect() {
  connecting.value = true
  try {
    const agent = await agentOf(device.gatt!)
    battery.value = await agent.get('battery')
    firmware.value = await agent.get('firmware')

    console.log(await agent.get('rate').then(r => Rate[r]))
    // console.log(await agent.set('rate', Rate.Hz_1).then(r => Rate[r]))
    agent.watch((data) => meters.value = data)

    agentRef.value = agent
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
        <DeviceInfo v-if="agentRef" :battery="battery" :firmware="firmware" />
      </div>
      <button v-if="!connecting" @click="remove" class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex items-center" title="断开连接">
        <span class="material-icons">bluetooth_disabled</span>
      </button>
    </div>
    
    <DeviceMeters v-if="agentRef" :meters="meters" />
    <button v-else @click="connect" :disabled="connecting" class="text-blue-500 mt-4 p-1 rounded-lg hover:bg-gray-50 flex items-center justify-center" title="重新连接">
      <span class="material-icons" :class="{'animate-ping': connecting}">link</span>
    </button>
  </div>

</template>