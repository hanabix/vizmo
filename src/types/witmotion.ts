import type { Read } from './read'
import { cons, map, fix, ignore, uint16 } from './read'
import type { Uint8, Instruction, Readable, Writable, UUIDs } from './port'

export const WT9011DCL: UUIDs = {
  service: '0000ffe5-0000-1000-8000-00805f9a34fb',
  notify: '0000ffe4-0000-1000-8000-00805f9a34fb',
  write: '0000ffe9-0000-1000-8000-00805f9a34fb',
}

export enum Bandwidth {
  Hz_256 = 0x00,
  Hz_188 = 0x01,
  Hz_98 = 0x02,
  Hz_42 = 0x03,
  Hz_20 = 0x04,
  Hz_10 = 0x05,
  Hz_5 = 0x06,
}

export enum Orientation {
  HORIZONTAL = 0x00,
  VERTICAL = 0x01,
}

export enum OutputFormat {
  INERTIA = 0x00,
  POSITION = 0x01,
}

export enum Rate {
  Hz_01 = 0x01,
  Hz_05 = 0x02,
  Hz_1 = 0x03,
  Hz_2 = 0x04,
  Hz_5 = 0x05,
  Hz_10 = 0x06,
  Hz_20 = 0x07,
  Hz_50 = 0x08,
  Hz_100 = 0x09,
  Hz_200 = 0x0B,
}

export enum Settings {
  SAVE = 0x00,
  RESET = 0x01,
}

export enum Address {
  RATE = 0x03,
  BANDWIDTH = 0x1F,
  ORIENT = 0x23,
  VERSION1 = 0x2E,
  VERSION2 = 0x2F,
  MAGNET = 0x3A,
  QUATERNION = 0x51,
  BATTERY = 0x64
}

export type Triple = [number, number, number]
export type Meters = [Triple, Triple, Triple]

export const battery: Readable<number> = readable(
  0x64 as Uint8,
  map(cons(uint16(true), ignore(14)), ([v, _]) => v)
)
export const major: Readable<number> = readable(
  0x2E as Uint8,
  map(uint16(true), v => v)
)
export const settings: Writable<Settings> = writable(
  0x00 as Uint8,
  (v: Settings) => v as Uint8
)

function readable<T>(addr: Uint8, read: Read<T>): Readable<T> {
  return {
    read: map(cons(fix(0x55, 0x71, addr, 0x00), read), ([_, v]) => v),
    limit: 20, // bytes per segment
    get: Uint8Array.of(0xFF, 0xAA, 0x27, addr, 0x00) as Instruction
  }
}

function writable<T>(addr: Uint8, convert: (value: T) => Uint8): Writable<T> {
  return {
    set: (v: T) => Uint8Array.of(0xFF, 0xAA, addr, convert(v), 0x00) as Instruction
  }
}