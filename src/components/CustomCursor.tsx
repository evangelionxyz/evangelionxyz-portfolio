import React, { useEffect, useState } from 'react'
import { gameAudio } from '../utils/audio'

interface CustomCursorProps {
  cursorActive: boolean
  soundActive: boolean
  onToggleSound: () => void
  onToggleCursor: () => void
}

export const CustomCursor: React.FC<CustomCursorProps> = ({
  cursorActive,
}) => {
  const [coords, setCoords] = useState({ x: -100, y: -100 })
  const [isHovered, setIsHovered] = useState(false)
  const [targetLabel, setTargetLabel] = useState<string>('')
  const [isClicking, setIsClicking] = useState(false)
  const [isTouch] = useState(() => {
    if (typeof window === 'undefined') return false
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(pointer: coarse)').matches
    )
  })

  useEffect(() => {
    if (isTouch) return

    const onMouseMove = (e: MouseEvent) => {
      setCoords({ x: e.clientX, y: e.clientY })

      // Detect hover on interactive items
      const target = e.target as HTMLElement | null
      const interactive = target?.closest(
        'a, button, [role="button"], .project-card, .tech-card, .capability, input'
      )
      if (interactive) {
        if (!isHovered) {
          gameAudio.playHover()
        }
        setIsHovered(true)

        // Custom label or generic target lock
        const explicit = interactive.getAttribute('data-cursor-label')
        if (explicit) {
          setTargetLabel(explicit)
        } else if (interactive.tagName === 'A') {
          setTargetLabel('NAVIGATE')
        } else if (interactive.tagName === 'BUTTON') {
          setTargetLabel('EXECUTE')
        } else if (interactive.classList.contains('project-card')) {
          setTargetLabel('SYSTEM // REPO')
        } else if (interactive.classList.contains('tech-card')) {
          setTargetLabel('INSPECT // API')
        } else {
          setTargetLabel('LOCK')
        }
      } else {
        setIsHovered(false)
        setTargetLabel('')
      }
    }

    const onMouseDown = () => {
      setIsClicking(true)
      gameAudio.playClick()
    }

    const onMouseUp = () => {
      setIsClicking(false)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isHovered, isTouch])

  if (isTouch || !cursorActive) return null

  const x = Math.round(coords.x)
  const y = Math.round(coords.y)

  return (
    <div
      className={`hud-cursor-wrapper ${isHovered ? 'hovered' : ''} ${isClicking ? 'clicking' : ''}`}
      style={{
        transform: `translate3d(${coords.x}px, ${coords.y}px, 0)`,
      }}
      aria-hidden="true"
    >
      {/* Center Reticle Point */}
      <div className="hud-cursor-dot" />

      {/* Target Crosshairs / HUD Brackets */}
      <div className="hud-cursor-crosshair">
        <span className="bracket tl" />
        <span className="bracket tr" />
        <span className="bracket bl" />
        <span className="bracket br" />
        <span className="reticle-line h" />
        <span className="reticle-line v" />
      </div>

      {/* Dynamic Telemetry Coordinates Readout */}
      <div className="hud-cursor-telemetry">
        <span className="coord-text">
          {isHovered ? `[${targetLabel}]` : `${x.toString().padStart(4, '0')}:${y.toString().padStart(4, '0')}`}
        </span>
      </div>
    </div>
  )
}
