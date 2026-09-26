import React, { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Gamepad2,
  RotateCcw,
} from 'lucide-react'
import { gameAudio } from '../utils/audio'

export type RenderMode =
  | 'wireframe'
  | 'particles'
  | 'terrain'
  | 'audio'
  | 'pipeline'
  | 'defender'
  | 'breakout'

interface Point3D {
  x: number
  y: number
  z: number
}

interface PipelineNode {
  id: string
  name: string
  stage: string
  spec: string
  x: number
  y: number
  w: number
  h: number
  color: string
}

interface Particle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  color: string
}

interface DefenderLaser {
  x: number
  y: number
  vy: number
}

interface DefenderEnemy {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  sides: number
  angle: number
  rotSpeed: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  size?: number
}

interface BreakoutBrick {
  x: number
  y: number
  w: number
  h: number
  text: string
  color: string
  alive: boolean
}

export interface ModeOption {
  id: RenderMode
  label: string
  category: 'visualizer' | 'game'
  tag: string
  desc: string
  color: string
}

export const MODES: ModeOption[] = [
  {
    id: 'wireframe',
    label: '3D MESH (WIREFRAME)',
    category: 'visualizer',
    tag: '3D MESH',
    desc: 'Polyhedral projection & normal vectors',
    color: '#c4f13b',
  },
  {
    id: 'particles',
    label: 'COMPUTE PARTICLES',
    category: 'visualizer',
    tag: 'COMPUTE',
    desc: '3D particle velocity & force fields',
    color: '#00e5ff',
  },
  {
    id: 'terrain',
    label: 'NEON CYBER TERRAIN',
    category: 'visualizer',
    tag: 'TERRAIN',
    desc: 'Continuous infinite flight & depth fog',
    color: '#c4f13b',
  },
  {
    id: 'audio',
    label: 'AUDIO SPECTRUM WAVE',
    category: 'visualizer',
    tag: 'AUDIO WAVE',
    desc: 'Real-time DSP FFT & oscilloscope',
    color: '#c4f13b',
  },
  {
    id: 'pipeline',
    label: 'RENDER GRAPH PIPELINE',
    category: 'visualizer',
    tag: 'RENDER GRAPH',
    desc: 'Vulkan 1.3 deferred multi-pass graph',
    color: '#00e5ff',
  },
  {
    id: 'defender',
    label: '🎮 VOID DEFENDER',
    category: 'game',
    tag: '🎮 DEFENDER',
    desc: 'Vector space combat (click to fire)',
    color: '#ff758a',
  },
  {
    id: 'breakout',
    label: '🎮 CYBER BREAKOUT',
    category: 'game',
    tag: '🎮 BREAKOUT',
    desc: 'High-speed paddle & brick destruction',
    color: '#00e5ff',
  },
]

export const EngineViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mode, setMode] = useState<RenderMode>('wireframe')
  const [fps, setFps] = useState(60)
  const [drawCalls, setDrawCalls] = useState(14)
  const [verticesCount, setVerticesCount] = useState(12480)

  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Game state counters
  const [gameScore, setGameScore] = useState(0)
  const [gameKills, setGameKills] = useState(0)
  const [gameCombo, setGameCombo] = useState(1)

  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, rawX: 0, rawY: 0, isDown: false })
  const pulseRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([])
  const terrainDistanceRef = useRef(0)
  const terrainBufferRef = useRef({
    x: new Float32Array(1024),
    y: new Float32Array(1024),
    alpha: new Float32Array(64),
    valid: new Uint8Array(64),
  })

  // Defender state ref
  const defenderRef = useRef<{
    ship: { x: number; y: number }
    lasers: DefenderLaser[]
    enemies: DefenderEnemy[]
    sparks: Spark[]
    score: number
    kills: number
    combo: number
    lastSpawn: number
    screenShake: number
  }>({
    ship: { x: 200, y: 350 },
    lasers: [],
    enemies: [],
    sparks: [],
    score: 0,
    kills: 0,
    combo: 1,
    lastSpawn: 0,
    screenShake: 0,
  })

  // Breakout state ref
  const breakoutRef = useRef<{
    paddleX: number
    paddleW: number
    paddleH: number
    ball: { x: number; y: number; vx: number; vy: number; r: number; active: boolean }
    bricks: BreakoutBrick[]
    sparks: Spark[]
    score: number
  }>({
    paddleX: 200,
    paddleW: 90,
    paddleH: 10,
    ball: { x: 200, y: 280, vx: 2.5, vy: -3, r: 6, active: true },
    bricks: [],
    sparks: [],
    score: 0,
  })

  const resetDefenderGame = () => {
    defenderRef.current = {
      ship: { x: 200, y: 350 },
      lasers: [],
      enemies: [],
      sparks: [],
      score: 0,
      kills: 0,
      combo: 1,
      lastSpawn: performance.now(),
      screenShake: 0,
    }
    setGameScore(0)
    setGameKills(0)
    setGameCombo(1)
  }

  const resetBreakoutGame = (w: number = 500) => {
    const brickLabels = [
      ['VULKAN', 'D3D12', 'C++23', 'RUST'],
      ['HLSL', 'SPIR-V', 'CORECLR', 'HOSTFXR'],
      ['ECS', 'SIMD', 'RENDER', 'PIPELINE'],
    ]
    const colors = ['#c4f13b', '#00e5ff', '#ff758a']
    const cols = 4
    const rows = 3
    const pad = 8
    const margin = 24
    const totalW = w - margin * 2
    const brickW = (totalW - pad * (cols - 1)) / cols
    const brickH = 22

    const bricks: BreakoutBrick[] = []
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: margin + c * (brickW + pad),
          y: 45 + r * (brickH + pad),
          w: brickW,
          h: brickH,
          text: brickLabels[r][c] || 'BLOCK',
          color: colors[r % colors.length],
          alive: true,
        })
      }
    }

    breakoutRef.current = {
      paddleX: w / 2,
      paddleW: 90,
      paddleH: 10,
      ball: { x: w / 2, y: 220, vx: 2.8, vy: -3.2, r: 6, active: true },
      bricks,
      sparks: [],
      score: 0,
    }
    setGameScore(0)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let lastTime = performance.now()
    let frameCount = 0
    let fpsTimer = performance.now()

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      if (mode === 'breakout' && breakoutRef.current.bricks.length === 0) {
        resetBreakoutGame(rect.width)
      }
    }
    resize()
    window.addEventListener('resize', resize)

    // Setup 3D vertices for Wireframe mode
    const phi = (1 + Math.sqrt(5)) / 2
    const baseVertices: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ].map((v) => {
      const len = Math.hypot(v.x, v.y, v.z)
      return { x: (v.x / len) * 115, y: (v.y / len) * 115, z: (v.z / len) * 115 }
    })

    const edges: [number, number][] = []
    for (let i = 0; i < baseVertices.length; i++) {
      for (let j = i + 1; j < baseVertices.length; j++) {
        const d = Math.hypot(
          baseVertices[i].x - baseVertices[j].x,
          baseVertices[i].y - baseVertices[j].y,
          baseVertices[i].z - baseVertices[j].z
        )
        if (d < 160) {
          edges.push([i, j])
        }
      }
    }

    // Setup particles for Compute mode
    const numParticles = 160
    const particles: Particle[] = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 360,
      z: (Math.random() - 0.5) * 360,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1.2,
      color: Math.random() > 0.4 ? '#c4f13b' : '#00e5ff',
    }))

    let rotX = 0.4
    let rotY = 0.4
    let angle = 0

    // Initialize games if needed
    if (mode === 'breakout' && breakoutRef.current.bricks.length === 0) {
      resetBreakoutGame(canvas.clientWidth)
    }

    const render = (currentTime: number) => {
      frameCount++
      if (currentTime - fpsTimer >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (currentTime - fpsTimer))
        setFps(calculatedFps)
        frameCount = 0
        fpsTimer = currentTime
      }
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      const width = canvas.clientWidth
      const height = canvas.clientHeight

      // Apply screen shake if defender game active
      ctx.save()
      if (mode === 'defender' && defenderRef.current.screenShake > 0) {
        const s = defenderRef.current.screenShake
        ctx.translate((Math.random() - 0.5) * s * 6, (Math.random() - 0.5) * s * 6)
        defenderRef.current.screenShake = Math.max(0, defenderRef.current.screenShake - dt * 3)
      }

      ctx.clearRect(-10, -10, width + 20, height + 20)

      const centerX = width / 2
      const centerY = height / 2

      // Smooth mouse follow
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.1
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.1

      // Common Background Grid
      ctx.strokeStyle = 'rgba(43, 57, 56, 0.4)'
      ctx.lineWidth = 1
      const gridSize = 40
      ctx.beginPath()
      for (let x = 0; x < width; x += gridSize) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Target reticle rings
      ctx.strokeStyle = 'rgba(196, 241, 59, 0.1)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
      ctx.stroke()

      // Update Shockwaves
      for (let i = pulseRef.current.length - 1; i >= 0; i--) {
        const p = pulseRef.current[i]
        p.r += 140 * dt
        p.alpha -= 1.2 * dt
        if (p.alpha <= 0) {
          pulseRef.current.splice(i, 1)
        } else {
          ctx.strokeStyle = `rgba(196, 241, 59, ${p.alpha})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // ==========================================
      // 1. 3D MESH (WIREFRAME POLYHEDRON)
      // ==========================================
      if (mode === 'wireframe') {
        angle += 0.8 * dt
        rotX = 0.2 + mousePosRef.current.y * 0.0025
        rotY = angle + mousePosRef.current.x * 0.003

        const cosX = Math.cos(rotX)
        const sinX = Math.sin(rotX)
        const cosY = Math.cos(rotY)
        const sinY = Math.sin(rotY)

        const projected = baseVertices.map((v) => {
          const x1 = v.x * cosY - v.z * sinY
          const z1 = v.x * sinY + v.z * cosY
          const y2 = v.y * cosX - z1 * sinX
          const z2 = v.y * sinX + z1 * cosX

          const fov = 420
          const scale = fov / (fov + z2)
          return {
            x: centerX + x1 * scale,
            y: centerY + y2 * scale,
            z: z2,
            scale,
          }
        })

        // Draw edges
        ctx.strokeStyle = 'rgba(196, 241, 59, 0.75)'
        ctx.lineWidth = 1.6
        ctx.shadowColor = '#c4f13b'
        ctx.shadowBlur = 8

        edges.forEach(([i, j]) => {
          const p1 = projected[i]
          const p2 = projected[j]
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.stroke()
        })

        // Draw vertex nodes
        projected.forEach((p) => {
          ctx.fillStyle = '#ffffff'
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3.2 * p.scale, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // ==========================================
      // 2. COMPUTE PARTICLES
      // ==========================================
      else if (mode === 'particles') {
        const targetX = centerX + mousePosRef.current.x * 0.45
        const targetY = centerY + mousePosRef.current.y * 0.45

        particles.forEach((p) => {
          const dx = targetX - (centerX + p.x)
          const dy = targetY - (centerY + p.y)
          const dist = Math.hypot(dx, dy) + 0.1
          const force = 38 / (dist + 40)

          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force

          p.vx *= 0.96
          p.vy *= 0.96

          p.x += p.vx
          p.y += p.vy

          if (p.x < -200) p.x = 200
          if (p.x > 200) p.x = -200
          if (p.y < -200) p.y = 200
          if (p.y > 200) p.y = -200

          const px = centerX + p.x
          const py = centerY + p.y

          if (dist < 90) {
            ctx.strokeStyle = 'rgba(196, 241, 59, 0.3)'
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(targetX, targetY)
            ctx.stroke()
          }

          ctx.fillStyle = p.color
          ctx.shadowColor = p.color
          ctx.shadowBlur = 6
          ctx.beginPath()
          ctx.arc(px, py, p.size, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // ==========================================
      // 3. NEON CYBER TERRAIN (INFINITE 3D FLIGHT)
      // ==========================================
      else if (mode === 'terrain') {
        // Continuous world distance advancement - zero modulo snap!
        terrainDistanceRef.current += dt * 115
        const camZ = terrainDistanceRef.current
        const fov = 175
        const rows = 22
        const cols = 23
        const spacingX = 40
        const spacingZ = 32
        const horizonY = centerY - 32
        const camHeight = 95
        const steerX = mousePosRef.current.x * 0.25

        // Glowing horizon sun / core
        const sunGrad = ctx.createRadialGradient(centerX, horizonY, 4, centerX, horizonY, 130)
        sunGrad.addColorStop(0, 'rgba(196, 241, 59, 0.55)')
        sunGrad.addColorStop(0.3, 'rgba(255, 117, 138, 0.28)')
        sunGrad.addColorStop(0.7, 'rgba(0, 229, 255, 0.1)')
        sunGrad.addColorStop(1, 'transparent')
        ctx.fillStyle = sunGrad
        ctx.beginPath()
        ctx.arc(centerX, horizonY, 130, 0, Math.PI * 2)
        ctx.fill()

        // Distant Cyber Sun Disc
        ctx.fillStyle = '#ff758a'
        ctx.beginPath()
        ctx.arc(centerX, horizonY - 4, 32, Math.PI, 0)
        ctx.fill()

        // Sun scanline slats
        ctx.fillStyle = '#101716'
        for (let s = 1; s <= 4; s++) {
          ctx.fillRect(centerX - 35, horizonY - s * 7, 70, 2)
        }

        // Horizon line
        ctx.strokeStyle = '#ff758a'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(0, horizonY)
        ctx.lineTo(width, horizonY)
        ctx.stroke()

        // Continuous scrolling coordinate calculation
        const offsetZ = camZ % spacingZ
        const kBase = Math.floor(camZ / spacingZ)
        const maxZ = rows * spacingZ

        const ptsX = terrainBufferRef.current.x
        const ptsY = terrainBufferRef.current.y
        const rowAlpha = terrainBufferRef.current.alpha
        const rowValid = terrainBufferRef.current.valid

        for (let r = 0; r < rows; r++) {
          // Camera-space Z distance: decreases smoothly as camZ increases
          const z = (r + 1) * spacingZ - offsetZ
          if (z < 15) {
            rowValid[r] = 0
            rowAlpha[r] = 0
            continue
          }

          // Continuous world-space Z anchor for consistent heightmap
          const worldZ = (kBase + r + 1) * spacingZ
          const scale = fov / z

          // Smooth depth fog: fades in seamlessly at the horizon, fades out smoothly near camera
          const nearFade = Math.min(1, Math.max(0, (z - 20) / 45))
          const farFade = Math.min(1, Math.max(0, (maxZ - z) / 100))
          const alpha = nearFade * farFade
          rowAlpha[r] = alpha
          rowValid[r] = alpha > 0.01 ? 1 : 0

          for (let c = 0; c < cols; c++) {
            const worldX = (c - (cols - 1) / 2) * spacingX + steerX
            const distFromCenter = Math.abs(c - (cols - 1) / 2)

            // Heightmap: completely flat speed corridor in middle, synthwave mountain ridges on sides
            let height = 0
            if (distFromCenter > 2.5) {
              const mountainFactor = (distFromCenter - 2.5) * 13
              const wave1 = Math.sin(worldX * 0.016 + worldZ * 0.011)
              const wave2 = Math.cos(worldX * 0.028 - worldZ * 0.016) * 0.5
              const wave3 = Math.sin((worldX + worldZ) * 0.007) * 0.35
              height = Math.max(-12, (wave1 + wave2 + wave3) * mountainFactor)
            }

            const projX = centerX + worldX * scale
            const projY = horizonY + (camHeight - height) * scale

            const idx = r * cols + c
            ptsX[idx] = projX
            ptsY[idx] = projY
          }
        }

        // 1. Draw Longitudinal (Vertical) Lines in one batch using a depth gradient
        const vertGrad = ctx.createLinearGradient(0, horizonY, 0, height)
        vertGrad.addColorStop(0, 'rgba(0, 229, 255, 0)')
        vertGrad.addColorStop(0.15, 'rgba(0, 229, 255, 0.45)')
        vertGrad.addColorStop(0.7, 'rgba(0, 229, 255, 0.6)')
        vertGrad.addColorStop(1, 'rgba(0, 229, 255, 0)')

        ctx.strokeStyle = vertGrad
        ctx.lineWidth = 1.0
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          let lineStarted = false
          for (let r = 0; r < rows; r++) {
            if (rowValid[r] === 0) continue
            const idx = r * cols + c
            if (!lineStarted) {
              ctx.moveTo(ptsX[idx], ptsY[idx])
              lineStarted = true
            } else {
              ctx.lineTo(ptsX[idx], ptsY[idx])
            }
          }
        }
        ctx.stroke()

        // 2. Draw Center Highway Guidance Lines (Extra Vibrant Neon Glow)
        const centerCol = Math.floor(cols / 2)
        ctx.strokeStyle = 'rgba(255, 117, 138, 0.75)'
        ctx.lineWidth = 1.8
        ctx.beginPath()
        let centerStarted = false
        for (let r = 0; r < rows; r++) {
          if (rowValid[r] === 0) continue
          const idx = r * cols + centerCol
          if (!centerStarted) {
            ctx.moveTo(ptsX[idx], ptsY[idx])
            centerStarted = true
          } else {
            ctx.lineTo(ptsX[idx], ptsY[idx])
          }
        }
        ctx.stroke()

        // 3. Draw Horizontal (Transverse) Terrain Lines with individual row depth fade
        ctx.lineWidth = 1.2
        for (let r = 0; r < rows; r++) {
          if (rowValid[r] === 0) continue
          const a = rowAlpha[r]
          ctx.strokeStyle = `rgba(196, 241, 59, ${(a * 0.75).toFixed(3)})`
          ctx.beginPath()
          const rowStart = r * cols
          for (let c = 0; c < cols; c++) {
            const idx = rowStart + c
            if (c === 0) ctx.moveTo(ptsX[idx], ptsY[idx])
            else ctx.lineTo(ptsX[idx], ptsY[idx])
          }
          ctx.stroke()
        }
      }

      // ==========================================
      // 4. AUDIO FREQUENCY SPECTRUM & OSCILLOSCOPE
      // ==========================================
      else if (mode === 'audio') {
        const bands = 28
        const barW = (width - 120) / bands
        const baseH = 110

        // Equalizer Bars
        for (let i = 0; i < bands; i++) {
          const freq = (i + 1) * 0.4
          const dynamicAmp =
            Math.sin(currentTime * 0.003 * freq + i * 0.25) * 0.5 +
            Math.cos(currentTime * 0.002 + i * 0.15) * 0.3 +
            0.5
          const mouseFactor = 1 + (Math.abs(mousePosRef.current.rawX - (60 + i * barW)) < 80 ? 0.6 : 0)
          const barHeight = Math.max(8, dynamicAmp * baseH * mouseFactor)

          const x = 60 + i * barW
          const y = centerY + 80 - barHeight

          const grad = ctx.createLinearGradient(x, y, x, y + barHeight)
          grad.addColorStop(0, '#c4f13b')
          grad.addColorStop(0.5, '#00e5ff')
          grad.addColorStop(1, 'rgba(255, 117, 138, 0.3)')

          ctx.fillStyle = grad
          ctx.fillRect(x + 2, y, barW - 4, barHeight)

          // Peak Cap dot
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#ffffff'
          ctx.shadowBlur = 6
          ctx.fillRect(x + 2, y - 5, barW - 4, 2)
        }

        // Oscilloscope Waveform Sine lines
        ctx.strokeStyle = '#c4f13b'
        ctx.lineWidth = 2
        ctx.shadowColor = '#c4f13b'
        ctx.shadowBlur = 10
        ctx.beginPath()
        for (let x = 30; x < width - 30; x += 4) {
          const waveY =
            centerY -
            40 +
            Math.sin(x * 0.02 + currentTime * 0.005) * 35 * Math.sin(currentTime * 0.001) +
            Math.cos(x * 0.04 - currentTime * 0.004) * 15
          if (x === 30) ctx.moveTo(x, waveY)
          else ctx.lineTo(x, waveY)
        }
        ctx.stroke()

        // Frequency Label
        ctx.fillStyle = '#c4f13b'
        ctx.font = '700 9px "DM Mono", monospace'
        ctx.fillText('AUDIO DSP ENGINE // 48,000 HZ · 32 BANDS ACTIVE', 60, centerY - 85)
      }

      // ==========================================
      // 5. RENDER GRAPH / PIPELINE
      // ==========================================
      else if (mode === 'pipeline') {
        const nodeW = Math.min(185, Math.floor((width - 48) * 0.48))
        const nodeH = 48
        const leftX = 14
        const rightX = width - nodeW - 14

        const nodes: PipelineNode[] = [
          {
            id: 'gbuffer',
            name: '01 // GBUFFER PASS',
            stage: 'VK_GRAPHICS_PIPELINE',
            spec: '14 CALLS · MRT ALBEDO/DEPTH',
            x: leftX,
            y: centerY - 110,
            w: nodeW,
            h: nodeH,
            color: '#c4f13b',
          },
          {
            id: 'cull',
            name: '02 // COMPUTE CULL',
            stage: 'VK_SHADER_COMPUTE',
            spec: 'HZB CULL · 32K INSTANCES',
            x: rightX,
            y: centerY - 65,
            w: nodeW,
            h: nodeH,
            color: '#00e5ff',
          },
          {
            id: 'light',
            name: '03 // CLUSTER LIGHT',
            stage: 'VK_STORAGE_BUFFER',
            spec: 'FROXEL GRID 16x8x24',
            x: leftX,
            y: centerY + 12,
            w: nodeW,
            h: nodeH,
            color: '#ff758a',
          },
          {
            id: 'post',
            name: '04 // PRESENT SWAP',
            stage: 'VK_PRESENT_KHR',
            spec: 'TAA + BLOOM · HDR10',
            x: rightX,
            y: centerY + 58,
            w: nodeW,
            h: nodeH,
            color: '#c4f13b',
          },
        ]

        for (let i = 0; i < nodes.length - 1; i++) {
          const from = nodes[i]
          const to = nodes[i + 1]
          const x1 = from.x + from.w / 2
          const y1 = from.y + from.h / 2
          const x2 = to.x + to.w / 2
          const y2 = to.y + to.h / 2

          ctx.strokeStyle = 'rgba(43, 57, 56, 0.7)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.bezierCurveTo(centerX, y1, centerX, y2, x2, y2)
          ctx.stroke()

          const t = (currentTime * 0.0012 + i * 0.3) % 1
          const pulseX =
            (1 - t) * (1 - t) * (1 - t) * x1 +
            3 * (1 - t) * (1 - t) * t * centerX +
            3 * (1 - t) * t * t * centerX +
            t * t * t * x2
          const pulseY =
            (1 - t) * (1 - t) * (1 - t) * y1 +
            3 * (1 - t) * (1 - t) * t * y1 +
            3 * (1 - t) * t * t * y2 +
            t * t * t * y2

          ctx.fillStyle = from.color
          ctx.shadowColor = from.color
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }

        const mouseX = mousePosRef.current.rawX
        const mouseY = mousePosRef.current.rawY

        nodes.forEach((n) => {
          const isHovered =
            mouseX >= n.x && mouseX <= n.x + n.w && mouseY >= n.y && mouseY <= n.y + n.h

          ctx.fillStyle = isHovered ? '#152125' : '#10171b'
          ctx.strokeStyle = isHovered ? n.color : 'rgba(43, 57, 56, 0.8)'
          ctx.lineWidth = isHovered ? 2 : 1
          ctx.shadowColor = isHovered ? n.color : 'transparent'
          ctx.shadowBlur = isHovered ? 12 : 0

          ctx.fillRect(n.x, n.y, n.w, n.h)
          ctx.strokeRect(n.x, n.y, n.w, n.h)

          ctx.fillStyle = isHovered ? n.color : '#ecf2ed'
          ctx.font = '700 8.5px "DM Mono", monospace'
          ctx.fillText(n.name, n.x + 8, n.y + 15)

          ctx.fillStyle = '#6f8178'
          ctx.font = '7px "DM Mono", monospace'
          ctx.fillText(n.stage, n.x + 8, n.y + 27)

          ctx.fillStyle = '#a8b6ae'
          ctx.font = '7px "DM Mono", monospace'
          ctx.fillText(n.spec, n.x + 8, n.y + 39)
        })

        ctx.strokeStyle = 'rgba(196, 241, 59, 0.25)'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 42, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = '#c4f13b'
        ctx.font = '700 8.5px "DM Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('RENDER GRAPH', centerX, centerY - 4)
        ctx.fillStyle = '#6f8178'
        ctx.font = '7px "DM Mono", monospace'
        ctx.fillText('VULKAN 1.3 PASS', centerX, centerY + 8)
        ctx.textAlign = 'left'
      }

      // ==========================================
      // 6. PLAYABLE GAME: VECTOR DEFENDER
      // ==========================================
      else if (mode === 'defender') {
        const game = defenderRef.current

        // Smooth ship follow
        game.ship.x += (mousePosRef.current.rawX - game.ship.x) * 0.15
        game.ship.y += (mousePosRef.current.rawY - game.ship.y) * 0.15
        game.ship.x = Math.max(20, Math.min(width - 20, game.ship.x))
        game.ship.y = Math.max(40, Math.min(height - 20, game.ship.y))

        // Ship Thruster Particles
        if (Math.random() > 0.3) {
          game.sparks.push({
            x: game.ship.x + (Math.random() - 0.5) * 6,
            y: game.ship.y + 15,
            vx: (Math.random() - 0.5) * 1.5,
            vy: Math.random() * 2 + 2,
            alpha: 0.8,
            color: '#c4f13b',
          })
        }

        // Spawn Enemies
        if (currentTime - game.lastSpawn > 900) {
          game.lastSpawn = currentTime
          const spawnSide = Math.random() > 0.5
          game.enemies.push({
            x: spawnSide ? Math.random() * width : Math.random() > 0.5 ? 10 : width - 10,
            y: -15,
            vx: (Math.random() - 0.5) * 1.4,
            vy: Math.random() * 1.6 + 1.2,
            r: Math.random() * 8 + 14,
            sides: Math.floor(Math.random() * 3) + 4,
            angle: 0,
            rotSpeed: (Math.random() - 0.5) * 2,
          })
        }

        // Update Lasers
        for (let i = game.lasers.length - 1; i >= 0; i--) {
          const l = game.lasers[i]
          l.y += l.vy * dt * 60
          if (l.y < -20) {
            game.lasers.splice(i, 1)
          } else {
            // Draw Laser Beam
            ctx.strokeStyle = '#00e5ff'
            ctx.shadowColor = '#00e5ff'
            ctx.shadowBlur = 8
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.moveTo(l.x, l.y)
            ctx.lineTo(l.x, l.y - 14)
            ctx.stroke()
          }
        }

        // Update Enemies & Collision
        for (let eIdx = game.enemies.length - 1; eIdx >= 0; eIdx--) {
          const en = game.enemies[eIdx]
          en.x += en.vx * dt * 60
          en.y += en.vy * dt * 60
          en.angle += en.rotSpeed * dt

          // Check laser collisions
          let hit = false
          for (let lIdx = game.lasers.length - 1; lIdx >= 0; lIdx--) {
            const l = game.lasers[lIdx]
            const dist = Math.hypot(l.x - en.x, l.y - en.y)
            if (dist < en.r + 4) {
              hit = true
              game.lasers.splice(lIdx, 1)
              break
            }
          }

          if (hit) {
            // Explosion debris
            game.screenShake = 1.2
            gameAudio.playExplosion()
            game.score += 100 * game.combo
            game.kills += 1
            game.combo = Math.min(game.combo + 1, 8)
            setGameScore(game.score)
            setGameKills(game.kills)
            setGameCombo(game.combo)

            for (let s = 0; s < 12; s++) {
              const spAngle = (s / 12) * Math.PI * 2
              const spSpd = Math.random() * 3 + 2
              game.sparks.push({
                x: en.x,
                y: en.y,
                vx: Math.cos(spAngle) * spSpd,
                vy: Math.sin(spAngle) * spSpd,
                alpha: 1,
                color: Math.random() > 0.5 ? '#ff758a' : '#c4f13b',
              })
            }
            game.enemies.splice(eIdx, 1)
            continue
          }

          if (en.y > height + 30) {
            game.enemies.splice(eIdx, 1)
            game.combo = 1
            setGameCombo(1)
            continue
          }

          // Draw Enemy Polygon
          ctx.strokeStyle = '#ff758a'
          ctx.lineWidth = 1.8
          ctx.shadowColor = '#ff758a'
          ctx.shadowBlur = 6
          ctx.beginPath()
          for (let a = 0; a < en.sides; a++) {
            const th = en.angle + (a / en.sides) * Math.PI * 2
            const px = en.x + Math.cos(th) * en.r
            const py = en.y + Math.sin(th) * en.r
            if (a === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.closePath()
          ctx.stroke()
        }

        // Draw Player Fighter Ship
        const sx = game.ship.x
        const sy = game.ship.y
        ctx.strokeStyle = '#c4f13b'
        ctx.lineWidth = 2.2
        ctx.shadowColor = '#c4f13b'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.moveTo(sx, sy - 16)
        ctx.lineTo(sx - 13, sy + 13)
        ctx.lineTo(sx, sy + 7)
        ctx.lineTo(sx + 13, sy + 13)
        ctx.closePath()
        ctx.stroke()

        // Cockpit
        ctx.fillStyle = '#00e5ff'
        ctx.beginPath()
        ctx.arc(sx, sy - 3, 3, 0, Math.PI * 2)
        ctx.fill()

        // In-Canvas Instructions & HUD
        ctx.fillStyle = 'rgba(236, 242, 237, 0.7)'
        ctx.font = '700 9px "DM Mono", monospace'
        ctx.fillText(`CLICK TO FIRE // SCORE: ${game.score} // KILLS: ${game.kills} // COMBO: x${game.combo}`, 20, 26)
      }

      // ==========================================
      // 7. PLAYABLE GAME: CYBER BREAKOUT
      // ==========================================
      else if (mode === 'breakout') {
        const game = breakoutRef.current

        // Paddle follows mouse X
        game.paddleX += (mousePosRef.current.rawX - game.paddleX) * 0.2
        game.paddleX = Math.max(game.paddleW / 2 + 10, Math.min(width - game.paddleW / 2 - 10, game.paddleX))
        const paddleY = height - 28

        // Update Ball
        if (game.ball.active) {
          game.ball.x += game.ball.vx * dt * 60
          game.ball.y += game.ball.vy * dt * 60

          // Wall bounce
          if (game.ball.x < 12) {
            game.ball.x = 12
            game.ball.vx *= -1
            gameAudio.playClick()
          } else if (game.ball.x > width - 12) {
            game.ball.x = width - 12
            game.ball.vx *= -1
            gameAudio.playClick()
          }
          if (game.ball.y < 12) {
            game.ball.y = 12
            game.ball.vy *= -1
            gameAudio.playClick()
          }

          // Paddle bounce
          if (
            game.ball.y + game.ball.r >= paddleY - game.paddleH / 2 &&
            game.ball.y - game.ball.r <= paddleY + game.paddleH / 2 &&
            game.ball.x >= game.paddleX - game.paddleW / 2 - 5 &&
            game.ball.x <= game.paddleX + game.paddleW / 2 + 5 &&
            game.ball.vy > 0
          ) {
            game.ball.vy *= -1
            const hitOffset = (game.ball.x - game.paddleX) / (game.paddleW / 2)
            game.ball.vx = hitOffset * 4.2
            gameAudio.playClick()
          }

          // Bottom reset
          if (game.ball.y > height + 20) {
            game.ball.x = game.paddleX
            game.ball.y = paddleY - 20
            game.ball.vy = -3.2
            game.ball.vx = (Math.random() - 0.5) * 4
          }

          // Brick collision
          let aliveCount = 0
          game.bricks.forEach((b) => {
            if (!b.alive) return
            aliveCount++

            if (
              game.ball.x + game.ball.r >= b.x &&
              game.ball.x - game.ball.r <= b.x + b.w &&
              game.ball.y + game.ball.r >= b.y &&
              game.ball.y - game.ball.r <= b.y + b.h
            ) {
              b.alive = false
              game.ball.vy *= -1
              game.score += 50
              setGameScore(game.score)
              gameAudio.playScore()

              // Spark burst
              for (let s = 0; s < 8; s++) {
                game.sparks.push({
                  x: b.x + b.w / 2,
                  y: b.y + b.h / 2,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  alpha: 1,
                  color: b.color,
                })
              }
            }
          })

          if (aliveCount === 0) {
            resetBreakoutGame(width)
          }
        }

        // Draw Bricks
        game.bricks.forEach((b) => {
          if (!b.alive) return
          ctx.fillStyle = '#10171b'
          ctx.strokeStyle = b.color
          ctx.lineWidth = 1.5
          ctx.shadowColor = b.color
          ctx.shadowBlur = 6
          ctx.fillRect(b.x, b.y, b.w, b.h)
          ctx.strokeRect(b.x, b.y, b.w, b.h)

          ctx.fillStyle = b.color
          ctx.font = '700 8.5px "DM Mono", monospace'
          ctx.textAlign = 'center'
          ctx.fillText(b.text, b.x + b.w / 2, b.y + 14)
          ctx.textAlign = 'left'
        })

        // Draw Paddle
        ctx.fillStyle = '#c4f13b'
        ctx.shadowColor = '#c4f13b'
        ctx.shadowBlur = 10
        ctx.fillRect(
          game.paddleX - game.paddleW / 2,
          paddleY - game.paddleH / 2,
          game.paddleW,
          game.paddleH
        )

        // Draw Ball
        ctx.fillStyle = '#00e5ff'
        ctx.shadowColor = '#00e5ff'
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(game.ball.x, game.ball.y, game.ball.r, 0, Math.PI * 2)
        ctx.fill()

        // Ball trail particle
        game.sparks.push({
          x: game.ball.x,
          y: game.ball.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          alpha: 0.6,
          color: '#00e5ff',
          size: 2.5,
        })

        // Breakout In-Canvas HUD
        ctx.fillStyle = 'rgba(236, 242, 237, 0.7)'
        ctx.font = '700 9px "DM Mono", monospace'
        ctx.fillText(`CYBER BREAKOUT // SCORE: ${game.score} // MOUSE TO STEER PADDLE`, 20, 24)
      }

      // Update Shared Game Sparks
      const activeSparks =
        mode === 'defender'
          ? defenderRef.current.sparks
          : mode === 'breakout'
            ? breakoutRef.current.sparks
            : []

      for (let sIdx = activeSparks.length - 1; sIdx >= 0; sIdx--) {
        const s = activeSparks[sIdx]
        s.x += s.vx * dt * 60
        s.y += s.vy * dt * 60
        s.alpha -= dt * 2.2
        if (s.alpha <= 0) {
          activeSparks.splice(sIdx, 1)
        } else {
          ctx.fillStyle = s.color
          ctx.globalAlpha = Math.max(0, s.alpha)
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.size || 2, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }

      ctx.restore()
      animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
    }
  }, [mode])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mousePosRef.current.rawX = e.clientX - rect.left
    mousePosRef.current.rawY = e.clientY - rect.top
    mousePosRef.current.targetX = e.clientX - rect.left - rect.width / 2
    mousePosRef.current.targetY = e.clientY - rect.top - rect.height / 2
  }

  const handleMouseLeave = () => {
    mousePosRef.current.targetX = 0
    mousePosRef.current.targetY = 0
    mousePosRef.current.isDown = false
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (mode === 'defender') {
      // Fire twin lasers from player ship
      const ship = defenderRef.current.ship
      defenderRef.current.lasers.push(
        { x: ship.x - 8, y: ship.y - 12, vy: -7 },
        { x: ship.x + 8, y: ship.y - 12, vy: -7 }
      )
      gameAudio.playLaser()
    } else if (mode === 'breakout') {
      if (!breakoutRef.current.ball.active) {
        breakoutRef.current.ball.active = true
      }
      gameAudio.playClick()
    } else {
      pulseRef.current.push({ x, y, r: 5, alpha: 1 })
      gameAudio.playClick()
    }
  }

  const switchMode = (newMode: RenderMode) => {
    setMode(newMode)
    gameAudio.playClick()
    if (newMode === 'wireframe') {
      setDrawCalls(14)
      setVerticesCount(12480)
    } else if (newMode === 'particles') {
      setDrawCalls(2)
      setVerticesCount(32768)
    } else if (newMode === 'terrain') {
      setDrawCalls(36)
      setVerticesCount(18500)
    } else if (newMode === 'audio') {
      setDrawCalls(32)
      setVerticesCount(8400)
    } else if (newMode === 'pipeline') {
      setDrawCalls(18)
      setVerticesCount(48290)
    } else if (newMode === 'defender') {
      setDrawCalls(24)
      setVerticesCount(9600)
      resetDefenderGame()
    } else if (newMode === 'breakout') {
      setDrawCalls(16)
      setVerticesCount(7200)
      if (canvasRef.current) {
        resetBreakoutGame(canvasRef.current.clientWidth)
      }
    }
  }

  const isGameMode = mode === 'defender' || mode === 'breakout'
  const currentModeMeta = MODES.find((m) => m.id === mode) || MODES[0]

  const cycleMode = (direction: 1 | -1) => {
    const currentIndex = MODES.findIndex((m) => m.id === mode)
    const nextIndex = (currentIndex + direction + MODES.length) % MODES.length
    switchMode(MODES[nextIndex].id)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  return (
    <div
      className="engine-viewport-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-label={isGameMode ? 'GAME // ACTION' : 'VIEWPORT // INTERACT'}
    >
      {/* Top Telemetry Header Bar */}
      <div className="engine-telemetry-bar">
        <div className="telemetry-item live-indicator">
          <span className="telemetry-dot" />
          <span className="telemetry-label font-mono">
            {isGameMode ? `ARCADE // ${mode.toUpperCase()}` : `${currentModeMeta.tag} // LIVE`}
          </span>
        </div>

        <div className="telemetry-item">
          <span className="telemetry-muted">FPS:</span>
          <span className="telemetry-val font-mono">{fps}</span>
        </div>

        {isGameMode ? (
          <>
            <div className="telemetry-item">
              <span className="telemetry-muted">SCORE:</span>
              <span className="telemetry-val font-mono">{gameScore}</span>
            </div>
            {mode === 'defender' && (
              <>
                <div className="telemetry-item hide-mobile">
                  <span className="telemetry-muted">KILLS:</span>
                  <span className="telemetry-val font-mono">{gameKills}</span>
                </div>
                <div className="telemetry-item hide-mobile">
                  <span className="telemetry-muted">COMBO:</span>
                  <span className="telemetry-val font-mono">x{gameCombo}</span>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="telemetry-item hide-mobile">
              <span className="telemetry-muted">CALLS:</span>
              <span className="telemetry-val font-mono">{drawCalls}</span>
            </div>
            <div className="telemetry-item hide-mobile">
              <span className="telemetry-muted">VERTS:</span>
              <span className="telemetry-val font-mono">{verticesCount.toLocaleString()}</span>
            </div>
          </>
        )}
      </div>

      {/* Canvas Viewport */}
      <div className="engine-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="engine-canvas"
          onClick={handleCanvasClick}
          title={isGameMode ? 'Click to shoot or play' : 'Click to emit pulse'}
        />
      </div>

      {/* Bottom Mode Switcher & Tactical HUD Dropdown */}
      <div className="engine-bottom-bar">
        {/* Mode Dropdown Selector */}
        <div className="engine-dropdown-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`engine-dropdown-trigger ${isGameMode ? 'is-game' : ''}`}
            onClick={() => {
              setIsDropdownOpen((prev) => !prev)
              gameAudio.playClick()
            }}
            data-cursor-label="SWITCH // STAGE"
            aria-expanded={isDropdownOpen}
          >
            <span className="engine-trigger-tag">{isGameMode ? 'GAME' : 'STAGE'}:</span>
            <span className="engine-trigger-name">{currentModeMeta.tag}</span>
            <ChevronUp size={13} className={`engine-chevron ${isDropdownOpen ? 'open' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="engine-dropdown-menu" role="menu">
              <div className="engine-dropdown-header">
                <span>// SELECT VIEWPORT STAGE</span>
                <span className="engine-mode-counter">{MODES.length} MODES</span>
              </div>

              <div className="engine-dropdown-scroll">
                <div className="engine-menu-group-header">
                  <Eye size={11} /> VISUALIZERS (5)
                </div>
                {MODES.filter((m) => m.category === 'visualizer').map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`engine-menu-item ${mode === m.id ? 'active' : ''}`}
                    onClick={() => {
                      switchMode(m.id)
                      setIsDropdownOpen(false)
                    }}
                    data-cursor-label={`STAGE // ${m.tag}`}
                  >
                    <div className="item-dot" />
                    <div className="item-meta">
                      <span className="item-name">{m.label}</span>
                      <span className="item-desc">{m.desc}</span>
                    </div>
                    {mode === m.id && <span className="item-status">ACTIVE</span>}
                  </button>
                ))}

                <div className="engine-menu-group-header game-group-header">
                  <Gamepad2 size={11} /> PLAYABLE ARCADE GAMES (2)
                </div>
                {MODES.filter((m) => m.category === 'game').map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`engine-menu-item game-item ${mode === m.id ? 'active' : ''}`}
                    onClick={() => {
                      switchMode(m.id)
                      setIsDropdownOpen(false)
                    }}
                    data-cursor-label={`PLAY // ${m.tag}`}
                  >
                    <div className="item-dot game-dot" />
                    <div className="item-meta">
                      <span className="item-name">{m.label}</span>
                      <span className="item-desc">{m.desc}</span>
                    </div>
                    {mode === m.id && <span className="item-status game-status">ACTIVE</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Cycle Nav */}
        <div className="engine-quick-cycle">
          <button
            type="button"
            className="cycle-arrow-btn"
            onClick={() => cycleMode(-1)}
            title="Previous stage"
            data-cursor-label="PREV STAGE"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="cycle-index">
            {MODES.findIndex((m) => m.id === mode) + 1}/{MODES.length}
          </span>
          <button
            type="button"
            className="cycle-arrow-btn"
            onClick={() => cycleMode(1)}
            title="Next stage"
            data-cursor-label="NEXT STAGE"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Right Side: Game Action or Tech Spec */}
        <div className="engine-bottom-actions">
          {isGameMode ? (
            <button
              type="button"
              className="telemetry-restart-btn"
              onClick={() => {
                if (mode === 'defender') resetDefenderGame()
                else if (canvasRef.current) resetBreakoutGame(canvasRef.current.clientWidth)
                gameAudio.playClick()
              }}
              data-cursor-label="RESTART GAME"
            >
              <RotateCcw size={10} /> RESTART
            </button>
          ) : (
            <span className="engine-stage-tag hide-mobile">RHI // VK 1.3</span>
          )}
        </div>
      </div>
    </div>
  )
}
