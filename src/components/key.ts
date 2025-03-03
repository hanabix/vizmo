import type { InjectionKey, ShallowRef } from 'vue'
import type { Meters } from '../modules/wit-motion'

export default {
  meters: Symbol('meters') as InjectionKey<ShallowRef<Meters>>
}