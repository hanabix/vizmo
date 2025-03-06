<script setup lang="ts">
import { computed } from 'vue'
import { WT9011DCL } from "../modules/wit-motion"
import { agents, request, disconnect } from '../modules/agent'
import Panel from '../components/Panel.vue'
import Status from '../components/Status.vue'
import Instantly from '../components/Instantly.vue'
import Indicator from '../components/Indicator.vue'
import MTable from '../components/MetersTable.vue'
import AccelChart from '../components/Vector3Line.vue'
import Toolbar from '../components/Toolbar.vue'
import type { To } from '.'

const { to } = defineProps<{
  to: To<'Multiselect' | 'Playback'>
}>()

const add = { icon: 'add_circle_outline', label: '添加', click: () => { request(WT9011DCL) } }
const upload = { icon: 'upload', label: '上传', click: () => { throw new Error("TODO") } }
const select = { icon: 'library_add_check', label: '选择', click: () => { to('Multiselect') } }
const buttons = computed(() => agents.value.filter((a) => a.sensor).length == 0 ? [add, upload] : [add, upload, select])
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

        <template v-if="agent.sensor" #actions>
          <button @click="disconnect(agent)"
            class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 flex items-center" title="删除">
            <span class="material-icons">link_off</span>
          </button>
        </template>

        <template #content>
          <Instantly v-if="agent.sensor" :watch="agent.sensor.watch">
            <Indicator class="mt-4" />
            <MTable class="mt-4" />
            <AccelChart class="mt-4" />
          </Instantly>

          <div v-else class="text-blue-500 mt-4 p-1 rounded-lg hover:bg-gray-50 flex items-center justify-center">
            <span class="material-icons animate-ping">link</span>
          </div>
        </template>
      </Panel>
    </template>
  </div>


  <Toolbar :buttons="buttons" />
</template>
