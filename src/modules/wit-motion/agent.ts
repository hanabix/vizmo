import type { Readable } from "../port"
import portOf from "../port"
import { WT9011DCL } from "./constants"
import type { Agent, Val } from "./types"
import props from "./props"
import meters from "./meters"

export async function agentOf(server: BluetoothRemoteGATTServer): Promise<Agent<typeof props>> {
  const port = await portOf(server, WT9011DCL)
  return {
    watch: (rec) => port.watch(meters, rec),
    get: (f) => port.ask(props[f] as Readable<Val<typeof props, typeof f>>),
    set: (s, v) => port.send(props[s], v).then(() => port.ask(props[s]) as Promise<Val<typeof props, typeof s>>)
  }
}
