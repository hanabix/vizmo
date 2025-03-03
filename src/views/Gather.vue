<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { agents } from '../modules/agent'
import { gather } from '../modules/gather'
import { Rate, hz } from '../modules/wit-motion'
import type { To } from './'
import Panel from '../components/Panel.vue'
import Status from '../components/Status.vue'
import Instantly from '../components/Instantly.vue'
import Indicator from '../components/Indicator.vue'
import MTable from '../components/MetersTable.vue'
import Toolbar from '../components/Toolbar.vue'

const { to } = defineProps<{
  to: To<'Playback'>
}>()

const cancel = ref(() => { })
const started = ref(false)
const end = {
  icon: 'stop_circle', label: '结束', click: () => {
    cancel.value()
    to('Playback')
  }
}

const buttons = [end]

onMounted(async () => {

  try {
    await Promise.all(agents.value.map(a => {
      // console.log(`set rate to 50Hz for ${a.name}`)
      a.sensor!.set('rate', Rate.Hz_50)
    }))

    const c = gather(hz(Rate.Hz_50), agents.value)
    started.value = true
    cancel.value = async () => {
      c()
      await Promise.all(agents.value.map(a => a.sensor!.set('rate', Rate.Hz_10)))
    }

  } catch (error) {
    console.error(error)
  }
})

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <template v-for="agent in agents" :key="agent.id">
      <Panel :title="agent.name">
        <template v-if="agent.sensor" #subtitle>
          <Suspense>
            <Status v-bind="agent.sensor" />
          </Suspense>
        </template>

        <template #content>
          <Instantly v-if="agent.sensor" :watch="agent.sensor.watch">
            <Indicator class="mt-4" />
            <MTable class="mt-4" />
          </Instantly>

          <div v-else class="text-blue-500 mt-4 p-1 rounded-lg hover:bg-gray-50 flex items-center justify-center">
            <span class="material-icons animate-ping">link</span>
          </div>
        </template>
      </Panel>
    </template>
  </div>

  <Toolbar v-if="started" :buttons="buttons" />
</template>