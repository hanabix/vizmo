import type { Cancel, Compound, Filter, Readable, Writable } from "../port"

export type Byte = number & { __uint8: never }
export function byte(v: number): Byte {
  if (v < 0 || v > 0xff) {
    throw Error(`Illegal byte value ${v}`)
  }
  return v as Byte
}

export enum Bandwidth {
  Hz_256 = byte(0x00),
  Hz_188 = byte(0x01),
  Hz_98 = byte(0x02),
  Hz_42 = byte(0x03),
  Hz_20 = byte(0x04),
  Hz_10 = byte(0x05),
  Hz_5 = byte(0x06),
}

export enum Orientation {
  HORIZONTAL = byte(0x00),
  VERTICAL = byte(0x01),
}

export enum MetersOutput {
  INERTIA = byte(0x00),
  POSITION = byte(0x01),
}

export enum Rate {
  Hz_01 = byte(0x01),
  Hz_05 = byte(0x02),
  Hz_1 = byte(0x03),
  Hz_2 = byte(0x04),
  Hz_5 = byte(0x05),
  Hz_10 = byte(0x06),
  Hz_20 = byte(0x07),
  Hz_50 = byte(0x08),
  Hz_100 = byte(0x09),
  Hz_200 = byte(0x0B),
}

// export enum Settings {
//   SAVE = byte(0x00),
//   RESET = byte(0x01),
// }

// export enum Address {
//   RATE = byte(0x03),
//   BANDWIDTH = byte(0x1F),
//   ORIENT = byte(0x23),
//   VERSION1 = byte(0x2E),
//   VERSION2 = byte(0x2F),
//   MAGNET = byte(0x3A),
//   QUATERNION = byte(0x51),
//   BATTERY = byte(0x64)
// }

export type Triple = [number, number, number]
export type Meters = [Triple, Triple, Triple]

export type Setting = 'rate' //| 'mode'
export type Settings = Record<Setting, Writable<any>>

export type Feature = 'battery' | 'firmware' | Setting
export type Features = Record<Feature, Readable<any>>

export type Val<T extends Features & Settings, K extends keyof T> =
  T[K] extends Filter<any> ? Exclude<ReturnType<T[K]['read']>[0], undefined> :
  T[K] extends Compound<any> ? ReturnType<T[K]['cons']> :
  never

export interface Agent<T extends Features & Settings> {
  watch: (rec: (ms: Meters) => void) => Cancel
  get: <F extends Feature>(feat: F) => Promise<Val<T, F>>
  set: <S extends Setting>(feat: S, v: Val<T, S>) => Promise<Val<T, S>>
}
