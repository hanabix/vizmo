
import { AmbientLight, Color, DirectionalLight, Euler, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import type { Canvas } from '../types'
import box from './box'

export interface Indicator extends Canvas<[Vector3, Euler]> {
  react: (data: [Vector3, Euler]) => void,
  resize: (width: number, height: number) => void,
  dispose: () => void
  dom: HTMLElement
}

export default function attach(width: number, height: number): Indicator {
  const scene = new Scene()
  scene.background = new Color(0xf9fafb)

  const { rotate, force, dispose } = box(1.5, 0.5, 1).attach(scene)

  const ambientLight = new AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const camera = new PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.z = 5

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera)
  })

  return {
    dom: renderer.domElement,
    react: ([acc, euler]) => {
      rotate(euler)
      force(acc)
    },
    resize: (width, height) => {
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    },
    dispose: () => {
      dispose()
      renderer.dispose()
    }
  }
}
