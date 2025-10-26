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
        {/* 🧩 Scale entire atom smaller (0.6 = 60% size) */}
        <group scale={0.6}>
          <Atom />
        </group>
      </Float>
      <Stars saturation={0} count={400} speed={0.5} />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={0.1} radius={0.8} intensity={2} />
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
      {/* Base orbits */}
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

      {/* Electrons */}
      <Electron rotation={[0, 0, 0]} speed={6} />
      <Electron rotation={[0, 0, Math.PI / 3]} speed={6.5} />
      <Electron rotation={[0, 0, -Math.PI / 3]} speed={7} />

      {/* Nucleus */}
      <Sphere args={[0.35, 64, 64]}>
        <meshBasicMaterial color={[6, 0.5, 2]} toneMapped={false} />
      </Sphere>
    </group>
  )
}

/* 🪐 Electron with ultra-smooth glowing trail */
function Electron({ radius = 2.75, speed = 6, rotation = [0, 0, 0] }) {
  const electronRef = useRef()
  const orbitRef = useRef()

  // Electron orbit animation
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    const x = Math.sin(t) * radius
    const y = Math.cos(t) * radius * 0.38
    electronRef.current.position.set(x, y, 0)
  })

  // Subtle orbit plane rotation
  useFrame((state) => {
    orbitRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5
  })

  return (
    <group ref={orbitRef} rotation={rotation}>
      <Trail
        local={false}
        interval={0.5}                 // 🟣 Higher sampling → smoother path
        width={10}                      // bold head
        length={2}                      // visible trail distance
        decay={0.08}                    // fade duration (~1.5s)
        color={new THREE.Color(5, 2, 10)}
        attenuation={(t) => Math.pow(t, 2.2)} // head → thin tail
        // smoothing={1}                   // 🟣 built-in Catmull-Rom smoothing
        // blend={THREE.AdditiveBlending}  // add glow together
      >
        <mesh ref={electronRef}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial
            color={[10, 1, 10]}
            toneMapped={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </Trail>
    </group>
  )
}
