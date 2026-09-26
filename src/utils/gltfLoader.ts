import suzanneGltfUrl from '../assets/suzanne.gltf?url'
import suzanneBinUrl from '../assets/suzanne.bin?url'
import { SUZANNE_BIN_BASE64, SUZANNE_GLTF_JSON } from './suzanneData'

export interface Point3D {
  x: number
  y: number
  z: number
}

export type WireframeEdge = [number, number]

export interface TriangleFace {
  indices: [number, number, number]
  normal: Point3D
}

export interface ParsedGLTFMesh {
  name: string
  vertices: Point3D[]
  edges: WireframeEdge[]
  triangles: TriangleFace[]
  bounds: {
    min: Point3D
    max: Point3D
    center: Point3D
    size: Point3D
    radius: number
  }
}

// Khronos glTF 2.0 Accessor component types
const COMPONENT_TYPE = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126,
} as const

export interface GLTFDocument {
  asset: {
    version: string
    generator?: string
  }
  scene?: number
  scenes?: { name?: string; nodes?: number[] }[]
  nodes?: { name?: string; mesh?: number }[]
  meshes?: {
    name?: string
    primitives: {
      attributes: {
        POSITION: number
        NORMAL?: number
        TEXCOORD_0?: number
      }
      indices?: number
      mode?: number
    }[]
  }[]
  accessors: {
    bufferView: number
    byteOffset?: number
    componentType: number
    count: number
    type: string
    max?: number[]
    min?: number[]
  }[]
  bufferViews: {
    buffer: number
    byteLength: number
    byteOffset?: number
    byteStride?: number
    target?: number
  }[]
  buffers?: {
    byteLength: number
    uri?: string
  }[]
}

/**
 * Parses raw glTF JSON structure and its associated ArrayBuffer into
 * optimized vertex, edge, and triangle data for 3D wireframe rendering.
 */
export function parseGLTF(gltf: GLTFDocument, buffer: ArrayBuffer, meshIndex = 0): ParsedGLTFMesh {
  const mesh = gltf.meshes?.[meshIndex]
  if (!mesh) {
    throw new Error(`glTF does not contain mesh at index ${meshIndex}`)
  }

  const primitive = mesh.primitives?.[0]
  if (!primitive) {
    throw new Error(`Mesh "${mesh.name || meshIndex}" does not have any primitives`)
  }

  // 1. Extract Vertex Positions (POSITION attribute)
  const posAccessorIndex = primitive.attributes.POSITION
  const posAccessor = gltf.accessors[posAccessorIndex]
  const posView = gltf.bufferViews[posAccessor.bufferView]
  const posOffset = (posView.byteOffset || 0) + (posAccessor.byteOffset || 0)

  if (posAccessor.componentType !== COMPONENT_TYPE.FLOAT) {
    throw new Error(`Unsupported POSITION componentType: ${posAccessor.componentType}`)
  }

  const floatArray = new Float32Array(buffer, posOffset, posAccessor.count * 3)
  const vertices: Point3D[] = []

  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  let minZ = Infinity, maxZ = -Infinity

  for (let i = 0; i < posAccessor.count; i++) {
    const x = floatArray[i * 3]
    const y = floatArray[i * 3 + 1]
    const z = floatArray[i * 3 + 2]

    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)

    vertices.push({ x, y, z })
  }

  const center: Point3D = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
    z: (minZ + maxZ) / 2,
  }

  const size: Point3D = {
    x: maxX - minX,
    y: maxY - minY,
    z: maxZ - minZ,
  }

  let maxRadiusSq = 0
  for (let i = 0; i < vertices.length; i++) {
    const v = vertices[i]
    const dx = v.x - center.x
    const dy = v.y - center.y
    const dz = v.z - center.z
    const rSq = dx * dx + dy * dy + dz * dz
    if (rSq > maxRadiusSq) maxRadiusSq = rSq
  }
  const radius = Math.sqrt(maxRadiusSq) || 1

  // 2. Extract Indices and Faces
  const triangles: TriangleFace[] = []
  const edgeSet = new Set<string>()
  const edges: WireframeEdge[] = []

  const addEdge = (a: number, b: number) => {
    const u = Math.min(a, b)
    const v = Math.max(a, b)
    const key = `${u}_${v}`
    if (!edgeSet.has(key)) {
      edgeSet.add(key)
      edges.push([u, v])
    }
  }

  if (primitive.indices !== undefined) {
    const idxAccessor = gltf.accessors[primitive.indices]
    const idxView = gltf.bufferViews[idxAccessor.bufferView]
    const idxOffset = (idxView.byteOffset || 0) + (idxAccessor.byteOffset || 0)

    let getIndex: (i: number) => number

    if (idxAccessor.componentType === COMPONENT_TYPE.UNSIGNED_SHORT) {
      const uint16 = new Uint16Array(buffer, idxOffset, idxAccessor.count)
      getIndex = (i) => uint16[i]
    } else if (idxAccessor.componentType === COMPONENT_TYPE.UNSIGNED_INT) {
      const uint32 = new Uint32Array(buffer, idxOffset, idxAccessor.count)
      getIndex = (i) => uint32[i]
    } else if (idxAccessor.componentType === COMPONENT_TYPE.UNSIGNED_BYTE) {
      const uint8 = new Uint8Array(buffer, idxOffset, idxAccessor.count)
      getIndex = (i) => uint8[i]
    } else {
      throw new Error(`Unsupported indices componentType: ${idxAccessor.componentType}`)
    }

    for (let i = 0; i < idxAccessor.count; i += 3) {
      const i0 = getIndex(i)
      const i1 = getIndex(i + 1)
      const i2 = getIndex(i + 2)

      addEdge(i0, i1)
      addEdge(i1, i2)
      addEdge(i2, i0)

      // Calculate triangle normal
      const v0 = vertices[i0]
      const v1 = vertices[i1]
      const v2 = vertices[i2]

      const ux = v1.x - v0.x
      const uy = v1.y - v0.y
      const uz = v1.z - v0.z

      const wx = v2.x - v0.x
      const wy = v2.y - v0.y
      const wz = v2.z - v0.z

      const nx = uy * wz - uz * wy
      const ny = uz * wx - ux * wz
      const nz = ux * wy - uy * wx
      const nLen = Math.hypot(nx, ny, nz) || 1

      triangles.push({
        indices: [i0, i1, i2],
        normal: { x: nx / nLen, y: ny / nLen, z: nz / nLen },
      })
    }
  } else {
    // Non-indexed vertices
    for (let i = 0; i < vertices.length; i += 3) {
      addEdge(i, i + 1)
      addEdge(i + 1, i + 2)
      addEdge(i + 2, i)

      const v0 = vertices[i]
      const v1 = vertices[i + 1]
      const v2 = vertices[i + 2]

      const ux = v1.x - v0.x
      const uy = v1.y - v0.y
      const uz = v1.z - v0.z

      const wx = v2.x - v0.x
      const wy = v2.y - v0.y
      const wz = v2.z - v0.z

      const nx = uy * wz - uz * wy
      const ny = uz * wx - ux * wz
      const nz = ux * wy - uy * wx
      const nLen = Math.hypot(nx, ny, nz) || 1

      triangles.push({
        indices: [i, i + 1, i + 2],
        normal: { x: nx / nLen, y: ny / nLen, z: nz / nLen },
      })
    }
  }

  return {
    name: mesh.name || 'glTF Mesh',
    vertices,
    edges,
    triangles,
    bounds: {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center,
      size,
      radius,
    },
  }
}

function decodeBase64Buffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes.buffer
}

let cachedInstantSuzanne: ParsedGLTFMesh | null = null

/**
 * Returns a synchronously parsed Suzanne mesh immediately.
 * Guarantees zero flickering and instantaneous rendering on the very first frame.
 */
export function getInitialSuzanneMesh(): ParsedGLTFMesh {
  if (!cachedInstantSuzanne) {
    const buffer = decodeBase64Buffer(SUZANNE_BIN_BASE64)
    cachedInstantSuzanne = parseGLTF(SUZANNE_GLTF_JSON, buffer)
  }
  return cachedInstantSuzanne
}

/**
 * Dynamically loads and parses a glTF file and its external binary buffer.
 */
export async function loadGLTF(gltfUrl: string, binUrl?: string): Promise<ParsedGLTFMesh> {
  const gltfRes = await fetch(gltfUrl)
  if (!gltfRes.ok) {
    throw new Error(`Failed to load glTF from ${gltfUrl}: ${gltfRes.statusText}`)
  }
  const gltfJson = await gltfRes.json()

  let bufferUrl = binUrl
  if (!bufferUrl) {
    const binUri = gltfJson.buffers?.[0]?.uri
    if (!binUri) {
      throw new Error(`No binary buffer URI found in glTF from ${gltfUrl}`)
    }
    bufferUrl = new URL(binUri, new URL(gltfUrl, window.location.href)).href
  }

  const binRes = await fetch(bufferUrl)
  if (!binRes.ok) {
    throw new Error(`Failed to load binary buffer from ${bufferUrl}: ${binRes.statusText}`)
  }
  const arrayBuffer = await binRes.arrayBuffer()

  return parseGLTF(gltfJson, arrayBuffer)
}

/**
 * Loads the Suzanne Monkey model from the assets or public directory.
 * Falls back safely to pre-parsed data if network or file system requests fail.
 */
export async function loadSuzanneMesh(): Promise<ParsedGLTFMesh> {
  try {
    // 1. Try loading via Vite asset URLs
    if (suzanneGltfUrl && suzanneBinUrl) {
      return await loadGLTF(suzanneGltfUrl, suzanneBinUrl)
    }
  } catch (err) {
    console.warn('Vite asset glTF loading error, falling back to static path:', err)
  }

  try {
    // 2. Try loading via public model path
    return await loadGLTF('/models/suzanne.gltf', '/models/suzanne.bin')
  } catch (err) {
    console.warn('Public static glTF loading error, falling back to instant data:', err)
  }

  // 3. Fallback to instant synchronous data
  return getInitialSuzanneMesh()
}
