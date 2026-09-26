import React, { useState, useRef, useEffect } from 'react'
import { Terminal, X, CornerDownLeft } from 'lucide-react'
import { gameAudio } from '../utils/audio'

interface ConsoleLog {
  type: 'input' | 'output' | 'system' | 'error'
  text: string
  link?: string
  linkText?: string
}

export const EngineConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputVal, setInputVal] = useState('')
  const [logs, setLogs] = useState<ConsoleLog[]>([
    {
      type: 'system',
      text: 'IGNITE RUNTIME CONSOLE v1.0.4 [HOST: TELKOM-SYS // VULKAN 1.3 INITIALIZED]',
    },
    {
      type: 'system',
      text: 'Type "help" to list available commands or click quick chips below.',
    },
  ])

  const terminalEndRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [logs, isOpen])

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim().toLowerCase()
    if (!trimmed) return

    gameAudio.playClick()
    const newLogs: ConsoleLog[] = [...logs, { type: 'input', text: `$ ${cmdStr}` }]

    switch (trimmed) {
      case 'help':
        newLogs.push({
          type: 'output',
          text: 'AVAILABLE COMMANDS:\n  • about     - Who is Evangelion Manuhutu?\n  • vulkan    - Low-level Vulkan 1.3 architecture\n  • cpp       - C++20/23, ECS & systems design\n  • dotnet    - CoreCLR & MochiSharp hostfxr\n  • rust      - Systems tooling & OpenTask\n  • projects  - Explore open-source repositories\n  • stats     - Engineering telemetry & metrics\n  • contact   - Communication endpoints\n  • clear     - Flush console output',
        })
        break
      case 'about':
        newLogs.push({
          type: 'output',
          text: 'EVANGELION MANUHUTU: Systems-oriented Software Engineer & Telkom University student. 7+ years of experience architecting native engines, graphics backends, runtime interop, and full-stack software. Driven by mechanical sympathy and first-principles design.',
        })
        break
      case 'vulkan':
        newLogs.push({
          type: 'output',
          text: 'VULKAN 1.3 PIPELINE:\n  - Multi-threaded command buffer recording\n  - Dynamic descriptor indexing & push constants\n  - Pipeline state object (PSO) disk caching\n  - Timeline semaphores & explicit memory aliasing\n  - Umbra HLSL/GLSL -> SPIR-V bytecode compiler integration',
        })
        break
      case 'cpp':
      case 'c++':
        newLogs.push({
          type: 'output',
          text: 'MODERN C++ (C++20/C++23):\n  - Custom cache-friendly Archetype Entity Component System\n  - Arenas, Linear & Buddy Memory Allocators (zero runtime heap fragmentation)\n  - RAII-based deterministic hardware resource wrappers\n  - SIMD math matrix acceleration & lock-free queues',
        })
        break
      case 'dotnet':
      case '.net':
      case 'c#':
        newLogs.push({
          type: 'output',
          text: 'MOCHISHARP (.NET / CoreCLR):\n  - Direct native hosting of Microsoft CoreCLR through hostfxr\n  - Unmanaged function pointers bypassing P/Invoke overhead\n  - Live hot-reloading for C# gameplay scripting inside native C++ engines',
        })
        break
      case 'rust':
        newLogs.push({
          type: 'output',
          text: 'RUST SYSTEMS & OPENTASK:\n  - Memory-safe concurrent tooling and distributed task workers\n  - Zero-cost abstractions and fearless concurrency for OpenTask engine backend',
        })
        break
      case 'projects':
        newLogs.push({
          type: 'output',
          text: 'CORE REPOSITORIES:\n  1. IgniteEngine - Modular C++ Game Engine (Vulkan / DX12)\n  2. Umbra-ShaderCompiler - HLSL/GLSL -> SPIR-V/DXIL Reflection\n  3. MochiSharp - High-perf C++ CoreCLR Hostfxr Framework\n  4. Ignite-Server - Low-latency GameNetworkingSockets Server\n  5. SIPERTI Malut - Mining Permissions System\n  6. OpenTask - AI Code & Project Management Platform',
        })
        break
      case 'stats':
        newLogs.push({
          type: 'output',
          text: 'TELEMETRY METRICS:\n  - Experience: 7+ Years\n  - Low-Level Graphics APIs: Vulkan 1.3, DirectX 12, NVRHI\n  - Core Languages: C++, Rust, C#, TypeScript, Python\n  - Status: Open for systems, graphics & full-stack opportunities',
        })
        break
      case 'contact':
        newLogs.push({
          type: 'output',
          text: 'TRANSMISSION CHANNELS:\n  - Email: evangelionxyz10@gmail.com\n  - GitHub: https://github.com/evangelionxyz\n  - LinkedIn: https://www.linkedin.com/in/evangelionxyz/',
        })
        break
      case 'clear':
        setLogs([])
        setInputVal('')
        return
      default:
        newLogs.push({
          type: 'error',
          text: `Command not recognized: "${cmdStr}". Type "help" for a list of valid commands.`,
        })
    }

    setLogs(newLogs)
    setInputVal('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal)
    }
  }

  const toggleConsole = () => {
    setIsOpen(!isOpen)
    gameAudio.playClick()
  }

  return (
    <>
      {/* Floating HUD Trigger Button */}
      <button
        type="button"
        className={`hud-console-trigger ${isOpen ? 'active' : ''}`}
        onClick={toggleConsole}
        aria-label="Toggle Systems Console"
        data-cursor-label="CONSOLE // EXEC"
      >
        <Terminal size={16} />
        <span>CONSOLE [~]</span>
        <span className="console-status-pulse" />
      </button>

      {/* Terminal Drawer Overlay */}
      {isOpen && (
        <div className="hud-console-overlay">
          <div className="hud-console-window">
            {/* Terminal Window Header */}
            <div className="hud-console-header">
              <div className="console-title">
                <Terminal size={15} />
                <span>IGNITE ENGINE // DIAGNOSTICS SHELL</span>
              </div>
              <div className="console-controls">
                <button
                  type="button"
                  className="console-close-btn"
                  onClick={toggleConsole}
                  aria-label="Close Console"
                  data-cursor-label="CLOSE"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Quick Command Chips */}
            <div className="console-chips">
              <span className="chip-label">QUICK EXEC:</span>
              {['help', 'vulkan', 'cpp', 'dotnet', 'projects', 'stats', 'clear'].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  className="console-chip"
                  onClick={() => executeCommand(cmd)}
                  data-cursor-label={`EXEC ${cmd.toUpperCase()}`}
                >
                  {cmd}
                </button>
              ))}
            </div>

            {/* Terminal Body */}
            <div className="hud-console-body">
              {logs.map((log, index) => (
                <div key={index} className={`console-line console-${log.type}`}>
                  <pre>{log.text}</pre>
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            {/* Terminal Prompt Bar */}
            <div className="hud-console-input-bar">
              <span className="console-prompt-sym">$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type command ('help', 'vulkan', 'projects')..."
                className="console-input"
                autoComplete="off"
                spellCheck="false"
              />
              <button
                type="button"
                className="console-submit-btn"
                onClick={() => executeCommand(inputVal)}
                aria-label="Run command"
              >
                <CornerDownLeft size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
