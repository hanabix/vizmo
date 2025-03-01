<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import type { Meters } from '../modules/wit-motion'

interface Callback<T> {
  (value: T): void
}

interface Cavas {
  refresh: Callback<Meters>,
  resize: () => void,
  dispose: () => void
}

interface Box {
  rotate: (x: number, y: number, z: number) => void,
  force: (x: number, y: number, z: number) => void,
  dispose: () => void
}

interface Cancel {
  (): void
}

interface Observeable {
  observe: (cb: Callback<Meters>) => Cancel
}

const source = defineProps<Observeable>()
const containerRef = ref<HTMLDivElement | null>(null)
const meters = ref<Meters>([[0, 0, 0], [0, 0, 0], [0, 0, 0]])

onMounted(() => {
  if (!containerRef.value) throw new Error('containerRef is null')

  const { refresh, resize, dispose } = init(containerRef.value)
  const cancel = source.observe((data) => {
    meters.value = data
    refresh(data)
  })
  window.addEventListener('resize', () => resize())
  onBeforeUnmount(() => {
    cancel()
    dispose()
  })
})

function init(root: HTMLDivElement): Cavas {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf9fafb)

  const { rotate, force, dispose } = box(scene, 1.5, 0.5, 1)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const width = root.clientWidth
  const height = root.clientHeight
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.z = 5

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  root.appendChild(renderer.domElement)

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera)
  })

  return {
    refresh: ([accel, _, euler]: Meters) => {
      rotate(...euler)
      force(...accel)
    },
    resize: () => {
      const width = root.clientWidth
      const height = root.clientHeight

      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    },
    dispose: () => {
      root.removeChild(renderer.domElement)
      dispose()
      renderer.dispose()
    }
  }
}

function box(scene: THREE.Scene, width: number, height: number, depth: number): Box {
  const basic = (color: number) => new THREE.MeshBasicMaterial({ color })
  const top = basic(0x008fcb)
  const back = basic(0xdedede)
  const side = basic(0x252728)

  const materials = [side, back, top, side, side, side]
  const geometry = new THREE.BoxGeometry(width, height, depth)
  const mesh = new THREE.Mesh(geometry, materials)

  const faE = forceArrow(mesh, new THREE.Vector3(0, 0, 1), 0xff0000, depth)
  const faN = forceArrow(mesh, new THREE.Vector3(1, 0, 0), 0x00ff00, width)
  const faS = forceArrow(mesh, new THREE.Vector3(0, 1, 0), 0x0000ff, height)

  scene.add(mesh)
  return {
    rotate: (x: number, y: number, z: number) => {
      const radian = (v: number) => v * Math.PI / 180
      mesh.rotation.set(0, 0, 0)
      mesh.rotation.set(radian(y), radian(z), radian(x), 'YXZ')
    },
    force: (x: number, y: number, z: number) => {
      faE(x)
      faN(y)
      faS(z)
    },
    dispose: () => {
      geometry.dispose()
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      }
    }
  }

  function forceArrow(
    mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial[], THREE.Object3DEventMap>,
    dir: THREE.Vector3,
    color: THREE.ColorRepresentation,
    bias: number
  ): Callback<number> {
    const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), 1, color)
    scene.add(arrow)
    return (value) => {
      const length = (bias / 2) + Math.abs(value)
      arrow.setLength(length, length * 0.2, length * 0.1)

      const init = dir.clone()
      const sign = Math.sign(value)
      const ref = mesh.getWorldQuaternion(new THREE.Quaternion())
      arrow.setDirection(init.multiplyScalar(sign).applyQuaternion(ref))
    }
  }
}

function fixed(value: number): string {
  return value.toFixed(2)
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div ref="containerRef" class="min-h-[300px] rounded-lg overflow-hidden"></div>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full text-xs table-fixed font-mono">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-2 py-1 font-medium text-gray-500"></th>
            <th class="px-2 py-1 text-right font-medium text-red-500">X(东)</th>
            <th class="px-2 py-1 text-right font-medium text-green-500">Y(北)</th>
            <th class="px-2 py-1 text-right font-medium text-blue-500">Z(天)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr>
            <td class="px-2 py-1 text-gray-700">加速计<small>[ g ]</small></td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[0][0]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[0][1]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[0][2]) }}</td>
          </tr>
          <tr>
            <td class="px-2 py-1 text-gray-700">陀螺仪<small>[°/s]</small></td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[1][0]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[1][1]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[1][2]) }}</td>
          </tr>
          <tr>
            <td class="px-2 py-1 text-gray-700">旋转角<small>[ ° ]</small></td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[2][0]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[2][1]) }}</td>
            <td class="px-2 py-1 text-right text-gray-700">{{ fixed(meters[2][2]) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
