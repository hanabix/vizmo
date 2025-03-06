import type { Disposable, Canvas } from "../types"

export interface Cache<T extends Canvas<any>> extends Disposable {
  attach(root: HTMLElement): Promise<T>
}

export default function cache<T extends Canvas<any>>(factory: () => Promise<T>): Cache<T> {
  const instances: T[] = []
  const attached = new Set<T>()
  let disposed = false

  return {
    async attach(root: HTMLElement): Promise<T> {
      if (disposed) throw new Error("Cache already disposed")

      const instance =  instances.length > 0 ? instances.pop()! : await factory()
      const resize = () => { instance.resize(root.clientWidth, root.clientHeight) }

      if (instance.dom.parentElement) {
        throw new Error(`${instance} already attached to ${instance.dom.parentElement}`)
      }

      attached.add(instance)
      root.appendChild(instance.dom)
      resize()
      window.addEventListener('resize', resize)

      return rewrite(instance)

      function rewrite(instance: T) {
        const original = instance.dispose
        instance.dispose = () => {
          window.removeEventListener('resize', resize)

          instance.dom.parentElement?.removeChild(instance.dom)

          attached.delete(instance)
          instances.push(instance)

          instance.dispose = original
        }
        return instance
      }
    },

    dispose() {
      if (disposed) return
      disposed = true
      if (attached.size > 0) throw new Error(`${attached.size} instances attached but not detached}`)
      instances.forEach(i => { i.dispose() })
    }
  }
}

