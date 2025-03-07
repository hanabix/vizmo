import type { Cancel } from "../types"
import type { Compound, SegmentFilter, Readable, UUIDs } from "../port"
import portOf from "../port"
import props, { type Feature, type Features, type Setting, type Settings } from "./props"
import meters, { type Meters } from "./meters"

export type Val<T extends Features & Settings, K extends keyof T> =
  T[K] extends SegmentFilter<any> ? Exclude<ReturnType<T[K]['read']>[0], undefined> :
  T[K] extends Compound<any> ? ReturnType<T[K]['cons']> :
  never

export interface Sensor<T extends Features & Settings = typeof props> {
  watch: (rec: (ms: Meters) => void) => Cancel
  get: <F extends Feature>(feature: F) => Promise<Val<T, F>>
  set: <S extends Setting>(setting: S, value: Val<T, S>) => Promise<Val<T, S>>
}

export type ReadonlySensor = Pick<Sensor, 'get' | 'watch'>

export async function sensorFrom(server: BluetoothRemoteGATTServer, u: UUIDs): Promise<Sensor> {
  const port = await portOf(server, u)
  return {
    watch: (rec) => port.watch(meters, rec),
    get: (f) => port.ask(props[f] as Readable<Val<typeof props, typeof f>>),
    set: async (s, v) => {
      const pre = await port.ask(props[s])
      return port.send(props[s], v).then(() => pre as Val<typeof props, typeof s>) 
    }
  }
}
