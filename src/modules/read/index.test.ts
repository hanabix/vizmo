import { describe, expect, it } from 'vitest'
import { ignore, map, cons, rep, short, fix } from './'

describe('read', () => {
  const createDataView = (bytes: number[]) => new DataView(new Uint8Array(bytes).buffer)

  describe('ignore', () => {
    it('should ignore n bytes and return null', () => {
      const data = createDataView([1, 2, 3])
      const [result, offset] = ignore(2)(data, 0)
      expect(result).toBe(null)
      expect(offset).toBe(2)
    })

    it('should return undefined when not enough bytes', () => {
      const data = createDataView([1])
      const [result, offset] = ignore(2)(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })
  })

  describe('map', () => {
    it('should transform value using provided function', () => {
      const data = createDataView([1, 2])
      const reader = map(short(), x => x * 2)
      const [result, offset] = reader(data, 0)
      expect(result).toBe(516) // 1*256 + 2 = 258 * 2 = 516
      expect(offset).toBe(2)
    })

    it('should return undefined when inner reader fails', () => {
      const data = createDataView([1])
      const reader = map(short(), x => x * 2)
      const [result, offset] = reader(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })
  })

  describe('cons', () => {
    it('should combine two readers', () => {
      const data = createDataView([1, 2, 3, 4])
      const reader = cons(short(), short())
      const [result, offset] = reader(data, 0)
      expect(result).toEqual([258, 772]) // [1*256+2, 3*256+4]
      expect(offset).toBe(4)
    })

    it('should return undefined when first reader fails', () => {
      const data = createDataView([1])
      const reader = cons(short(), short())
      const [result, offset] = reader(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })

    it('should return undefined when second reader fails', () => {
      const data = createDataView([1, 2])
      const reader = cons(short(), short())
      const [result, offset] = reader(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })
  })

  describe('rep', () => {
    it('should read n values', () => {
      const data = createDataView([1, 2, 3, 4])
      const reader = rep(short(), 2)
      const [result, offset] = reader(data, 0)
      expect(result).toEqual([258, 772]) // [1*256+2, 3*256+4]
      expect(offset).toBe(4)
    })

    it('should return undefined when not enough bytes', () => {
      const data = createDataView([1, 2, 3])
      const reader = rep(short(), 2)
      const [result, offset] = reader(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })

    it('should return empty array when n is 0', () => {
      const data = createDataView([1, 2])
      const reader = rep(short(), 0)
      const [result, offset] = reader(data, 0)
      expect(result).toEqual([])
      expect(offset).toBe(0)
    })
  })

  describe('uint16', () => {
    it('should read big-endian uint16', () => {
      const data = createDataView([1, 2])
      const [result, offset] = short()(data, 0)
      expect(result).toBe(258) // 1*256+2
      expect(offset).toBe(2)
    })

    it('should read little-endian uint16', () => {
      const data = createDataView([1, 2])
      const [result, offset] = short(true)(data, 0)
      expect(result).toBe(513) // 2*256+1
      expect(offset).toBe(2)
    })

    it('should return undefined when not enough bytes', () => {
      const data = createDataView([1])
      const [result, offset] = short()(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })
  })

  describe('fix', () => {
    it('should match exact bytes', () => {
      const data = createDataView([1, 2, 3])
      const [result, offset] = fix(1, 2)(data, 0)
      expect(result).toBe(null)
      expect(offset).toBe(2)
    })

    it('should return undefined when bytes do not match', () => {
      const data = createDataView([2, 2, 3])
      const [result, offset] = fix(1, 2)(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })

    it('should return undefined when not enough bytes', () => {
      const data = createDataView([1])
      const [result, offset] = fix(1, 2)(data, 0)
      expect(result).toBe(undefined)
      expect(offset).toBe(0)
    })
  })
})