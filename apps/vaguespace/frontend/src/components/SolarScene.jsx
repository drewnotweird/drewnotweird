import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// ── Scene background colour ────────────────────────────────────────────────
function Background({ color }) {
  const { gl, scene } = useThree()
  useEffect(() => {
    scene.background = new THREE.Color(color)
  }, [color, scene, gl])
  return null
}

// ── Central planet ─────────────────────────────────────────────────────────
function Planet({ getAudioDataRef, config }) {
  const meshRef = useRef()
  const matRef = useRef()
  const atmoRef = useRef()

  useFrame((state) => {
    const data = getAudioDataRef.current?.()
    let bass = 0, amp = 0
    if (data) {
      let b = 0
      for (let i = 0; i < 8; i++) b += data[i]
      bass = Math.min(1, b / 8 / 180)
      let a = 0
      for (let i = 0; i < 32; i++) a += data[i]
      amp = Math.min(1, a / 32 / 160)
    }

    if (matRef.current) {
      matRef.current.distort = THREE.MathUtils.lerp(
        matRef.current.distort,
        config.distortBase + bass * config.distortAmp,
        0.08
      )
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(
        matRef.current.emissiveIntensity,
        0.6 + amp * 1.4,
        0.1
      )
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 + bass * 0.025
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.12
    }
    if (atmoRef.current) {
      atmoRef.current.material.opacity = THREE.MathUtils.lerp(
        atmoRef.current.material.opacity,
        0.1 + amp * 0.28,
        0.08
      )
      const s = 1 + amp * 0.1
      atmoRef.current.scale.setScalar(THREE.MathUtils.lerp(atmoRef.current.scale.x, s, 0.06))
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <MeshDistortMaterial
          ref={matRef}
          color={config.planet}
          emissive={config.glow}
          emissiveIntensity={0.6}
          distort={config.distortBase}
          speed={2.5}
          roughness={0.1}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={atmoRef}>
        <sphereGeometry args={[2.65, 32, 32]} />
        <meshBasicMaterial
          color={config.glow}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

// ── Orbiting spark tubes ───────────────────────────────────────────────────
function Sparks({ getAudioDataRef, colors }) {
  const group1 = useRef()
  const group2 = useRef()

  const { tubes1, tubes2 } = useMemo(() => {
    const make = (n, rMin, rMax, thickness) =>
      Array.from({ length: n }, () => {
        const pts = Array.from({ length: 6 }, () => {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const r = rMin + Math.random() * (rMax - rMin)
          return new THREE.Vector3(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
          )
        })
        const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5)
        const geo = new THREE.TubeGeometry(curve, 24, thickness + Math.random() * thickness, 4, false)
        const color = colors[Math.floor(Math.random() * colors.length)]
        return { geo, color }
      })

    return {
      tubes1: make(35, 3.2, 5.5, 0.012),
      tubes2: make(20, 5.5, 9.0, 0.008),
    }
  }, [colors])

  useFrame(() => {
    const data = getAudioDataRef.current?.()
    let amp = 0
    if (data) {
      let s = 0
      for (let i = 0; i < 32; i++) s += data[i]
      amp = Math.min(1, s / 32 / 160)
    }
    if (group1.current) {
      group1.current.rotation.y += 0.0012 + amp * 0.009
      group1.current.rotation.z += 0.0007 + amp * 0.004
    }
    if (group2.current) {
      group2.current.rotation.y -= 0.0009 + amp * 0.006
      group2.current.rotation.x += 0.0005 + amp * 0.003
    }
  })

  return (
    <>
      <group ref={group1}>
        {tubes1.map((t, i) => (
          <mesh key={i} geometry={t.geo}>
            <meshBasicMaterial color={t.color} />
          </mesh>
        ))}
      </group>
      <group ref={group2}>
        {tubes2.map((t, i) => (
          <mesh key={i} geometry={t.geo}>
            <meshBasicMaterial color={t.color} transparent opacity={0.55} />
          </mesh>
        ))}
      </group>
    </>
  )
}

// ── Slow camera drift ──────────────────────────────────────────────────────
function Camera() {
  const { camera } = useThree()
  useFrame((state) => {
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.07) * 1.5
    camera.position.y = Math.cos(state.clock.elapsedTime * 0.05) * 0.8
    camera.lookAt(0, 0, 0)
  })
  return null
}

// ── Main export ────────────────────────────────────────────────────────────
export default function SolarScene({ config, getAudioData }) {
  const getAudioDataRef = useRef(getAudioData)
  useEffect(() => { getAudioDataRef.current = getAudioData }, [getAudioData])

  return (
    <Canvas
      camera={{ fov: 70, position: [0, 0, 12] }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Background color={config.bg} />
      <Camera />
      <Stars radius={80} depth={60} count={4000} factor={3} saturation={0} fade speed={0.5} />
      <Planet getAudioDataRef={getAudioDataRef} config={config} />
      <Sparks getAudioDataRef={getAudioDataRef} colors={config.sparks} />
      <EffectComposer>
        <Bloom
          intensity={config.bloomStrength}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.85}
          height={400}
        />
      </EffectComposer>
    </Canvas>
  )
}
