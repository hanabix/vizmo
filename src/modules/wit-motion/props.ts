import type { Compound, Instruction, Readable, Simple, Writable } from "../port"
import { cons, fix, ignore, map, rep, short, uint8, type Read } from "../read"
import segment from "./segment"

export type Setting = 'rate' //| 'mode'
export type Settings = Record<Setting, Writable<any>>

export type Feature = 'battery' | 'firmware' | Setting
export type Features = Record<Feature, Readable<any>>

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


export default {
  battery: simple<number>(
    byte(0x64),
    map(cons(short(true), ignore(14)), ([v, _]) => percent(v))
  ),
  firmware: {
    batch: [simple(byte(0x2E), bytes(2)), simple(byte(0x2F), bytes(2))],
    cons: (view: DataView) => {
      if ((view.getUint8(1)) == 0x01) { // first bit is 1
        const v = view.getUint32(0, true)
        //             2  ~ 18          19  ~ 24         25  ~ 32
        return `${v << 2 >> 16}.${v << 18 >> 26}.${v << 24 >> 24}`
      }
      return view.getUint16(0, true).toString()
    }
  } as Compound<string>,
  rate: {
    ...simple<Rate>(byte(0x03), map(cons(uint8(), ignore(15)), ([v, _]) => v)),
    ...writable<Rate>(byte(0x03), (v: Rate) => v as Byte)
  } as Simple<Rate> & Writable<Rate>
}

function simple<T>(addr: Byte, read: Read<T>): Simple<T> {
  return {
    read: map(cons(fix(0x55, 0x71, addr, 0x00), read), ([_, v]) => v),
    get: Uint8Array.of(0xFF, 0xAA, 0x27, addr, 0x00) as Instruction,
    ...segment
  }
}

function writable<T>(addr: Byte, convert: (value: T) => Byte): Writable<T> {
  return {
    set: (v: T) => Uint8Array.of(0xFF, 0xAA, addr, convert(v), 0x00) as Instruction
  }
}

export function hz(rate: Rate) {
  if (rate === Rate.Hz_01) return 0.1
  if (rate === Rate.Hz_05) return 0.5
  if (rate === Rate.Hz_2) return 2
  if (rate === Rate.Hz_1) return 1
  if (rate === Rate.Hz_5) return 5
  if (rate === Rate.Hz_10) return 10
  if (rate === Rate.Hz_20) return 20
  if (rate === Rate.Hz_50) return 50
  if (rate === Rate.Hz_100) return 50
  if (rate === Rate.Hz_200) return 50
  throw new Error(`unknown rate: ${rate}`)
}



function percent(v: number): any {
  const mapping = [
    [396, 100],
    [393, 90],
    [387, 75],
    [382, 60],
    [379, 50],
    [377, 40],
    [373, 30],
    [370, 20],
    [368, 15],
    [350, 10],
    [340, 5]
  ]
  for (const [min, p] of mapping) {
    if (v > min) return p
  }
  return 0
}

function bytes(n: number): Read<Uint8Array> {
  return map(rep(uint8(), n), (arr) => Uint8Array.from(arr))
}