import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, CameraShake, Stars, Line } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

const COLORS = ['#c06995','#de77c7','#df86df','#d998ee','#ceadf4','#c6bff9']

// ── Planet ─────────────────────────────────────────────────────────────────
function Planet({ getAudioDataRef }) {
  const matRef = useRef()
  const meshRef = useRef()

  useFrame((state) => {
    const data = getAudioDataRef.current?.()
    let amp = 0
    if (data) {
      let s = 0; for (let i = 0; i < 32; i++) s += data[i]
      amp = Math.min(1, s / 32 / 180)
    }
    if (matRef.current) {
      matRef.current.distort = THREE.MathUtils.lerp(matRef.current.distort, 0.3 + amp * 0.5, 0.05)
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
    }
  })

  return (
    <group scale={[10, 10, 10]}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 4]} />
        <MeshDistortMaterial
          ref={matRef}
          color="#600935"
          emissive="#de77c7"
          emissiveIntensity={1.5}
          distort={0.3}
          speed={2}
          roughness={0}
        />
      </mesh>
    </group>
  )
}

// ── Sparks — thick animated lines via drei Line ───────────────────────────
function Sparks({ getAudioDataRef }) {
  const groupRef = useRef()

  const lines = useMemo(() => {
    const radius = 10
    const rv = () => 0.2 + Math.random() * 0.8
    return Array.from({ length: 20 }, (_, index) => {
      const pos = new THREE.Vector3(
        Math.sin(0) * radius * rv(),
        Math.cos(0) * radius * rv(),
        0
      )
      const pts = Array.from({ length: 30 }, (_, i) => {
        const angle = (i / 20) * Math.PI * 2
        return pos.add(new THREE.Vector3(
          Math.sin(angle) * radius * rv(),
          Math.cos(angle) * radius * rv(),
          0
        )).clone()
      })
      return {
        points: new THREE.CatmullRomCurve3(pts).getPoints(100),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        lineWidth: Math.max(0.3, (1.5 * index) / 20),
      }
    })
  }, [])

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.0002
      groupRef.current.rotation.y += 0.0004
    }
  })

  return (
    <group ref={groupRef} position={[-20, -10, -10]} scale={[1, 1.3, 1]}>
      {lines.map((l, i) => (
        <Line
          key={i}
          points={l.points}
          color={l.color}
          lineWidth={l.lineWidth}
          transparent
          opacity={0.7}
          depthTest={false}
        />
      ))}
    </group>
  )
}

// ── Space dust ─────────────────────────────────────────────────────────────
function SpaceDust() {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const particles = useMemo(() => Array.from({ length: 5000 }, () => ({
    t: Math.random() * 100,
    factor: 20 + Math.random() * 100,
    speed: 0.01 + Math.random() / 200,
    xFactor: -50 + Math.random() * 100,
    yFactor: -50 + Math.random() * 100,
    zFactor: -50 + Math.random() * 100,
  })), [])

  useFrame(() => {
    particles.forEach((p, i) => {
      p.t += p.speed / 2
      const s = Math.max(0.01, Math.abs(Math.cos(p.t)))
      dummy.position.set(
        p.xFactor + Math.cos(p.t / 10 * p.factor) + Math.sin(p.t) * p.factor / 10,
        p.yFactor + Math.sin(p.t / 10 * p.factor) + Math.cos(p.t * 2) * p.factor / 10,
        p.zFactor + Math.cos(p.t / 10 * p.factor) + Math.sin(p.t * 3) * p.factor / 10,
      )
      dummy.scale.setScalar(s)
      dummy.rotation.set(s * 5, s * 5, s * 5)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, 5000]}>
      <dodecahedronGeometry args={[0.2, 0]} />
      <meshPhongMaterial color="#050505" />
    </instancedMesh>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function SolarScene({ getAudioData }) {
  const getAudioDataRef = useRef(getAudioData)
  useEffect(() => { getAudioDataRef.current = getAudioData }, [getAudioData])

  return (
    <Canvas
      camera={{ fov: 100, position: [0, 0, 30] }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color('#020207'))}
    >
      <CameraShake yawFrequency={0.05} rollFrequency={0.2} pitchFrequency={0.1} />
      <pointLight distance={100} intensity={4} color="white" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade />
      <Planet getAudioDataRef={getAudioDataRef} />
      <SpaceDust />
      <Sparks getAudioDataRef={getAudioDataRef} />
    </Canvas>
  )
}
