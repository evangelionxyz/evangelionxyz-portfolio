import React from 'react'

export interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

/**
 * Custom Geometric Brand Logo for Evangelion Manuhutu
 * Combines stylized "E" monogram, isometric engine core, and graphics primitives.
 */
export function EvangelionLogo({ size = 32, className = '', ...props }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`evangelion-brand-logo ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="eva-lime-grad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d9ff55" />
          <stop offset="100%" stopColor="#a6d918" />
        </linearGradient>
        <linearGradient id="eva-cyan-grad" x1="10" y1="110" x2="110" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00b0ff" />
          <stop offset="100%" stopColor="#00e5ff" />
        </linearGradient>
        <linearGradient id="eva-accent-grad" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#d9ff55" />
          <stop offset="100%" stopColor="#a6d918" />
        </linearGradient>
        <filter id="eva-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Hexagonal Shield / Engine Frame */}
      <path
        d="M60 6L108 34V86L60 114L12 86V34L60 6Z"
        fill="#080b0e"
        stroke="#2b3938"
        strokeWidth="3"
      />

      {/* Cybernetic Grid Sub-Facet Lines */}
      <path d="M60 6V60M108 34L60 60M12 34L60 60M60 60L60 114M60 60L108 86M60 60L12 86" stroke="#18252a" strokeWidth="2" strokeDasharray="3 3" />

      {/* Top Arm of "E" (Isometric Polished Slab) */}
      <path
        d="M26 36L60 17L94 36L78 45L60 35L42 45L26 36Z"
        fill="url(#eva-lime-grad)"
        filter="url(#eva-glow)"
      />

      {/* Middle Core Bar of "E" (Cyan / Laser Precision Core) */}
      <path
        d="M34 56L60 41L86 56L72 64L60 57L48 64L34 56Z"
        fill="url(#eva-cyan-grad)"
      />

      {/* Lower Base Plate of "E" (Deep Pink Accent / Anchor Slab) */}
      <path
        d="M26 76L60 57L94 76L78 85L60 75L42 85L26 76Z"
        fill="url(#eva-accent-grad)"
      />

      {/* Vertical Spine Linking the Letter "E" */}
      <path
        d="M26 36L42 45V85L26 76V36Z"
        fill="#c4f13b"
      />

      {/* Central Vertex Node / Engine Spark */}
      <circle cx="60" cy="60" r="5" fill="#ffffff" filter="url(#eva-glow)" />
      <circle cx="60" cy="60" r="2.5" fill="#080b0e" />
    </svg>
  )
}
