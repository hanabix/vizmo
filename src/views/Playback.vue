<script setup lang="ts">
import { ref, provide } from 'vue'
import type { To } from '.'
import { gathered } from '../modules/gather'
import Panel from '../components/Panel.vue'
import Replay from '../components/Replay.vue'
import Indicator from '../components/Indicator.vue'
import MTable from '../components/MetersTable.vue'
import Toolbar from '../components/Toolbar.vue'

const { to } = defineProps<{
  to: To<'Home'>
}>()

const cursor = ref(0)
const back = { icon: 'arrow_back', label: '返回', click: () => to('Home') }
const buttons = [back]
const data = gathered()

provide('cursor', cursor)
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <template v-for="source in data.sources" :key="source.name">
      <Panel :title="source.name">

        <template #content>
          <Replay :sequence="source.sequence">
            <Indicator class="mt-4" />
            <MTable class="mt-4" />
          </Replay>

        </template>
      </Panel>
    </template>
  </div>

  <Toolbar :buttons="buttons" />
</template>.