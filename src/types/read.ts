export type Read<T> = (data: DataView, offset: number) => [T | undefined, number]

export function ignore(n: number): Read<null> {
  return (data, offset) => {
    if (data.byteLength < offset + n) {
      return [undefined, offset]
    }
    return [null, offset + n]
  }
}

export function map<A, B>(ra: Read<A>, f: (v: A) => B): Read<B> {
  return (data, offset) => {
    const [v, n] = ra(data, offset)
    if (v === undefined) {
      return [undefined, offset]
    }
    return [f(v), n]
  }
}

export function cons<A, B>(ra: Read<A>, rb: Read<B>): Read<[A, B]> {
  return (data, offset) => {
    const res = []
    let o = offset
    for (const r of [ra, rb]) {
      const [v, n] = r(data, o)
      if (v === undefined) {
        return [undefined, offset]
      }
      res.push(v)
      o = n
    }
    return [res as [A, B], o]
  }
}

export function rep<A>(ra: Read<A>, n: number): Read<A[]> {
  return (data, offset) => {
    const arr: A[] = []
    let o = offset
    for (let i = 0; i < n; i++) {
      const [v, n] = ra(data, o)
      if (v === undefined) {
        return [undefined, offset]
      }
      arr.push(v)
      o = n
    }
    return [arr, o]
  }
}

export function uint16(littleEndian?: boolean): Read<number> {
  return (data, offset) => {
    if (data.byteLength < offset + 2) {
      return [undefined, offset]
    }
    return [data.getUint16(offset, littleEndian), offset + 2]
  }
}

export function uint8(): Read<number> {
  return (data, offset) => {
    if (data.byteLength < offset + 1) {
      return [undefined, offset]
    }
    return [data.getUint8(offset), offset + 1]
  }
}

export function fix(...bytes: number[]): Read<null> {
  return (data, offset) => {
    if (data.byteLength < offset + bytes.length) {
      return [undefined, offset]
    }
    for (let i = 0; i < bytes.length; i++) {
      if (data.getUint8(offset + i) != bytes[i]) {
        return [undefined, offset]
      }
    }
    return [null, offset + bytes.length]
  }
}