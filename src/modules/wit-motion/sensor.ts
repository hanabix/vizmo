import type { Cancel, Compound, SegmentFilter, Readable } from "../port"
import portOf from "../port"
import { WT9011DCL } from "./uuids"
import props, { type Feature, type Features, type Setting, type Settings } from "./props"
import meters, { type Meters } from "./meters"

export type Val<T extends Features & Settings, K extends keyof T> =
  T[K] extends SegmentFilter<any> ? Exclude<ReturnType<T[K]['read']>[0], undefined> :
  T[K] extends Compound<any> ? ReturnType<T[K]['cons']> :
  never

export interface Sensor<T extends Features & Settings> {
  watch: (rec: (ms: Meters) => void) => Cancel
  get: <F extends Feature>(feature: F) => Promise<Val<T, F>>
  set: <S extends Setting>(setting: S, value: Val<T, S>) => Promise<Val<T, S>>
}

export async function sensorFrom(server: BluetoothRemoteGATTServer): Promise<Sensor<typeof props>> {
  const port = await portOf(server, WT9011DCL)
  return {
    watch: (rec) => port.watch(meters, rec),
    get: (f) => port.ask(props[f] as Readable<Val<typeof props, typeof f>>),
    set: (s, v) => port.send(props[s], v).then(() => port.ask(props[s]) as Promise<Val<typeof props, typeof s>>)
  }
}
