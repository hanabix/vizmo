import type { InjectionKey, ShallowRef } from 'vue'
import type { Meters } from '../modules/wit-motion'
import type { Indicator } from '../modules/indicator'
import type { Cache } from '../modules/cache'

export default {
  meters: Symbol('meters') as InjectionKey<ShallowRef<Meters>>,
  indicators: Symbol('indicators') as InjectionKey<Cache<Indicator>>
}