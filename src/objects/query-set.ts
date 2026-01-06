/**
 * GPUQuerySet implementation
 */

import { ptr } from "bun:ffi";
import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { WGPU_STRLEN } from "../ffi/types";

// Global buffer storage to prevent GC issues
const querySetBuffers: Uint8Array[] = [];

// Query type enum
export const WGPUQueryType = {
  Occlusion: 1,
  Timestamp: 2,
} as const;

// Map JS query type strings to native values
const queryTypeMap: Record<GPUQueryType, number> = {
  occlusion: WGPUQueryType.Occlusion,
  timestamp: WGPUQueryType.Timestamp,
};

export function getQueryType(type: GPUQueryType): number {
  return queryTypeMap[type] ?? WGPUQueryType.Occlusion;
}

export class GPUQuerySetImpl extends GPUObjectBase implements GPUQuerySet {
  readonly __brand = "GPUQuerySet";
  private _type: GPUQueryType;
  private _count: number;
  private _destroyed = false;

  constructor(handle: Pointer, type: GPUQueryType, count: number, label?: string) {
    super(handle, label);
    this._type = type;
    this._count = count;
  }

  get type(): GPUQueryType {
    return this._type;
  }

  get count(): number {
    return this._count;
  }

  destroy(): undefined {
    if (!this._destroyed) {
      this._destroyed = true;
      getLib().wgpuQuerySetDestroy(this._handle);
    }
    return undefined;
  }

  protected releaseImpl(): void {
    getLib().wgpuQuerySetRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const labelBytes = new TextEncoder().encode(label + "\0");
    querySetBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    querySetBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuQuerySetSetLabel(this._handle, ptr(stringView));
  }
}

export function createQuerySetDescriptor(descriptor: GPUQuerySetDescriptor): Uint8Array {
  // WGPUQuerySetDescriptor (32 bytes):
  // offset 0:  nextInChain (ptr, 8)
  // offset 8:  label.data (ptr, 8)
  // offset 16: label.length (size_t, 8)
  // offset 24: type (u32, 4)
  // offset 28: count (u32, 4)

  const desc = new Uint8Array(32);
  querySetBuffers.push(desc);
  const view = new DataView(desc.buffer);

  // Label encoding
  let labelPtr = 0;
  if (descriptor.label) {
    const labelBytes = new TextEncoder().encode(descriptor.label + "\0");
    querySetBuffers.push(labelBytes);
    labelPtr = ptr(labelBytes) as unknown as number;
  }

  view.setBigUint64(0, BigInt(0), true);                          // nextInChain
  view.setBigUint64(8, BigInt(labelPtr), true);                   // label.data
  view.setBigUint64(16, WGPU_STRLEN, true);                       // label.length
  view.setUint32(24, getQueryType(descriptor.type), true);        // type
  view.setUint32(28, descriptor.count, true);                     // count

  return desc;
}

/**
 * Clear query set buffers to free memory
 */
export function clearQuerySetBuffers(): void {
  querySetBuffers.length = 0;
}
