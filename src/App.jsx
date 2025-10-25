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
    () => new THREE.EllipseCurve(0, 0, 3, 1.15, 0, 2 * Math.PI, false, 0).getPoints(150),
    []
  )
  const vertices = points.map((p) => new THREE.Vector3(p.x, p.y, 0))

  return (
    <group {...props}>
      {/* Base thin ellipses */}
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

      {/* Bold moving ellipses synced with electrons */}
      <BoldOrbit rotation={[0, 0, 0]} speed={6} />
      <BoldOrbit rotation={[0, 0, Math.PI / 3]} speed={6.5} />
      <BoldOrbit rotation={[0, 0, -Math.PI / 3]} speed={7} />

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

/* 🟣 BoldOrbit: follows the electron angle and creates a glow spot on the ellipse */
function BoldOrbit({ radius = 3, speed = 6, ...props }) {
  const ref = useRef()
  const materialRef = useRef()

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * speed) % (2 * Math.PI)
    materialRef.current.uniforms.uAngle.value = t
  })

  const points = useMemo(
    () => new THREE.EllipseCurve(0, 0, radius, radius * 0.38, 0, 2 * Math.PI, false, 0).getPoints(150),
    [radius]
  )
  const vertices = points.map((p) => new THREE.Vector3(p.x, p.y, 0))

  return (
    <group {...props}>
      <line ref={ref}>
        <bufferGeometry attach="geometry" setFromPoints={vertices} />
        <shaderMaterial
          ref={materialRef}
          transparent
          blending={THREE.AdditiveBlending}
          uniforms={{
            uAngle: { value: 0 },
            uGlowWidth: { value: 0.3 },
          }}
          vertexShader={`
            varying vec2 vUv;
            varying float vAngle;
            void main() {
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              vAngle = atan(position.y, position.x);
              gl_Position = projectionMatrix * mvPosition;
            }
          `}
          fragmentShader={`
            uniform float uAngle;
            uniform float uGlowWidth;
            varying float vAngle;
            void main() {
              float diff = abs(mod(vAngle - uAngle + 3.14159, 6.28318) - 3.14159);
              float intensity = smoothstep(uGlowWidth, 0.0, diff);
              gl_FragColor = vec4(4.0, 1.0, 10.0, intensity * 0.9);
            }
          `}
        />
      </line>
    </group>
  )
}

/* 🪐 Electron */
function Electron({ radius = 2.75, speed = 6, ...props }) {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed
    const x = Math.sin(t) * radius
    const y = Math.cos(t) * radius * 0.38
    ref.current.position.set(x, y, 0)
  })
  return (
    <group {...props}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.25]} />
        <meshBasicMaterial color={[10, 1, 10]} toneMapped={false} />
      </mesh>
    </group>
  )
}
