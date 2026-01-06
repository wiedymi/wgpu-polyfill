/**
 * GPUSampler implementation
 */

import { ptr } from "bun:ffi";
import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { WGPU_STRLEN } from "../ffi/types";

// Global buffer storage to prevent GC issues
const samplerBuffers: Uint8Array[] = [];

// Address mode enum
export const WGPUAddressMode = {
  Undefined: 0,
  ClampToEdge: 1,
  Repeat: 2,
  MirrorRepeat: 3,
} as const;

// Filter mode enum
export const WGPUFilterMode = {
  Undefined: 0,
  Nearest: 1,
  Linear: 2,
} as const;

// Mipmap filter mode enum
export const WGPUMipmapFilterMode = {
  Undefined: 0,
  Nearest: 1,
  Linear: 2,
} as const;

// Compare function enum
export const WGPUCompareFunction = {
  Undefined: 0,
  Never: 1,
  Less: 2,
  Equal: 3,
  LessEqual: 4,
  Greater: 5,
  NotEqual: 6,
  GreaterEqual: 7,
  Always: 8,
} as const;

// Map JS address mode strings to native values
const addressModeMap: Record<string, number> = {
  "clamp-to-edge": WGPUAddressMode.ClampToEdge,
  "repeat": WGPUAddressMode.Repeat,
  "mirror-repeat": WGPUAddressMode.MirrorRepeat,
};

// Map JS filter mode strings to native values
const filterModeMap: Record<string, number> = {
  "nearest": WGPUFilterMode.Nearest,
  "linear": WGPUFilterMode.Linear,
};

// Map JS mipmap filter mode strings to native values
const mipmapFilterModeMap: Record<string, number> = {
  "nearest": WGPUMipmapFilterMode.Nearest,
  "linear": WGPUMipmapFilterMode.Linear,
};

// Map JS compare function strings to native values
const compareFunctionMap: Record<string, number> = {
  "never": WGPUCompareFunction.Never,
  "less": WGPUCompareFunction.Less,
  "equal": WGPUCompareFunction.Equal,
  "less-equal": WGPUCompareFunction.LessEqual,
  "greater": WGPUCompareFunction.Greater,
  "not-equal": WGPUCompareFunction.NotEqual,
  "greater-equal": WGPUCompareFunction.GreaterEqual,
  "always": WGPUCompareFunction.Always,
};

export function getAddressMode(mode?: GPUAddressMode): number {
  return addressModeMap[mode ?? "clamp-to-edge"] ?? WGPUAddressMode.ClampToEdge;
}

export function getFilterMode(mode?: GPUFilterMode): number {
  return filterModeMap[mode ?? "nearest"] ?? WGPUFilterMode.Nearest;
}

export function getMipmapFilterMode(mode?: GPUMipmapFilterMode): number {
  return mipmapFilterModeMap[mode ?? "nearest"] ?? WGPUMipmapFilterMode.Nearest;
}

export function getCompareFunction(func?: GPUCompareFunction): number {
  if (!func) return WGPUCompareFunction.Undefined;
  return compareFunctionMap[func] ?? WGPUCompareFunction.Undefined;
}

export class GPUSamplerImpl extends GPUObjectBase implements GPUSampler {
  readonly __brand = "GPUSampler";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuSamplerRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const labelBytes = new TextEncoder().encode(label + "\0");
    samplerBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    samplerBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuSamplerSetLabel(this._handle, ptr(stringView));
  }
}

export function createSamplerDescriptor(descriptor?: GPUSamplerDescriptor): Uint8Array {
  // WGPUSamplerDescriptor (64 bytes):
  // offset 0:  nextInChain (ptr, 8)
  // offset 8:  label.data (ptr, 8)
  // offset 16: label.length (size_t, 8)
  // offset 24: addressModeU (u32, 4)
  // offset 28: addressModeV (u32, 4)
  // offset 32: addressModeW (u32, 4)
  // offset 36: magFilter (u32, 4)
  // offset 40: minFilter (u32, 4)
  // offset 44: mipmapFilter (u32, 4)
  // offset 48: lodMinClamp (f32, 4)
  // offset 52: lodMaxClamp (f32, 4)
  // offset 56: compare (u32, 4)
  // offset 60: maxAnisotropy (u16, 2)
  // offset 62: padding (2)
  // Total: 64 bytes

  const desc = new Uint8Array(64);
  samplerBuffers.push(desc);
  const view = new DataView(desc.buffer);

  view.setBigUint64(0, BigInt(0), true);                          // nextInChain
  view.setBigUint64(8, BigInt(0), true);                          // label.data
  view.setBigUint64(16, WGPU_STRLEN, true);                       // label.length
  view.setUint32(24, getAddressMode(descriptor?.addressModeU), true);
  view.setUint32(28, getAddressMode(descriptor?.addressModeV), true);
  view.setUint32(32, getAddressMode(descriptor?.addressModeW), true);
  view.setUint32(36, getFilterMode(descriptor?.magFilter), true);
  view.setUint32(40, getFilterMode(descriptor?.minFilter), true);
  view.setUint32(44, getMipmapFilterMode(descriptor?.mipmapFilter), true);
  view.setFloat32(48, descriptor?.lodMinClamp ?? 0, true);
  view.setFloat32(52, descriptor?.lodMaxClamp ?? 32, true);
  view.setUint32(56, getCompareFunction(descriptor?.compare), true);
  view.setUint16(60, descriptor?.maxAnisotropy ?? 1, true);
  view.setUint16(62, 0, true);                                    // padding

  return desc;
}

/**
 * Clear sampler buffers to free memory
 */
export function clearSamplerBuffers(): void {
  samplerBuffers.length = 0;
}
