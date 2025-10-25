import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Trail, Float, Line, Sphere, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function App() {
  return (
    <Canvas camera={{ position: [0, 1.5, 8], fov: 45 }}>
      <color attach="background" args={['#050017']} />
      <ambientLight intensity={0.5} />
      {/* Float makes entire atom move gently in space */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5}>
        <Atom />
      </Float>
      <Stars saturation={0} count={400} speed={0.5} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.1} radius={0.7} intensity={1.5} />
      </EffectComposer>
    </Canvas>
  )
}

function Atom(props) {
  const points = useMemo(
    () => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(150),
    []
  )
  const vertices = points.map((p) => new THREE.Vector3(p.x, p.y, 0))

  return (
    <group {...props}>
      {/* Base orbit ellipses */}
      <Line points={vertices} color={[4, 1, 10]} lineWidth={1} toneMapped={false} />
      <Line
        points={vertices}
        color={[4, 1, 10]}
        lineWidth={1}
        toneMapped={false}
        rotation={[0, 0, Math.PI / 3]}
      />
      <Line
        points={vertices}
        color={[4, 1, 10]}
        lineWidth={1}
        toneMapped={false}
        rotation={[0, 0, -Math.PI / 3]}
      />

      {/* Electrons (each has orbit rotation & trail) */}
      <Electron rotation={[0, 0, 0]} speed={6} />
      <Electron rotation={[0, 0, Math.PI / 3]} speed={6.5} />
      <Electron rotation={[0, 0, -Math.PI / 3]} speed={7} />

      {/* Glowing nucleus */}
      <Sphere args={[0.35, 64, 64]}>
        <meshBasicMaterial color={[6, 0.5, 2]} toneMapped={false} />
      </Sphere>
    </group>
  )
}

/* 🪐 Electron with globally-moving trail */
function Electron({ radius = 2.75, speed = 6, rotation = [0, 0, 0] }) {
  const electronRef = useRef()
  const orbitRef = useRef()

  // Animate electron position around ellipse
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    const x = Math.sin(t) * radius
    const y = Math.cos(t) * radius * 0.38
    electronRef.current.position.set(x, y, 0)
  })

  // Slowly rotate each orbit plane itself for realism
  useFrame((state) => {
    orbitRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5
  })

  return (
    <group ref={orbitRef} rotation={rotation}>
      {/* Trail must use world coordinates → local={false} */}
      <Trail
        local={false}
        width={6}
        length={80}
        decay={0.5}
        color={new THREE.Color(2, 1, 10)}
        attenuation={(t) => (1 - t) ** 2}
      >
        <mesh ref={electronRef}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  )
}
