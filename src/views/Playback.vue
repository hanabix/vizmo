<script setup lang="ts">
import { shallowRef, provide } from 'vue'
import type { To } from '.'
import Key from '../components/key'

import { gathered } from '../modules/gather'
import Panel from '../components/Panel.vue'
import Replay from '../components/Replay.vue'
import Indicator from '../components/Indicator.vue'
import MTable from '../components/MetersTable.vue'
import Toolbar from '../components/Toolbar.vue'
import Vector3Index from '../components/Vector3Index.vue'

const { to } = defineProps<{
  to: To<'Home'>
}>()

const spike = shallowRef(0)
const back = { icon: 'arrow_back', label: '返回', click: () => to('Home') }
const buttons = [back]
const data = gathered()

provide(Key.spike, spike)
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
          <Vector3Index class="mt-4" :data="source.sequence.map(m => m[0])"/>
        </template>
      </Panel>
    </template>
  </div>

  <Toolbar :buttons="buttons" />
</template>