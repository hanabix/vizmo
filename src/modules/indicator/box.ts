import type { ColorRepresentation, Euler, Scene } from 'three'
import { ArrowHelper, BoxGeometry, Material, Mesh, MeshBasicMaterial, Vector3 } from 'three'

interface Indicator {
  rotate: (e: Euler) => void,
  force: (v: Vector3) => void,
  dispose: () => void
}

interface Attachment<A, B> {
  attach: (a: A) => B
}

type Action<T> = (v: T) => void

export default function box(width: number, height: number, depth: number): Attachment<Scene, Indicator> {
  const top = material(0x008fcb)
  const back = material(0xdedede)
  const side = material(0x252728)

  const materials = [side, back, top, side, side, side]
  const geometry = new BoxGeometry(width, height, depth)
  const mesh = new Mesh(geometry, materials)

  const faE = forceArrow(new Vector3(0, 0, 1), 0xff0000, depth).attach(mesh)
  const faN = forceArrow(new Vector3(1, 0, 0), 0x00ff00, width).attach(mesh)
  const faS = forceArrow(new Vector3(0, 1, 0), 0x0000ff, height).attach(mesh)

  const indicator: Indicator = {
    rotate: ({ x, y, z, order }) => {
      mesh.rotation.set(0, 0, 0)
      mesh.rotation.set(x, y, z, order)
    },
    force: ({ x, y, z }) => {
      faE(x)
      faN(y)
      faS(z)
    },
    dispose: () => {
      geometry.dispose()
      if (mesh.material instanceof Material) {
        mesh.material.dispose()
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      }
    }
  }

  return {
    attach: (scene) => {
      scene.add(mesh)
      return indicator
    }
  }
}

function forceArrow(dir: Vector3, color: ColorRepresentation, bias: number): Attachment<Mesh, Action<number>> {
  const arrow = new ArrowHelper(dir, new Vector3(0, 0, 0), 1, color)
  const action: Action<number> = (v) => {
    const length = (bias / 2) + Math.abs(v)
    arrow.setLength(length, length * 0.2, length * 0.1)
    arrow.setDirection((dir.clone()).multiplyScalar(Math.sign(v)))
  }
  return {
    attach: (mesh: Mesh) => {
      mesh.add(arrow)
      return action
    }
  }
}

function material(color: number) {
  return new MeshBasicMaterial({ color })
}
