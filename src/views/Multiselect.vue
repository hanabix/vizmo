<script setup lang="ts">
import { computed } from 'vue'
import { agents, disconnect as remove, toggle } from '../modules/agent'
import type { To } from '.'
import Panel from '../components/Panel.vue'
import Status from '../components/Status.vue'
import Instantly from '../components/Instantly.vue'
import Indicator from '../components/Indicator.vue'
import MTable from '../components/MetersTable.vue'
import Toolbar from '../components/Toolbar.vue'

const { to } = defineProps<{ to: To<'Gather' | 'Home'> }>()

const disconnect = {
  icon: 'link_off', label: '断开', click: () => {
    console.log('disconnect')
    remove(...agents.value.filter(a => a.selected))
    to('Home')
  }
}

const gather = {
  icon: 'fiber_manual_record', label: '采集', click: () => {
    to('Gather')
  }
}
const back = { icon: 'close', label: '返回', click: () => to('Home') }
const buttons = computed(() => [check(), disconnect, gather, back])

function check() {
  const flag = agents.value.every(a => a.selected)
  return {
    icon: flag ? 'check_box' : 'check_box_outline_blank',
    label: flag ? '全消' : '全选',
    click: () => {
      console.log(`check ${flag}`)
      toggle(!flag, ...agents.value)
    }
  }
}

</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <template v-for="agent in agents" :key="agent.id">
      <Panel v-if="agent.sensor" :title="agent.name">
        <template #subtitle>
          <Suspense>
            <Status v-bind="agent.sensor" />
          </Suspense>
        </template>

        <template #actions>
          <button @click="toggle(!agent.selected, agent)" class="p-1 rounded-full hover:bg-red-50 flex items-center">
            <span class="material-icons" :class="{ 'text-blue-500': agent.selected }">
              {{ agent.selected ? 'radio_button_checked' : 'radio_button_unchecked' }}
            </span>
          </button>
        </template>

        <template #content>
          <Instantly :watch="agent.sensor.watch">
            <Indicator class="mt-4" />
            <MTable class="mt-4" />
          </Instantly>
        </template>
      </Panel>
    </template>
  </div>

  <Toolbar :buttons="buttons" />
</template>.