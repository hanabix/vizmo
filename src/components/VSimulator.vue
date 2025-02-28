<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import type { Meters } from '../modules/wit-motion'

interface Cavas {
  refresh: (meters: Meters) => void,
  resize: () => void,
  dispose: () => void
}

interface Cancel {
  (): void
}

interface Observeable  {
  observe: (callback: (meters: Meters) => void) => Cancel
}

const source = defineProps<Observeable>()
const containerRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (!containerRef.value) throw new Error('containerRef is null')

  const { refresh, resize, dispose } = init(containerRef.value)
  const cancel = source.observe(refresh)
  window.addEventListener('resize', () => resize())
  onBeforeUnmount(() => {
    cancel()
    dispose()
  })
})

function init(root: HTMLDivElement): Cavas {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf9fafb)

  const mesh = box()
  scene.add(mesh)
  
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
    refresh: (data: Meters) => {
      mesh.rotation.set(0, 0, 0)
      const [x, y, z] = data[2].map(angle => angle * Math.PI / 180)
      mesh.rotation.set(y, z, x, 'YXZ')
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

      mesh.geometry.dispose()
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose()
      } else if (Array.isArray(mesh.material)) {
        mesh.material.forEach(material => material.dispose())
      }

      renderer.dispose()
    }
  }
}

function box() {
  const geometry = new THREE.BoxGeometry(1.5, 0.5, 1); 

  function basic(color: number) {
    return new THREE.MeshBasicMaterial({ color });
  }

  const top = basic(0x008fcb);
  const back = basic(0xdedede);
  const side = basic(0x252728);

  const materials = [side, back, top, side, side, side];

  return new THREE.Mesh(geometry, materials);
}

</script>

<template>
  <div ref="containerRef" class="min-h-[300px] rounded-lg overflow-hidden"></div>
</template>
