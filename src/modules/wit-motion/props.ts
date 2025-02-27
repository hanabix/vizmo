import type { Compound, Instruction, Simple, Writable } from "../port"
import { cons, fix, ignore, map, rep, short, uint8, type Read } from "../read"
import { SEGMENT } from "./constants"
import { byte, type Byte, type Rate } from "./types"

export default {
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


