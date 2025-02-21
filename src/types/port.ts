import { type Read, any } from './read'

export type Uint8 = number & { __uint8: never }
export type Instruction = Uint8Array & { __instruction: never }

export interface Filter<T> {
  read: Read<T>
  limit: number
}

export interface Readable<T> extends Filter<T> {
  get: Instruction
}

export interface Writable<T> {
  set: (value: T) => Instruction
}

type Cancel = () => void

export interface SerialPort {
  ask<T>(r: Readable<T>): Promise<T>
  set<T>(w: Writable<T>, value: T): Promise<void>
  watch<T>(f: Filter<T>, onChanged: (value: T) => void): Cancel
}

export interface UUIDs {
  service: string
  notify: string
  write: string
}

export namespace SerialPort {
  export async function of(server: BluetoothRemoteGATTServer, uuids: UUIDs): Promise<SerialPort> {
    const service = await server.getPrimaryService(uuids.service)
    const rec = await service.getCharacteristic(uuids.notify)
    const snd = await service.getCharacteristic(uuids.write)

    rec.addEventListener('characteristicvaluechanged', debug)
    await rec.startNotifications()
    return {
      set<T>(w: Writable<T>, v: T): Promise<void> {
        return snd.writeValue(w.set(v))
      },
      async ask<T>(r: Readable<T>): Promise<T> {
        const { promise, resolve, reject } = Promise.withResolvers<T>()
        const listener = asListener(r, v => {
          rec.removeEventListener('characteristicvaluechanged', listener)
          resolve(v)
        })
        rec.addEventListener('characteristicvaluechanged', listener)
        await snd.writeValue(r.get)
        setTimeout(() => reject(Error("timeout")), 1000)
        return promise
      },
      watch<T>(f: Filter<T>, onChanged: (value: T) => void): Cancel {
        const listener = asListener(f, onChanged)
        rec.addEventListener('characteristicvaluechanged', listener)
        return () => rec.removeEventListener('characteristicvaluechanged', listener)
      }
    }

  }
}

function getDataView(event: Event): DataView {
  const ch = event.target as BluetoothRemoteGATTCharacteristic
  return ch.value!
}

function asListener<T>(f: Filter<T>, handle: (v: T) => void): EventListener {
  const { read, limit } = f
  return (event) => {
    const buf = getDataView(event)
    for (let offset = 0; offset < buf.byteLength;) {
      const [v, n] = read(buf, offset)
      if (v !== undefined) {
        if (n > offset + limit) {
          throw Error(`Illegal read bytes ${n - offset}, more than limit ${limit}`)
        }
        handle(v)
      }
      offset += limit
    }
  }
}

const debug: EventListener = (event) => {
  const buf = new Uint8Array(getDataView(event).buffer)
  if (buf[1] == 0x61) { // negative data
    // ignore
    return
  }
  console.log(`Raw bytes (${buf.byteLength})`, hex(buf))
}

function hex(buf: Uint8Array<ArrayBufferLike>) {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join(' ')
}

