import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, MeshDistortMaterial } from '@react-three/drei'
import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'

// ── Scene background colour ────────────────────────────────────────────────
function Background({ color }) {
  const { scene } = useThree()
  useEffect(() => { scene.background = new THREE.Color(color) }, [color, scene])
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
      let b = 0; for (let i = 0; i < 8; i++) b += data[i]
      bass = Math.min(1, b / 8 / 180)
      let a = 0; for (let i = 0; i < 32; i++) a += data[i]
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
        0.6 + amp * 1.6,
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
        0.1 + amp * 0.3,
        0.08
      )
    }
  })

  const r = config.planetSize
  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[r, 64, 64]} />
        <MeshDistortMaterial
          ref={matRef}
          color={config.planet}
          emissive={config.glow}
          emissiveIntensity={0.6}
          distort={config.distortBase}
          speed={config.distortSpeed}
          roughness={0.1}
          metalness={0.15}
        />
      </mesh>
      <mesh ref={atmoRef}>
        <sphereGeometry args={[r * 1.22, 32, 32]} />
        <meshBasicMaterial color={config.glow} transparent opacity={0.1} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ── Saturn-style rings ─────────────────────────────────────────────────────
function Rings({ config }) {
  const meshRef = useRef()
  const r = config.planetSize

  const geo = useMemo(() => {
    return new THREE.RingGeometry(r * 1.55, r * 2.8, 80)
  }, [r])

  // Fix ring geometry UVs so it renders as a flat band
  useMemo(() => {
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    const inner = r * 1.55, outer = r * 2.8
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      uv.setXY(i, (dist - inner) / (outer - inner), 0)
    }
  }, [geo, r])

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.z += 0.0006
  })

  return (
    <mesh ref={meshRef} rotation={[Math.PI * 0.42, 0.1, 0]} geometry={geo}>
      <meshBasicMaterial color={config.ringColor} transparent opacity={0.28} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  )
}

// ── Orbiting spark tubes ───────────────────────────────────────────────────
function Sparks({ getAudioDataRef, config }) {
  const group1 = useRef()
  const group2 = useRef()

  const { tubes1, tubes2 } = useMemo(() => {
    const make = (n, [rMin, rMax], thickness) =>
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
        const color = config.sparks[Math.floor(Math.random() * config.sparks.length)]
        return { geo, color }
      })

    return {
      tubes1: make(config.sparkCount1, config.sparkRadius1, config.sparkThickness1),
      tubes2: make(config.sparkCount2, config.sparkRadius2, config.sparkThickness2),
    }
  }, [config])

  useFrame(() => {
    const data = getAudioDataRef.current?.()
    let amp = 0
    if (data) { let s = 0; for (let i = 0; i < 32; i++) s += data[i]; amp = Math.min(1, s / 32 / 160) }
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

// ── Camera drift ───────────────────────────────────────────────────────────
function Camera({ config }) {
  const { camera } = useThree()
  useEffect(() => { camera.position.z = config.cameraZ }, [config.cameraZ, camera])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const d = config.cameraDrift
    camera.position.x = Math.sin(t * 0.07 * d) * 1.5
    camera.position.y = Math.cos(t * 0.05 * d) * 0.9
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
      camera={{ fov: 70, position: [0, 0, config.cameraZ] }}
      style={{ position: 'absolute', inset: 0 }}
      gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
    >
      <Background color={config.bg} />
      <Camera config={config} />
      <Stars radius={80} depth={60} count={4000} factor={3} saturation={0} fade speed={config.starsSpeed} />
      <Planet getAudioDataRef={getAudioDataRef} config={config} />
      {config.rings && <Rings config={config} />}
      <Sparks getAudioDataRef={getAudioDataRef} config={config} />
    </Canvas>
  )
}
