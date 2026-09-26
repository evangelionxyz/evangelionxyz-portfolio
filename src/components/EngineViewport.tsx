import React, { useEffect, useRef, useState } from 'react'
import { gameAudio } from '../utils/audio'

type RenderMode = 'wireframe' | 'particles' | 'pipeline'

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

export const EngineViewport: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [mode, setMode] = useState<RenderMode>('wireframe')
  const [fps, setFps] = useState(60)
  const [drawCalls, setDrawCalls] = useState(14)
  const [verticesCount, setVerticesCount] = useState(12480)
  const mousePosRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, rawX: 0, rawY: 0 })
  const pulseRef = useRef<{ x: number; y: number; r: number; alpha: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let lastTime = performance.now()
    let frameCount = 0
    let fpsTimer = performance.now()

    // Resize canvas to match display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Setup 3D vertices for Wireframe mode (Icosahedron / Polyhedron)
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

    // Edges connecting vertices
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
    const numParticles = 140
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * 360,
      y: (Math.random() - 0.5) * 360,
      z: (Math.random() - 0.5) * 360,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      vz: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1.2,
      color: Math.random() > 0.35 ? '#c4f13b' : '#00e5ff',
    }))

    let rotX = 0.4
    let rotY = 0.4
    let angle = 0

    const render = (currentTime: number) => {
      frameCount++
      if (currentTime - fpsTimer >= 500) {
        const calculatedFps = Math.round((frameCount * 1000) / (currentTime - fpsTimer))
        setFps(calculatedFps)
        frameCount = 0
        fpsTimer = currentTime
      }
      const dt = (currentTime - lastTime) / 1000
      lastTime = currentTime

      const width = canvas.clientWidth
      const height = canvas.clientHeight
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      // Smooth mouse follow
      mousePosRef.current.x += (mousePosRef.current.targetX - mousePosRef.current.x) * 0.08
      mousePosRef.current.y += (mousePosRef.current.targetY - mousePosRef.current.y) * 0.08

      // Background High-Tech Grid
      ctx.save()
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
      ctx.strokeStyle = 'rgba(196, 241, 59, 0.12)'
      ctx.beginPath()
      ctx.arc(centerX, centerY, 130, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()

      // Update Shockwaves
      for (let i = pulseRef.current.length - 1; i >= 0; i--) {
        const p = pulseRef.current[i]
        p.r += 140 * dt
        p.alpha -= 1.2 * dt
        if (p.alpha <= 0) {
          pulseRef.current.splice(i, 1)
        } else {
          ctx.save()
          ctx.strokeStyle = `rgba(196, 241, 59, ${p.alpha})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
          ctx.stroke()
          ctx.restore()
        }
      }

      if (mode === 'wireframe') {
        // Continuous 3D rotation modulated by mouse
        angle += 0.8 * dt
        rotX = 0.2 + mousePosRef.current.y * 0.002
        rotY = angle + mousePosRef.current.x * 0.003

        const cosX = Math.cos(rotX)
        const sinX = Math.sin(rotX)
        const cosY = Math.cos(rotY)
        const sinY = Math.sin(rotY)

        // Project vertices
        const projected = baseVertices.map((v) => {
          // Rotate Y
          const x1 = v.x * cosY - v.z * sinY
          const z1 = v.x * sinY + v.z * cosY
          // Rotate X
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
        ctx.save()
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
        ctx.restore()
      } else if (mode === 'particles') {
        // Compute simulation
        const targetX = centerX + mousePosRef.current.x * 0.4
        const targetY = centerY + mousePosRef.current.y * 0.4

        ctx.save()
        particles.forEach((p) => {
          const dx = targetX - (centerX + p.x)
          const dy = targetY - (centerY + p.y)
          const dist = Math.hypot(dx, dy) + 0.1
          const force = 35 / (dist + 50)

          p.vx += (dx / dist) * force
          p.vy += (dy / dist) * force

          // Drag / damping
          p.vx *= 0.96
          p.vy *= 0.96

          p.x += p.vx
          p.y += p.vy

          // Bounds wrap
          if (p.x < -190) p.x = 190
          if (p.x > 190) p.x = -190
          if (p.y < -190) p.y = 190
          if (p.y > 190) p.y = -190

          const px = centerX + p.x
          const py = centerY + p.y

          if (dist < 85) {
            ctx.strokeStyle = 'rgba(196, 241, 59, 0.28)'
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
        ctx.restore()
      } else if (mode === 'pipeline') {
        // Interactive GPU Render Graph / Pipeline Flow Renderer
        const nodes: PipelineNode[] = [
          {
            id: 'gbuffer',
            name: '01 // GBUFFER PASS',
            stage: 'VK_PIPELINE_BIND_POINT_GRAPHICS',
            spec: '14 DRAW CALLS · MRT ALBEDO/NORM/DEPTH',
            x: 28,
            y: centerY - 130,
            w: 195,
            h: 56,
            color: '#c4f13b',
          },
          {
            id: 'cull',
            name: '02 // COMPUTE CULL',
            stage: 'VK_SHADER_STAGE_COMPUTE_BIT',
            spec: 'HZB OCCLUSION · 32,768 INSTANCES',
            x: width - 223,
            y: centerY - 80,
            w: 195,
            h: 56,
            color: '#00e5ff',
          },
          {
            id: 'light',
            name: '03 // CLUSTER LIGHTING',
            stage: 'VK_DESCRIPTOR_TYPE_STORAGE_BUFFER',
            spec: 'FROXEL GRID 16x8x24 · SPIR-V REFLECT',
            x: 35,
            y: centerY + 10,
            w: 200,
            h: 56,
            color: '#ff758a',
          },
          {
            id: 'post',
            name: '04 // PRESENT SWAPCHAIN',
            stage: 'VK_IMAGE_LAYOUT_PRESENT_SRC_KHR',
            spec: 'TAA + BLOOM · HDR10 FRAMEBUFFER',
            x: width - 225,
            y: centerY + 70,
            w: 195,
            h: 56,
            color: '#c4f13b',
          },
        ]

        // Connect nodes with animated bus lanes
        ctx.save()
        for (let i = 0; i < nodes.length - 1; i++) {
          const from = nodes[i]
          const to = nodes[i + 1]
          const x1 = from.x + from.w / 2
          const y1 = from.y + from.h / 2
          const x2 = to.x + to.w / 2
          const y2 = to.y + to.h / 2

          // Wire
          ctx.strokeStyle = 'rgba(43, 57, 56, 0.7)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.bezierCurveTo(centerX, y1, centerX, y2, x2, y2)
          ctx.stroke()

          // Animated energy pulse traveling on bus lane
          const t = (currentTime * 0.0012 + i * 0.3) % 1
          const pulseX = (1 - t) * (1 - t) * (1 - t) * x1 + 3 * (1 - t) * (1 - t) * t * centerX + 3 * (1 - t) * t * t * centerX + t * t * t * x2
          const pulseY = (1 - t) * (1 - t) * (1 - t) * y1 + 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t * y2

          ctx.fillStyle = from.color
          ctx.shadowColor = from.color
          ctx.shadowBlur = 8
          ctx.beginPath()
          ctx.arc(pulseX, pulseY, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw nodes
        const mouseX = mousePosRef.current.rawX
        const mouseY = mousePosRef.current.rawY

        nodes.forEach((n) => {
          const isHovered = mouseX >= n.x && mouseX <= n.x + n.w && mouseY >= n.y && mouseY <= n.y + n.h

          // Box
          ctx.fillStyle = isHovered ? '#152125' : '#10171b'
          ctx.strokeStyle = isHovered ? n.color : 'rgba(43, 57, 56, 0.8)'
          ctx.lineWidth = isHovered ? 2 : 1
          ctx.shadowColor = isHovered ? n.color : 'transparent'
          ctx.shadowBlur = isHovered ? 12 : 0

          ctx.fillRect(n.x, n.y, n.w, n.h)
          ctx.strokeRect(n.x, n.y, n.w, n.h)

          // Header
          ctx.fillStyle = isHovered ? n.color : '#ecf2ed'
          ctx.font = '700 10px "DM Mono", monospace'
          ctx.fillText(n.name, n.x + 10, n.y + 18)

          // Subtitle
          ctx.fillStyle = '#6f8178'
          ctx.font = '8px "DM Mono", monospace'
          ctx.fillText(n.stage, n.x + 10, n.y + 32)

          // Spec
          ctx.fillStyle = '#a8b6ae'
          ctx.font = '8px "DM Mono", monospace'
          ctx.fillText(n.spec, n.x + 10, n.y + 46)
        })

        // Center telemetry core ring
        ctx.strokeStyle = 'rgba(196, 241, 59, 0.25)'
        ctx.beginPath()
        ctx.arc(centerX, centerY, 52, 0, Math.PI * 2)
        ctx.stroke()
        ctx.fillStyle = '#c4f13b'
        ctx.font = '700 9px "DM Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('RENDER GRAPH', centerX, centerY - 5)
        ctx.fillStyle = '#6f8178'
        ctx.font = '8px "DM Mono", monospace'
        ctx.fillText('VULKAN 1.3 PASS', centerX, centerY + 10)
        ctx.textAlign = 'left'

        ctx.restore()
      }

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
    mousePosRef.current.rawX = -100
    mousePosRef.current.rawY = -100
    mousePosRef.current.targetX = 0
    mousePosRef.current.targetY = 0
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    pulseRef.current.push({ x, y, r: 5, alpha: 1 })
    gameAudio.playClick()
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
    } else {
      setDrawCalls(18)
      setVerticesCount(48290)
    }
  }

  return (
    <div
      className="engine-viewport-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor-label="VIEWPORT // INTERACT"
    >
      {/* Top Telemetry Header Bar */}
      <div className="engine-telemetry-bar">
        <div className="telemetry-item live-indicator">
          <span className="telemetry-dot" />
          <span className="telemetry-label">
            {mode === 'wireframe' ? 'MESH_RENDERER' : mode === 'particles' ? 'COMPUTE_KERNEL' : 'RENDER_GRAPH'} // ACTIVE
          </span>
        </div>
        <div className="telemetry-item">
          <span className="telemetry-muted">FPS:</span>
          <span className="telemetry-val font-mono">{fps}</span>
        </div>
        <div className="telemetry-item hide-mobile">
          <span className="telemetry-muted">CALLS:</span>
          <span className="telemetry-val font-mono">{drawCalls}</span>
        </div>
        <div className="telemetry-item hide-mobile">
          <span className="telemetry-muted">VERTS:</span>
          <span className="telemetry-val font-mono">{verticesCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Canvas Viewport (100% Procedural Graphics) */}
      <div className="engine-canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="engine-canvas"
          onClick={handleCanvasClick}
          title="Click to emit pulse"
        />
      </div>

      {/* Bottom Mode Switcher & Viewport Specs */}
      <div className="engine-bottom-bar">
        <div className="engine-mode-toggles">
          <button
            type="button"
            className={`engine-mode-btn ${mode === 'wireframe' ? 'active' : ''}`}
            onClick={() => switchMode('wireframe')}
            data-cursor-label="3D // WIREFRAME"
          >
            [3D MESH]
          </button>
          <button
            type="button"
            className={`engine-mode-btn ${mode === 'particles' ? 'active' : ''}`}
            onClick={() => switchMode('particles')}
            data-cursor-label="COMPUTE // PARTICLES"
          >
            [COMPUTE]
          </button>
          <button
            type="button"
            className={`engine-mode-btn ${mode === 'pipeline' ? 'active' : ''}`}
            onClick={() => switchMode('pipeline')}
            data-cursor-label="GRAPH // PIPELINE"
          >
            [RENDER GRAPH]
          </button>
        </div>
        <div className="engine-spec-readout">
          <span>RHI: VULKAN 1.3 / D3D12</span>
        </div>
      </div>
    </div>
  )
}
