/**
 * FFI type definitions for wgpu-native bindings
 */

import type { Pointer as BunPointer } from "bun:ffi";

// Use Bun's Pointer type directly for FFI compatibility
export type Pointer = BunPointer;
export type NullablePointer = Pointer | null;

// WebGPU opaque handle types (all pointers)
export type WGPUInstance = Pointer;
export type WGPUAdapter = Pointer;
export type WGPUDevice = Pointer;
export type WGPUQueue = Pointer;
export type WGPUBuffer = Pointer;
export type WGPUTexture = Pointer;
export type WGPUTextureView = Pointer;
export type WGPUSampler = Pointer;
export type WGPUShaderModule = Pointer;
export type WGPUBindGroup = Pointer;
export type WGPUBindGroupLayout = Pointer;
export type WGPUPipelineLayout = Pointer;
export type WGPUComputePipeline = Pointer;
export type WGPURenderPipeline = Pointer;
export type WGPUCommandEncoder = Pointer;
export type WGPUCommandBuffer = Pointer;
export type WGPUComputePassEncoder = Pointer;
export type WGPURenderPassEncoder = Pointer;
export type WGPUQuerySet = Pointer;
export type WGPURenderBundle = Pointer;
export type WGPURenderBundleEncoder = Pointer;
export type WGPUSurface = Pointer;

// Callback mode enum
export const WGPUCallbackMode = {
  WaitAnyOnly: 0x00000001,
  AllowProcessEvents: 0x00000002,
  AllowSpontaneous: 0x00000003,
} as const;

// Request status enums
export const WGPURequestAdapterStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  Unavailable: 0x00000003,
  Error: 0x00000004,
  Unknown: 0x00000005,
} as const;

export const WGPURequestDeviceStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  Error: 0x00000003,
  Unknown: 0x00000004,
} as const;

export const WGPUBufferMapAsyncStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  ValidationError: 0x00000003,
  Unknown: 0x00000004,
  DeviceLost: 0x00000005,
  DestroyedBeforeCallback: 0x00000006,
  UnmappedBeforeCallback: 0x00000007,
  MappingAlreadyPending: 0x00000008,
  OffsetOutOfRange: 0x00000009,
  SizeOutOfRange: 0x0000000A,
} as const;

// Map mode flags
export const WGPUMapMode = {
  None: 0x00000000,
  Read: 0x00000001,
  Write: 0x00000002,
} as const;

// Buffer usage flags
export const WGPUBufferUsage = {
  None: 0x00000000,
  MapRead: 0x00000001,
  MapWrite: 0x00000002,
  CopySrc: 0x00000004,
  CopyDst: 0x00000008,
  Index: 0x00000010,
  Vertex: 0x00000020,
  Uniform: 0x00000040,
  Storage: 0x00000080,
  Indirect: 0x00000100,
  QueryResolve: 0x00000200,
} as const;

// Texture usage flags
export const WGPUTextureUsage = {
  None: 0x00000000,
  CopySrc: 0x00000001,
  CopyDst: 0x00000002,
  TextureBinding: 0x00000004,
  StorageBinding: 0x00000008,
  RenderAttachment: 0x00000010,
} as const;

// Shader stage flags
export const WGPUShaderStage = {
  None: 0x00000000,
  Vertex: 0x00000001,
  Fragment: 0x00000002,
  Compute: 0x00000004,
} as const;

// Feature level
export const WGPUFeatureLevel = {
  Undefined: 0x00000000,
  Compatibility: 0x00000001,
  Core: 0x00000002,
} as const;

// Power preference
export const WGPUPowerPreference = {
  Undefined: 0x00000000,
  LowPower: 0x00000001,
  HighPerformance: 0x00000002,
} as const;

// Backend type
export const WGPUBackendType = {
  Undefined: 0x00000000,
  Null: 0x00000001,
  WebGPU: 0x00000002,
  D3D11: 0x00000003,
  D3D12: 0x00000004,
  Metal: 0x00000005,
  Vulkan: 0x00000006,
  OpenGL: 0x00000007,
  OpenGLES: 0x00000008,
} as const;

// Texture format (subset)
export const WGPUTextureFormat = {
  Undefined: 0x00000000,
  R8Unorm: 0x00000001,
  R8Snorm: 0x00000002,
  R8Uint: 0x00000003,
  R8Sint: 0x00000004,
  R16Uint: 0x00000005,
  R16Sint: 0x00000006,
  R16Float: 0x00000007,
  RG8Unorm: 0x00000008,
  RG8Snorm: 0x00000009,
  RG8Uint: 0x0000000A,
  RG8Sint: 0x0000000B,
  R32Float: 0x0000000C,
  R32Uint: 0x0000000D,
  R32Sint: 0x0000000E,
  RG16Uint: 0x0000000F,
  RG16Sint: 0x00000010,
  RG16Float: 0x00000011,
  RGBA8Unorm: 0x00000012,
  RGBA8UnormSrgb: 0x00000013,
  RGBA8Snorm: 0x00000014,
  RGBA8Uint: 0x00000015,
  RGBA8Sint: 0x00000016,
  BGRA8Unorm: 0x00000017,
  BGRA8UnormSrgb: 0x00000018,
} as const;

// SType for chained structs
export const WGPUSType = {
  ShaderSourceSPIRV: 0x00000001,
  ShaderSourceWGSL: 0x00000002,
  RenderPassMaxDrawCount: 0x00000003,
  SurfaceSourceMetalLayer: 0x00000004,
  SurfaceSourceWindowsHWND: 0x00000005,
  SurfaceSourceXlibWindow: 0x00000006,
  SurfaceSourceWaylandSurface: 0x00000007,
  SurfaceSourceAndroidNativeWindow: 0x00000008,
  SurfaceSourceXCBWindow: 0x00000009,
} as const;

// Primitive topology
export const WGPUPrimitiveTopology = {
  Undefined: 0x00000000,
  PointList: 0x00000001,
  LineList: 0x00000002,
  LineStrip: 0x00000003,
  TriangleList: 0x00000004,
  TriangleStrip: 0x00000005,
} as const;

// Load/Store ops
export const WGPULoadOp = {
  Undefined: 0x00000000,
  Load: 0x00000001,
  Clear: 0x00000002,
} as const;

export const WGPUStoreOp = {
  Undefined: 0x00000000,
  Store: 0x00000001,
  Discard: 0x00000002,
} as const;

// Error types
export const WGPUErrorType = {
  NoError: 0x00000001,
  Validation: 0x00000002,
  OutOfMemory: 0x00000003,
  Internal: 0x00000004,
  Unknown: 0x00000005,
} as const;

// PopErrorScope status
export const WGPUPopErrorScopeStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  EmptyStack: 0x00000003,
} as const;

// Create pipeline async status
export const WGPUCreatePipelineAsyncStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  ValidationError: 0x00000003,
  InternalError: 0x00000004,
  Unknown: 0x00000005,
} as const;

// Compilation info request status
export const WGPUCompilationInfoRequestStatus = {
  Success: 0x00000001,
  InstanceDropped: 0x00000002,
  Error: 0x00000003,
} as const;

// Compilation message type
export const WGPUCompilationMessageType = {
  Error: 0x00000001,
  Warning: 0x00000002,
  Info: 0x00000003,
} as const;

// Constants
export const WGPU_STRLEN = BigInt("0xFFFFFFFFFFFFFFFF"); // SIZE_MAX
export const WGPU_WHOLE_SIZE = BigInt("0xFFFFFFFFFFFFFFFF"); // UINT64_MAX
export const WGPU_WHOLE_MAP_SIZE = BigInt("0xFFFFFFFFFFFFFFFF"); // SIZE_MAX
