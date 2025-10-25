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
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
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
    () => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(100),
    []
  )

  const vertices = points.map((p) => new THREE.Vector3(p.x, p.y, 0))

  return (
    <group {...props}>
      {/* Three glowing orbit rings */}
      <Line points={vertices} color={[4, 1, 10]} lineWidth={2} toneMapped={false} />
      <Line
        points={vertices}
        color={[4, 1, 10]}
        lineWidth={2}
        toneMapped={false}
        rotation={[0, 0, Math.PI / 3]}
      />
      <Line
        points={vertices}
        color={[4, 1, 10]}
        lineWidth={2}
        toneMapped={false}
        rotation={[0, 0, -Math.PI / 3]}
      />

      {/* Three moving electrons */}
      <Electron position={[0, 0, 0.5]} speed={6} />
      <Electron position={[0, 0, 0.5]} rotation={[0, 0, Math.PI / 3]} speed={6.5} />
      <Electron position={[0, 0, 0.5]} rotation={[0, 0, -Math.PI / 3]} speed={7} />

      {/* Glowing nucleus */}
      <Sphere args={[0.35, 64, 64]}>
        <meshBasicMaterial color={[6, 0.5, 2]} toneMapped={false} />
      </Sphere>
    </group>
  )
}

function Electron({ radius = 2.75, speed = 6, ...props }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    ref.current.position.set(Math.sin(t) * radius, (Math.cos(t) * radius * Math.atan(t)) / Math.PI / 1.25, 0)
  })
  return (
    <group {...props}>
      <Trail local width={5} length={10} color={new THREE.Color(2, 1, 10)} attenuation={(t) => t * t}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.25]} />
          <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  )
}
