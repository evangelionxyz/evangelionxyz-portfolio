import {
  ArrowDownRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Database,
  Gamepad2,
  Layers3,
  Mail,
  Menu,
  Terminal,
  Volume2,
  VolumeX,
  X,
  Crosshair,
} from 'lucide-react'
import { useState } from 'react'
import './App.css'
import { CustomCursor } from './components/CustomCursor'
import { EngineConsole } from './components/EngineConsole'
import { EngineViewport } from './components/EngineViewport'
import { EvangelionLogo } from './components/Logo'
import { gameAudio } from './utils/audio'
import {
  BunIcon,
  CoreClrIcon,
  CppIcon,
  CSharpIcon,
  DirectXIcon,
  DockerIcon,
  DotNetIcon,
  FlutterIcon,
  KotlinIcon,
  LinuxIcon,
  PythonIcon,
  RustIcon,
  ShaderIcon,
  TypeScriptIcon,
  VulkanIcon,
} from './components/TechIcons'

const profile = {
  name: 'Evangelion Manuhutu',
  shortName: 'Evangelion',
  role: 'Systems-Oriented Software Engineer',
  institution: 'Telkom University',
  degree: 'Software Engineering',
  email: 'evangelionxyz10@gmail.com',
  github: 'https://github.com/evangelionxyz',
  linkedin: 'https://www.linkedin.com/in/evangelionxyz/',
}

function GitHubMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.588 2 12.253c0 4.53 2.865 8.371 6.839 9.728.5.096.683-.223.683-.495 0-.244-.009-.89-.014-1.747-2.782.62-3.369-1.367-3.369-1.367-.455-1.185-1.11-1.5-1.11-1.5-.908-.636.069-.623.069-.623 1.004.072 1.532 1.058 1.532 1.058.893 1.568 2.341 1.115 2.91.853.091-.665.349-1.115.635-1.371-2.221-.26-4.556-1.139-4.556-5.069 0-1.12.39-2.035 1.03-2.753-.103-.261-.447-1.306.098-2.724 0 0 .84-.276 2.75 1.052A9.3 9.3 0 0 1 12 6.401c.85.004 1.705.118 2.504.346 1.908-1.328 2.747-1.052 2.747-1.052.546 1.418.202 2.463.1 2.724.64.718 1.028 1.633 1.028 2.753 0 3.94-2.34 4.806-4.568 5.06.359.319.678.95.678 1.915 0 1.383-.012 2.5-.012 2.84 0 .275.18.596.688.494C19.137 20.62 22 16.78 22 12.253 22 6.588 17.523 2 12 2Z"
      />
    </svg>
  )
}

function LinkedInMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path
        fill="currentColor"
        d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.05 18.9H5.1V9.4h2.95v9.5ZM6.57 8.1a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.34 10.8h-2.95v-4.62c0-1.1-.02-2.51-1.53-2.51-1.53 0-1.77 1.2-1.77 2.43v4.7H9.71V9.4h2.83v1.3h.04c.39-.75 1.36-1.54 2.8-1.54 3 0 3.55 1.98 3.55 4.55v5.19Z"
      />
    </svg>
  )
}

// Telemetry Stats
const telemetryStats = [
  { label: 'Engineering Experience', value: '7+ Years', spec: 'Systems, Graphics & Web' },
  { label: 'Core Projects', value: '06 Repos', spec: 'Engines, Shaders & Runtimes' },
  { label: 'Graphics Backends', value: 'Vulkan & DX12', spec: 'Explicit GPU APIs' },
  { label: 'Engine Architecture', value: 'Ignite Engine', spec: 'Custom C++ & Archetype ECS' },
]

// Tech Stack Categories and Items with Official Icons
type TechCategory = 'all' | 'systems' | 'graphics' | 'runtimes' | 'mobile' | 'web'

interface TechItem {
  id: string
  name: string
  version: string
  category: 'systems' | 'graphics' | 'runtimes' | 'mobile' | 'web'
  categoryLabel: string
  icon: React.ComponentType<{ size?: number | string; className?: string }>
  color: string
  description: string
  usedIn: string
}

const techArsenal: TechItem[] = [
  {
    id: 'cpp',
    name: 'C++',
    version: 'C++20 / C++23',
    category: 'systems',
    categoryLabel: 'Systems Language',
    icon: CppIcon,
    color: '#00599c',
    description:
      'Custom archetype ECS, cache-aligned memory allocators, RAII hardware wrappers, SIMD math acceleration, and zero runtime heap fragmentation in hot loops.',
    usedIn: 'Ignite Engine, Umbra Compiler, MochiSharp, Ignite Server',
  },
  {
    id: 'vulkan',
    name: 'Vulkan',
    version: '1.3 Spec',
    category: 'graphics',
    categoryLabel: 'Explicit Graphics API',
    icon: VulkanIcon,
    color: '#e42326',
    description:
      'Direct GPU memory management, multi-threaded command buffer recording, descriptor sets, dynamic rendering, push constants, and SPIR-V pipeline caching.',
    usedIn: 'Ignite Engine Render Backend & Compute Shaders',
  },
  {
    id: 'dx12',
    name: 'DirectX 12',
    version: 'D3D12 Ultimate',
    category: 'graphics',
    categoryLabel: 'Hardware API',
    icon: DirectXIcon,
    color: '#00b0ff',
    description:
      'Root signatures, command lists, descriptor heaps, swapchains, fence synchronizations, and DXIL runtime pipeline execution on modern Windows hardware.',
    usedIn: 'Ignite Engine D3D12 Backend & Umbra ShaderCompiler',
  },
  {
    id: 'rust',
    name: 'Rust',
    version: 'Edition 2024',
    category: 'systems',
    categoryLabel: 'Systems Language',
    icon: RustIcon,
    color: '#dea584',
    description:
      'Memory safety without garbage collection, zero-cost concurrency, lock-free task executors, and robust systems tooling for mission-critical software.',
    usedIn: 'OpenTask Engine, CLI Automation & Systems Tooling',
  },
  {
    id: 'dotnet',
    name: '.NET & CoreCLR',
    version: '.NET 10',
    category: 'runtimes',
    categoryLabel: 'Managed Runtime & Interop',
    icon: DotNetIcon,
    color: '#512bd4',
    description:
      'Direct runtime hosting inside native C++ applications via hostfxr. Native delegate function pointers bypassing P/Invoke overhead and live hot-reloading.',
    usedIn: 'MochiSharp Runtime Bridge & High-Perf Scripting',
  },
  {
    id: 'csharp',
    name: 'C#',
    version: 'C# 14',
    category: 'runtimes',
    categoryLabel: 'Engine Scripting',
    icon: CSharpIcon,
    color: '#9b4f96',
    description:
      'Clean high-level game logic, object model scripting, native interop memory marshaling, and enterprise backend microservices.',
    usedIn: 'Ignite Engine Gameplay Scripts, MochiSharp Host',
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    version: '7.x',
    category: 'web',
    categoryLabel: 'Full-Stack Language',
    icon: TypeScriptIcon,
    color: '#3178c6',
    description:
      'End-to-end type safety, modern reactive UI architectures, rich canvas/geospatial visualizations, and robust cloud services.',
    usedIn: 'SIPERTI Malut Mining Dashboard, OpenTask UI',
  },
  {
    id: 'shaders',
    name: 'HLSL / GLSL',
    version: 'Shader Model 6.6+',
    category: 'graphics',
    categoryLabel: 'Shader Toolchains',
    icon: ShaderIcon,
    color: '#c4f13b',
    description:
      'PBR shading, clustered light culling, cascaded shadow maps, compute shader particles, and automatic compile-time reflection extraction.',
    usedIn: 'Umbra ShaderCompiler & Ignite Engine Render Pipeline',
  },
  {
    id: 'coreclr',
    name: 'hostfxr / FFI',
    version: 'Native ABI Bridge',
    category: 'runtimes',
    categoryLabel: 'Runtime Interoperability',
    icon: CoreClrIcon,
    color: '#ff758a',
    description:
      'Zero-copy memory sharing, unmanaged delegate exports, ABI stability, and foreign function interfaces between C++, C#, Rust, and WebAssembly.',
    usedIn: 'MochiSharp .NET Host & Ignite Runtime Boundary',
  },
  {
    id: 'bun',
    name: 'Bun & Node',
    version: 'v1.4+',
    category: 'web',
    categoryLabel: 'Modern Web Runtime',
    icon: BunIcon,
    color: '#fbf0df',
    description:
      'Ultra-fast JavaScript/TypeScript bundling, package management, native SQLite interop, and lightning-fast developer iteration speeds.',
    usedIn: 'OpenTask Backend, Portfolio Build Pipeline',
  },
  {
    id: 'docker',
    name: 'Docker & Linux',
    version: 'POSIX / Containers',
    category: 'systems',
    categoryLabel: 'Toolchains & DevOps',
    icon: DockerIcon,
    color: '#2496ed',
    description:
      'Deterministic cross-compilation environments, Clang/LLVM toolchains, Premake5/CMake build setups, and automated CI/CD deployment.',
    usedIn: 'Engine Multi-Platform Builds & Server Deployments',
  },
  {
    id: 'python',
    name: 'Python',
    version: '3.12+',
    category: 'web',
    categoryLabel: 'Backend & Automation',
    icon: PythonIcon,
    color: '#ffd43b',
    description:
      'Asset cooking scripts, automated shader testing pipelines, FastAPI microservices, and rapid algorithm prototyping.',
    usedIn: 'Engine Asset Pipeline & Automation Scripts',
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    version: 'Kotlin 2.0+ / KMP',
    category: 'mobile',
    categoryLabel: 'Mobile Systems & Native',
    icon: KotlinIcon,
    color: '#7f52ff',
    description: 
      'Modern Android architecture, JNI native bridge to C++ game engines, Kotlin Multiplatform (KMP), and memory-efficient mobile services.',
    usedIn: 'Hackathon Project',
  },
  {
    id: 'flutter',
    name: 'Flutter & Dart',
    version: 'Flutter 3.x',
    category: 'mobile',
    categoryLabel: 'Cross-Platform Client',
    icon: FlutterIcon,
    color: '#02569b',
    description:
      'High-framerate reactive UI rendering, Skia/Impeller hardware-accelerated pipelines, platform channels for native C++ interop, and multi-platform distribution.',
    usedIn: 'Cross-Platform Mobile Apps',
  },
]

const capabilities = [
  {
    icon: Code2,
    badge: 'C++20 / C++23',
    title: 'Low-Level Systems & Engines',
    description:
      'Architecting memory-conscious systems from first principles: custom data-oriented ECS architectures, linear and arena memory allocators, lock-free task queues, and RAII hardware resource wrappers.',
  },
  {
    icon: Layers3,
    badge: 'Vulkan 1.3 / D3D12',
    title: 'Graphics & Shader Toolchains',
    description:
      'Explicit GPU architectures: multi-threaded command recording, dynamic descriptor indexing, pipeline state disk caching, and cross-platform shader compilers producing SPIR-V and DXIL with runtime reflection.',
  },
  {
    icon: Cpu,
    badge: 'CoreCLR / hostfxr',
    title: 'Native/Managed Runtimes & FFI',
    description:
      'Bridging low-level C++ with managed ecosystems like .NET CoreCLR through hostfxr delegate pointers, zero-overhead memory boundaries, and hot-reloadable gameplay scripting assemblies.',
  },
  {
    icon: Database,
    badge: 'TypeScript / Rust / Bun',
    title: 'Full-Stack & Distributed Systems',
    description:
      'Delivering complete applications when native power needs a web or cloud interface. Production platforms with Bun, React, Rust workers, REST/WebSocket protocols, and enterprise dashboards.',
  },
]

const projects = [
  {
    name: 'Ignite Engine',
    subtitle: 'Modular C++ Game Engine & Custom Architecture',
    description:
      'A modular C++ game engine exploring multi-backend rendering (Vulkan 1.3 & DirectX 12), archetype ECS, asset compilation pipelines, physics, and editor technology.',
    tags: [
      { name: 'C++', icon: CppIcon },
      { name: 'Vulkan', icon: VulkanIcon },
      { name: 'DirectX 12', icon: DirectXIcon },
      { name: 'ECS', icon: Layers3 },
    ],
    href: 'https://github.com/evangelionxyz/IgniteEngine',
    tone: 'dark',
    featured: true,
  },
  {
    name: 'Umbra ShaderCompiler',
    subtitle: 'Cross-Platform HLSL/GLSL Compiler & Reflection Toolchain',
    description:
      'A standalone shader toolchain compiling HLSL and GLSL into SPIR-V and DXIL bytecode. Extracts reflection metadata (push constants, descriptor tables, uniforms) for zero-overhead runtime pipeline layout setup.',
    tags: [
      { name: 'C++20', icon: CppIcon },
      { name: 'HLSL / GLSL', icon: ShaderIcon },
      { name: 'SPIR-V', icon: VulkanIcon },
      { name: 'DXIL', icon: DirectXIcon },
    ],
    href: 'https://github.com/evangelionxyz/Umbra-ShaderCompiler',
    tone: 'accent',
    featured: true,
  },
  {
    name: 'MochiSharp',
    subtitle: 'High-Performance .NET CoreCLR Host for Native C++',
    description:
      'A native .NET hosting framework that embeds Microsoft CoreCLR inside native C++ applications using hostfxr, generating function pointers that bypass P/Invoke overhead with hot-reloading.',
    tags: [
      { name: 'C++', icon: CppIcon },
      { name: 'C#', icon: CSharpIcon },
      { name: '.NET', icon: DotNetIcon },
      { name: 'hostfxr', icon: CoreClrIcon },
    ],
    href: 'https://github.com/evangelionxyz/MochiSharp',
    tone: 'lime',
    featured: true,
  },
  {
    name: 'OpenTask',
    subtitle: 'All-in-One AI-Powered Project Management Platform',
    description:
      'An AI-native project management platform engineered with Rust, TypeScript, and Bun for maximum concurrency and developer productivity.',
    tags: [
      { name: 'Rust', icon: RustIcon },
      { name: 'TypeScript', icon: TypeScriptIcon },
      { name: 'Bun', icon: BunIcon },
    ],
    href: 'https://github.com/Offside-Software/OpenTask',
    liveUrl: 'https://open-task-five.vercel.app/',
    tone: 'paper',
    featured: false,
  },
  {
    name: 'SIPERTI Malut',
    subtitle: 'Mining Permissions Management & Geospatial Dashboard',
    description:
      'An enterprise application for North Maluku Mining Permissions Management and Public Visualization, built with TypeScript, modern component architecture, and cloud deployment.',
    tags: [
      { name: 'TypeScript', icon: TypeScriptIcon },
      { name: 'Product', icon: Database },
      { name: 'Bun', icon: BunIcon },
    ],
    href: 'https://github.com/evangelionxyz/siperti-malut',
    liveUrl: 'https://siperti-mu.vercel.app/',
    tone: 'paper',
    featured: false,
  },
  {
    name: 'Ignite Server',
    subtitle: 'Real-Time Game Networking Companion',
    description:
      'A companion server project in the Ignite ecosystem built on Valve’s GameNetworkingSockets, exploring low-latency UDP transport, client prediction, and binary state replication.',
    tags: [
      { name: 'C++', icon: CppIcon },
      { name: 'Networking', icon: Terminal },
      { name: 'Linux', icon: LinuxIcon },
    ],
    href: 'https://github.com/evangelionxyz/Ignite-Server',
    tone: 'dark',
    featured: false,
  },
]

const engineeringPillars = [
  {
    number: '01',
    title: 'Mechanical Sympathy',
    body: 'Software runs on silicon. Cache hierarchies, memory alignment, branch predictability, and memory bandwidth dictate real-world latency far more than syntax abstractions.',
  },
  {
    number: '02',
    title: 'Abstractions Must Pay Rent',
    body: 'Clean code should never disguise hidden allocations or dynamic dispatch in hot loops. Zero-cost abstractions mean you only pay for what you explicitly request.',
  },
  {
    number: '03',
    title: 'Full-Stack Cohesion',
    body: 'Systems mastery combined with visual design sensibility allows low-level C++/Vulkan kernels to bridge seamlessly into elegant, intuitive tools and interfaces.',
  },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTechFilter, setActiveTechFilter] = useState<TechCategory>('all')
  const [selectedTech, setSelectedTech] = useState<TechItem | null>(null)
  const [cursorActive, setCursorActive] = useState(true)
  const [soundActive, setSoundActive] = useState(true)

  const closeMenu = () => setIsMenuOpen(false)

  const toggleSound = () => {
    const nextState = !soundActive
    setSoundActive(nextState)
    gameAudio.setEnabled(nextState)
    if (nextState) {
      gameAudio.playClick()
    }
  }

  const toggleCursor = () => {
    setCursorActive(!cursorActive)
    gameAudio.playClick()
  }

  const filteredTech =
    activeTechFilter === 'all'
      ? techArsenal
      : techArsenal.filter((t) => t.category === activeTechFilter)

  return (
    <main>
      {/* Gamified Reticle Cursor */}
      <CustomCursor
        cursorActive={cursorActive}
        soundActive={soundActive}
        onToggleSound={toggleSound}
        onToggleCursor={toggleCursor}
      />

      {/* Gamified Diagnostics Command Deck */}
      <EngineConsole />

      {/* Site Header with HUD Controls */}
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label={`${profile.name} home`}>
          <EvangelionLogo size={30} />
          <span className="wordmark-title">
            <span className="wordmark-name">{profile.shortName}</span>
            <span className="wordmark-dot">.</span>
          </span>
          <span className="wordmark-badge">SYS // ONLINE</span>
        </a>

        {/* Gamified HUD Controls */}
        <div className="header-hud-toggles hide-mobile">
          <button
            type="button"
            className={`hud-toggle-btn ${cursorActive ? 'active' : ''}`}
            onClick={toggleCursor}
            title="Toggle Gamified Crosshair Reticle"
            data-cursor-label="RETICLE // TOGGLE"
          >
            <Crosshair size={13} />
            <span>RETICLE: {cursorActive ? 'ON' : 'OFF'}</span>
          </button>
          <button
            type="button"
            className={`hud-toggle-btn ${soundActive ? 'active' : ''}`}
            onClick={toggleSound}
            title="Toggle Retro Audio Synthesizer"
            data-cursor-label="AUDIO // TOGGLE"
          >
            {soundActive ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>SFX: {soundActive ? 'LIVE' : 'MUTE'}</span>
          </button>
        </div>

        <div className="header-controls">
          <nav id="site-navigation" className={isMenuOpen ? 'open' : ''} aria-label="Main navigation">
            <a href="#about" onClick={closeMenu}>About</a>
            <a href="#arsenal" onClick={closeMenu}>Tech Stack</a>
            <a href="#work" onClick={closeMenu}>Projects</a>
            <a href="#philosophy" onClick={closeMenu}>Philosophy</a>
            <a href="#contact" onClick={closeMenu}>Contact</a>
            <div className="nav-social">
              <a className="network-button" href={profile.github} target="_blank" rel="noreferrer">
                <GitHubMark /> GitHub
              </a>
              <a className="network-button" href={profile.linkedin} target="_blank" rel="noreferrer">
                <LinkedInMark /> LinkedIn
              </a>
            </div>
          </nav>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="site-navigation"
            aria-label={isMenuOpen ? 'Close navigation' : 'Open navigation'}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </header>

      {/* Hero Section with Interactive Engine Viewport */}
      <section className="hero-section" id="top">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="status-dot" />
            <span>TELKOM UNIVERSITY · 7+ YEARS DEV EXP · SYSTEMS & GRAPHICS</span>
          </p>
          <h1>
            Building the systems <em>beneath</em> the experience.
          </h1>
          <p className="hero-summary">
            I&apos;m <strong>{profile.name}</strong>, a systems-oriented software engineer and student at Telkom University.
            I specialize in <strong>C++</strong>, <strong>Vulkan 1.3</strong>, <strong>DirectX 12</strong>, <strong>Rust</strong>, and <strong>.NET CoreCLR</strong> runtime architecture—crafting high-performance engines and tools that hold up under real hardware complexity.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#arsenal" data-cursor-label="EXPLORE // ARSENAL">
              Explore Tech Stack <ArrowDownRight size={18} />
            </a>
            <a className="button button-secondary" href="#work" data-cursor-label="VIEW // PROJECTS">
              Selected Projects <Gamepad2 size={17} />
            </a>
            <a className="text-link" href="#about" data-cursor-label="ABOUT // ME">
              My Engineering Story <ArrowDownRight size={17} />
            </a>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="hero-telemetry-strip">
            {telemetryStats.map((stat, i) => (
              <div key={i} className="telemetry-stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-spec">{stat.spec}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive 3D / Shader Engine Viewport */}
        <div className="hero-viewport-column">
          <EngineViewport />
        </div>
      </section>

      {/* Continuous Animated Tech Marquee Ribbon */}
      <section className="tech-marquee-section" aria-label="Active Technical Stack">
        <div className="marquee-track">
          {[...techArsenal, ...techArsenal].map((tech, i) => {
            const Icon = tech.icon
            return (
              <div className="marquee-item" key={`${tech.id}-${i}`}>
                <Icon size={18} className="marquee-icon" />
                <span className="marquee-name">{tech.name}</span>
                <span className="marquee-badge">{tech.version}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Detailed About Section */}
      <section className="intro-section" id="about">
        <div className="intro-header-col">
          <p className="section-kicker">01 // Engineering Profile</p>
          <div className="profile-spec-box">
            <div className="spec-row">
              <span className="spec-k">NAME:</span>
              <span className="spec-v">{profile.name}</span>
            </div>
            <div className="spec-row">
              <span className="spec-k">DISCIPLINE:</span>
              <span className="spec-v">{profile.role}</span>
            </div>
            <div className="spec-row">
              <span className="spec-k">ACADEMIC:</span>
              <span className="spec-v">{profile.degree}, {profile.institution}</span>
            </div>
            <div className="spec-row">
              <span className="spec-k">CORE REPO:</span>
              <span className="spec-v">Ignite Engine (C++ / Vulkan)</span>
            </div>
            <div className="spec-row">
              <span className="spec-k">STATUS:</span>
              <span className="spec-v status-green">AVAILABLE FOR OPPORTUNITIES</span>
            </div>
          </div>
        </div>

        <div className="intro-layout">
          <h2>I build from first principles, then make it fast and useful.</h2>
          <div className="intro-body">
            <p>
              I am drawn to the layers where software interfaces directly with hardware: runtimes, memory layout, cache hierarchies, graphics APIs, and explicit synchronization. C++ is the foundation I return to most often, especially when determinism, latency, and control dictate whether a system succeeds or fails.
            </p>
            <p>
              My flagship endeavor is <strong>Ignite Engine</strong>, a modular C++ game engine engineered from scratch to explore custom Render Hardware Interface (RHI) abstractions across <strong>Vulkan 1.3</strong> and <strong>DirectX 12</strong>, cache-friendly archetype Entity Component Systems (ECS), multi-threaded command recording, and native asset compilers.
            </p>
            <p>
              That depth does not narrow my reach. Through <strong>MochiSharp</strong>, I bridge native C++ engines with Microsoft .NET CoreCLR via <code>hostfxr</code> for zero-overhead C# script hot-reloading. In <strong>Rust</strong>, I develop concurrency tooling and AI platforms like <strong>OpenTask</strong>. And with <strong>TypeScript and Bun</strong>, I design full-stack platforms like <strong>SIPERTI Malut</strong>, bringing rigorous systems discipline to user-facing applications.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Tech Arsenal & Architecture Radar */}
      <section className="arsenal-section" id="arsenal">
        <div className="section-heading">
          <div>
            <p className="section-kicker">02 // Systems & API Radar</p>
            <h2>Tools chosen for precision, control, and zero-cost abstraction.</h2>
          </div>
          <p className="section-subtitle">
            Every tool in my arsenal is backed by hands-on engine code, memory profiling, and real-world deployment. Click any card to inspect its architectural role.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="arsenal-filters" role="tablist" aria-label="Technology categories">
          {[
            { id: 'all', label: 'All Technologies' },
            { id: 'systems', label: 'Low-Level & Systems' },
            { id: 'graphics', label: 'Graphics & Compute' },
            { id: 'runtimes', label: 'Runtimes & FFI' },
            { id: 'mobile', label: 'Mobile & Client' },
            { id: 'web', label: 'Full-Stack & Web' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTechFilter === tab.id}
              className={`filter-btn ${activeTechFilter === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTechFilter(tab.id as TechCategory)
                gameAudio.playClick()
              }}
              data-cursor-label={`FILTER // ${tab.label.toUpperCase()}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tech Grid */}
        <div className="arsenal-grid">
          {filteredTech.map((tech) => {
            const Icon = tech.icon
            const isSelected = selectedTech?.id === tech.id

            return (
              <article
                key={tech.id}
                className={`tech-card ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTech(isSelected ? null : tech)
                  gameAudio.playClick()
                }}
                data-cursor-label={`INSPECT // ${tech.name.toUpperCase()}`}
              >
                <div className="tech-card-header">
                  <div className="tech-icon-frame" style={{ borderColor: `${tech.color}44` }}>
                    <Icon size={32} />
                  </div>
                  <div className="tech-meta">
                    <span className="tech-category-tag">{tech.categoryLabel}</span>
                    <h3 className="tech-name">{tech.name}</h3>
                    <span className="tech-version font-mono">{tech.version}</span>
                  </div>
                </div>

                <p className="tech-description">{tech.description}</p>

                <div className="tech-used-in">
                  <span className="used-in-label">PROVEN IN:</span>
                  <span className="used-in-val">{tech.usedIn}</span>
                </div>

                <div className="tech-card-corner" aria-hidden="true" />
              </article>
            )
          })}
        </div>

        {/* Selected Tech Telemetry Modal / Detail Callout */}
        {selectedTech && (
          <div className="tech-detail-drawer" role="dialog" aria-label="Technology Details">
            <div className="drawer-header">
              <div className="drawer-title-group">
                <selectedTech.icon size={26} />
                <h4>{selectedTech.name} // ARCHITECTURE TELEMETRY</h4>
                <span className="drawer-tag">{selectedTech.version}</span>
              </div>
              <button
                type="button"
                className="drawer-close"
                onClick={() => setSelectedTech(null)}
                data-cursor-label="CLOSE"
              >
                <X size={18} />
              </button>
            </div>
            <div className="drawer-content">
              <p><strong>System Role:</strong> {selectedTech.description}</p>
              <p><strong>Integrated Projects:</strong> {selectedTech.usedIn}</p>
              <div className="drawer-actions">
                <a className="button button-primary" href="#work" onClick={() => setSelectedTech(null)}>
                  View Projects Using {selectedTech.name} <ArrowDownRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Core Engineering Disciplines */}
      <section className="capabilities-section" aria-labelledby="capabilities-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">03 // Technical Specializations</p>
            <h2 id="capabilities-heading">Engineering across hardware, runtimes, and user interfaces.</h2>
          </div>
        </div>
        <div className="capability-grid">
          {capabilities.map(({ icon: Icon, badge, title, description }, index) => (
            <article className="capability" key={title}>
              <div className="capability-topline">
                <span>0{index + 1}</span>
                <span className="capability-badge">{badge}</span>
                <Icon size={22} strokeWidth={1.6} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Selected Projects with Tech Badges and Source Links */}
      <section className="work-section" id="work">
        <div className="work-intro">
          <p className="section-kicker">04 // Featured Implementations</p>
          <h2>Exploring the technology underneath interactive software.</h2>
          <p>
            My strongest projects begin where abstractions end: a custom graphics backend, an interop runtime boundary, a bytecode shader compiler, or a full-stack platform built for resilience.
          </p>
          <div className="work-quick-links">
            <a className="button button-primary" href={profile.github} target="_blank" rel="noreferrer">
              <GitHubMark /> All Repositories on GitHub <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <article
              className={`project-card project-card-${project.tone}`}
              key={project.name}
              data-cursor-label={`REPO // ${project.name.toUpperCase()}`}
            >
              <div className="project-topline">
                <span>0{index + 1} // {project.featured ? 'FLAGSHIP ARCHITECTURE' : 'OPEN SOURCE'}</span>
                <span>PUBLIC REPO</span>
              </div>
              <div>
                <h3>{project.name}</h3>
                <p className="project-subtitle">{project.subtitle}</p>
                <p>{project.description}</p>
              </div>
              <ul className="project-tags" aria-label={`${project.name} technologies`}>
                {project.tags.map((tag, tIdx) => {
                  const TagIcon = tag.icon
                  return (
                    <li key={tIdx} className="project-tag-item">
                      <TagIcon size={12} className="tag-icon" />
                      <span>{tag.name}</span>
                    </li>
                  )
                })}
              </ul>
              <div className="project-actions">
                <a className="project-button" href={project.href} target="_blank" rel="noreferrer">
                  <GitHubMark /> Source Code <ArrowUpRight size={15} />
                </a>
                {project.liveUrl && (
                  <a
                    className="project-button project-button-live"
                    href={project.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live Build <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Engineering Philosophy Pillars */}
      <section className="philosophy-section" id="philosophy">
        <div className="section-heading">
          <div>
            <p className="section-kicker">05 // Engineering Philosophy</p>
            <h2>Understanding the machine underneath the abstractions.</h2>
          </div>
          <p className="section-subtitle">
            &ldquo;Good software engineering is not about writing the most code. It is about understanding the problem, designing the right system, and knowing what is happening underneath the abstractions.&rdquo;
          </p>
        </div>

        <div className="philosophy-grid">
          {engineeringPillars.map((pillar) => (
            <div key={pillar.number} className="philosophy-card">
              <span className="pillar-num">{pillar.number}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <p className="section-kicker">06 // Connect & Collaborate</p>
        <h2>Have a system worth thinking through?</h2>
        <p>
          Let&apos;s talk about graphics programming, Vulkan/DirectX architecture, C++ runtime systems, game engine technology, or hard engineering challenges that require patient, first-principles execution.
        </p>
        <div className="contact-endpoints">
          <a className="contact-email" href={`mailto:${profile.email}`} data-cursor-label="DISPATCH // EMAIL">
            <Mail size={24} /> {profile.email} <ArrowUpRight size={25} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-left">
          <p>© {new Date().getFullYear()} {profile.name}. Built with Bun.</p>
          <span className="footer-meta">TELKOM UNIVERSITY · BANDUNG, ID</span>
        </div>
        <div className="social-links">
          <a className="network-button" href={profile.github} target="_blank" rel="noreferrer">
            <GitHubMark /> GitHub
          </a>
          <a className="network-button" href={profile.linkedin} target="_blank" rel="noreferrer">
            <LinkedInMark /> LinkedIn
          </a>
          <a href={`mailto:${profile.email}`} aria-label="Send email" className="mail-icon-link">
            <Mail size={19} />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default App
