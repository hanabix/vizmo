import { type Read } from '../read'

export type Instruction = Uint8Array & { __instruction: never }

export interface Filter<T> {
  read: Read<T>
  limit: number
}

export interface Simple<T> extends Filter<T> {
  get: Instruction
}

export interface Compound<T> {
  batch: Simple<Uint8Array<ArrayBuffer>>[]
  cons: (view: DataView) => T
}

export type Readable<T> = Simple<T> | Compound<T>

export interface Writable<T> {
  set: (value: T) => Instruction
}

export type Cancel = () => void

export interface SerialPort {
  ask<T>(r: Readable<T>): Promise<T>
  send<T>(w: Writable<T>, value: T): Promise<void>
  watch<T>(f: Filter<T>, onChanged: (value: T) => void): Cancel
}

export interface UUIDs {
  service: string
  notify: string
  write: string
}

export default async function (server: BluetoothRemoteGATTServer, uuids: UUIDs): Promise<SerialPort> {
  if (!server.connected) await server.connect()
  const service = await server.getPrimaryService(uuids.service)
  const rec = await service.getCharacteristic(uuids.notify)
  const snd = await service.getCharacteristic(uuids.write)

  rec.addEventListener('characteristicvaluechanged', debug)

  await rec.startNotifications()
  return {
    send: (w, v): Promise<void> => snd.writeValue(w.set(v)),

    ask: async <T>(r: Readable<T>) => {
      async function ask0<T>(s: Simple<T>): Promise<T> {
        const { promise, resolve, reject } = Promise.withResolvers<T>()
        const listener = asListener(s, v => {
          rec.removeEventListener('characteristicvaluechanged', listener)
          resolve(v)
        })
        rec.addEventListener('characteristicvaluechanged', listener)
        await snd.writeValue(s.get)
        setTimeout(() => reject(Error("timeout")), 1000)
        return promise
      }

      if ('batch' in r) {
        const { batch, cons } = r as Compound<T>
        let bytes = Uint8Array.of()
        for (const r of batch) {
          bytes = concat(bytes, await ask0(r))
        }

        return cons(new DataView(bytes.buffer))
      }

      return ask0(r as Simple<T>)
    },

    watch: (f, onChanged) => {
      const listener = asListener(f, onChanged)
      rec.addEventListener('characteristicvaluechanged', listener)
      return () => rec.removeEventListener('characteristicvaluechanged', listener)
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

function concat(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}