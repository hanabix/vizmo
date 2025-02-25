import { cons, map, fix, ignore, short, rep, uint8, type Read } from './read'
import { type Cancel, type Instruction, type Readable, type Simple, type Compound, type Writable, type Filter, type UUIDs, SerialPort } from './port'

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

type Setting = 'rate' //| 'mode'
export type Settings = Record<Setting, Writable<any>>

type Feature = 'battery' | 'firmware' | Setting
export type Features = Record<Feature, Readable<any>>


type Val<T, K extends keyof T> =
  T[K] extends Filter<any> ? Exclude<ReturnType<T[K]['read']>[0], undefined> :
  T[K] extends Compound<any> ? ReturnType<T[K]['cons']> :
  never

export interface Agent<T extends Features & Settings> {
  watch: (rec: (ms: Meters) => void) => Cancel
  get: <F extends Feature>(feat: F) => Promise<Val<T, F>>
  set: <S extends Setting>(feat: S, v: Val<T, S>) => Promise<Val<T, S>>
}

export async function agentOf(server: BluetoothRemoteGATTServer): Promise<Agent<typeof props>> {
  const port = await SerialPort.of(server, WT9011DCL)
  return {
    watch: (rec) => port.watch(meters, rec),
    get: (f) => port.ask(props[f] as Readable<Val<typeof props, typeof f>>),
    set: (s, v) => port.send(props[s], v).then(() => port.ask(props[s])) as Promise<Val<typeof props, typeof s>>
  }
}

const SEGMENT = { limit: 20 }

const props = {
  battery: simple<number>(
    byte(0x64),
    map(cons(short(true), ignore(14)), ([v, _]) => percent(v))
  ),
  firmware: {
    batch: [simple(byte(0x2E), rep(uint8(), 2)), simple(byte(0x2F), rep(uint8(), 2))],
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

const meters: Filter<Meters> = filter(map(
  rep(map(rep(short(true), 3), (v) => v as Triple), 3),
  ([a, b, c]) => [acc(a), gyr(b), rot(c)] as Meters
))

// const settings: Writable<Settings> = writable(
//   byte(0x00),
//   (v: Settings) => byte(v)
// )


function simple<T>(addr: Byte, read: Read<T>): Simple<T> {
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

function filter<T>(read: Read<T>): Filter<T> {
  return {
    read: map(cons(fix(0x55, 0x61), read), ([_, v]) => v),
    ...SEGMENT
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

type Byte = number & { __uint8: never }
function byte(v: number): Byte {
  if (v < 0 || v > 0xff) {
    throw Error(`Illegal byte value ${v}`)
  }
  return v as Byte
}
