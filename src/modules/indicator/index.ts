
import { AmbientLight, Color, DirectionalLight, Euler, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three'
import box from './box'

interface Cavas {
  refresh: (acc: Vector3, euler: Euler) => void,
  resize: () => void,
  dispose: () => void
}

export default function attach(root: HTMLDivElement): Cavas {
  const scene = new Scene()
  scene.background = new Color(0xf9fafb)

  const { rotate, force, dispose } = box(1.5, 0.5, 1).attach(scene)

  const ambientLight = new AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const directionalLight = new DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(1, 1, 1)
  scene.add(directionalLight)

  const width = root.clientWidth
  const height = root.clientHeight
  const camera = new PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.z = 5

  const renderer = new WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  root.appendChild(renderer.domElement)

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera)
  })

  return {
    refresh: (acc, euler) => {
      rotate(euler)
      force(acc)
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
