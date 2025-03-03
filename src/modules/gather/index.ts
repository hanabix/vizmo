import { ref } from "vue";
import { type Meters } from "../wit-motion";
import type { Agent } from "../agent";
import type { Cancel } from "../port";

const log = ref<Log>({
  timestamp: new Date(),
  sources: []
})

export function gathered(): Readonly<Log> { return log.value }

export function gather(rate: number, agents: Readonly<Agent[]>): Cancel {
  console.log("gather", rate, agents)

  log.value = {
    timestamp: new Date(),
    sources: []
  }

  return agents.map((a) => {
    const s: Source = { name: a.name, rate: rate, sequence: [] };
    const c = a.sensor!.watch(m => s.sequence.push(m));
    return [c, s] as [Cancel, Source];
  }).reduce((cc, [c, s]) => {
    log.value.sources.push(s);
    return () => { c(); cc(); };
  }, () => { })
}

export type Source = {
  name: string
  rate: number
  sequence: Meters[]
}

export type Log = {
  timestamp: Date
  sources: Source[]
}
