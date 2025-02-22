import { cons, map, fix, ignore, uint16, rep, uint8, type Read } from './read'
import type { Byte, Instruction, Readable, Writable, Filter, UUIDs, SerialPort } from './port'
import { byte } from './port'

export const WT9011DCL: UUIDs = {
  service: '0000ffe5-0000-1000-8000-00805f9a34fb',
  notify: '0000ffe4-0000-1000-8000-00805f9a34fb',
  write: '0000ffe9-0000-1000-8000-00805f9a34fb',
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

export enum Settings {
  SAVE = byte(0x00),
  RESET = byte(0x01),
}

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

const SEGMENT = {
  limit: byte(20)
}

export const battery: Readable<number> = readable(
  byte(0x64),
  map(cons(uint16(true), ignore(14)), ([v, _]) => percent(v))
)

export const settings: Writable<Settings> = writable(
  byte(0x00),
  (v: Settings) => byte(v)
)

export const meters: Filter<Meters> = {
  read: map(
    cons(
      fix(0x55, 0x61),
      map(
        rep(map(rep(uint16(true), 3), (v) => v as Triple), 3),
        ([a, b, c]) => [acc(a), gyr(b), rot(c)] as Meters
      )
    ),
    ([_, r]) => r
  ),

  ...SEGMENT
}

export async function askFirmware(port: SerialPort) {
  const ver1: Readable<number[]> = readable(
    byte(0x2E),
    rep(uint8(), 2)
  )
  const ver2: Readable<number[]> = readable(
    byte(0x2F),
    rep(uint8(), 2)
  )
  const f = await port.ask(ver1)
  const s = await port.ask(ver2)
  const view = new DataView(Uint8Array.from(f.concat(s)).buffer)
  if ((view.getUint8(1)) == 0x01) { // first bit is 1
    const v = view.getUint32(0, true)
    const major = v << 2 >> 16  // 2  ~ 18 
    const minor = v << 18 >> 26 // 19 ~ 24 
    const patch = v << 24 >> 24 // 25 ~ 32 
    return `${major}.${minor}.${patch}`
  }
  return view.getUint16(0, true).toString()
}

function readable<T>(addr: Byte, read: Read<T>): Readable<T> {
  return {
    read: map(cons(fix(0x55, 0x71, addr, 0x00), read), ([_, v]) => v),
    get: Uint8Array.of(0xFF, 0xAA, 0x27, addr, 0x00) as Instruction,
    ...SEGMENT
  }
}

function writable<T>(addr: Byte, convert: (value: T) => Byte): Writable<T> {
  return {
    set: (v: T) => Uint8Array.of(0xFF, 0xAA, addr, convert(v), 0x00) as Instruction
  }
}

function acc(t: Triple): Triple {
  return t.map(v => v / 32768.0 * 16) as Triple
}

function gyr(t: Triple): Triple {
  return t.map(v => v / 32768.0 * 2000) as Triple
}

function rot(t: Triple): Triple {
  return t.map(v => v / 32768.0 * 180) as Triple
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

