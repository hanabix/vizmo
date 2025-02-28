import type { SegmentFilter } from "../port"
import { cons, fix, map, rep, short, type Read } from "../read"
import segment from "./segment"

export type Triple = [number, number, number]
export type Meters = [Triple, Triple, Triple]

export default {
  ...filter(map(
    rep(map(rep(short(true), 3), (v) => v as Triple), 3),
    ([a, b, c]) => [acc(a), gyr(b), rot(c)] as Meters
  ))
}

function filter<T>(read: Read<T>): SegmentFilter<T> {
  return {
    read: map(cons(fix(0x55, 0x61), read), ([_, v]) => v),
    ...segment
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
