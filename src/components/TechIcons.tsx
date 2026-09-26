import React from 'react'

import bunSvg from '../assets/bun.svg'
import cppSvg from '../assets/cpp.svg'
import csharpSvg from '../assets/csharp.svg'
import directxSvg from '../assets/directx.svg'
import dockerSvg from '../assets/docker.svg'
import dotnetSvg from '../assets/dotnet.svg'
import flutterSvg from '../assets/flutter.svg'
import kotlinSvg from '../assets/kotlin.svg'
import pythonSvg from '../assets/python.svg'
import rustSvg from '../assets/rust.svg'
import typescriptSvg from '../assets/typescript.svg'
import vulkanSvg from '../assets/vulkan.svg'

export interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: number | string
  className?: string
}

export interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

interface AssetIconProps extends IconProps {
  src: string
  defaultAlt: string
  aspectRatio?: number
}

function AssetIcon({
  src,
  defaultAlt,
  aspectRatio = 1,
  size = 20,
  className = '',
  style,
  alt = defaultAlt,
  ...props
}: AssetIconProps) {
  const s = typeof size === 'number' ? `${size}px` : size
  const maxWidth =
    aspectRatio > 1 && typeof size === 'number' ? `${size * aspectRatio}px` : undefined

  return (
    <img
      src={src}
      alt={alt}
      className={`tech-icon-img ${className}`}
      style={{
        height: s,
        width: aspectRatio === 1 ? s : 'auto',
        maxWidth: maxWidth || (aspectRatio === 1 ? s : '100%'),
        objectFit: 'contain',
        verticalAlign: 'middle',
        display: 'inline-block',
        flexShrink: 0,
        ...style,
      }}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

// User-provided SVG icons from assets
export function RustIcon(props: IconProps) {
  return <AssetIcon src={rustSvg} defaultAlt="Rust" {...props} />
}

export function CppIcon(props: IconProps) {
  return <AssetIcon src={cppSvg} defaultAlt="C++" {...props} />
}

export function VulkanIcon(props: IconProps) {
  return <AssetIcon src={vulkanSvg} defaultAlt="Vulkan" aspectRatio={2.4} {...props} />
}

export function TypeScriptIcon(props: IconProps) {
  return <AssetIcon src={typescriptSvg} defaultAlt="TypeScript" {...props} />
}

export function DotNetIcon(props: IconProps) {
  return <AssetIcon src={dotnetSvg} defaultAlt=".NET" {...props} />
}

export function DirectXIcon(props: IconProps) {
  return <AssetIcon src={directxSvg} defaultAlt="DirectX" style={{filter:"invert(100%)"}} aspectRatio={2.4} {...props} />
}

export function CSharpIcon(props: IconProps) {
  return <AssetIcon src={csharpSvg} defaultAlt="C#" {...props} />
}

export function BunIcon(props: IconProps) {
  return <AssetIcon src={bunSvg} defaultAlt="Bun" {...props} />
}

export function DockerIcon(props: IconProps) {
  return <AssetIcon src={dockerSvg} defaultAlt="Docker" aspectRatio={1.2} {...props} />
}

export function PythonIcon(props: IconProps) {
  return <AssetIcon src={pythonSvg} defaultAlt="Python" {...props} />
}

export function KotlinIcon(props: IconProps) {
  return <AssetIcon src={kotlinSvg} defaultAlt="Kotlin" {...props} />
}

export function FlutterIcon(props: IconProps) {
  return <AssetIcon src={flutterSvg} defaultAlt="Flutter" {...props} />
}

// CoreCLR & Runtime / Hostfxr Icon (SVG Vector)
export function CoreClrIcon({ size = 20, className = '', ...props }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3" />
      <path d="M15 1v3" />
      <path d="M9 20v3" />
      <path d="M15 20v3" />
      <path d="M20 9h3" />
      <path d="M20 14h3" />
      <path d="M1 9h3" />
      <path d="M1 14h3" />
    </svg>
  )
}

// HLSL & GLSL Shader Pipeline Icon (SVG Vector)
export function ShaderIcon({ size = 20, className = '', ...props }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

// Linux Icon (SVG Vector)
export function LinuxIcon({ size = 20, className = '', ...props }: SvgIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fill="#FCC624"
        d="M64 4c-18 0-32 14-32 32 0 12 5 21 11 26-2 5-6 16-6 26 0 15 12 28 27 28s27-13 27-28c0-10-4-21-6-26 6-5 11-14 11-26 0-18-14-32-32-32z"
      />
      <circle cx="54" cy="30" r="5" fill="#18181B" />
      <circle cx="74" cy="30" r="5" fill="#18181B" />
      <circle cx="52" cy="28" r="1.5" fill="#FFF" />
      <circle cx="72" cy="28" r="1.5" fill="#FFF" />
      <path
        fill="#FF8000"
        d="M64 36c-5 0-9 4-9 8 0 3 3 6 9 6s9-3 9-6c0-4-4-8-9-8z"
      />
      <ellipse cx="64" cy="86" rx="18" ry="24" fill="#FFF" />
    </svg>
  )
}
