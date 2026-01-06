/**
 * GPUBindGroup and GPUBindGroupLayout implementations
 */

import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { StructEncoder } from "../structs/encoder";

export class GPUBindGroupLayoutImpl extends GPUObjectBase implements GPUBindGroupLayout {
  readonly __brand = "GPUBindGroupLayout";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuBindGroupLayoutRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(label);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuBindGroupLayoutSetLabel(this._handle, stringView.ptr);
    encoder.freeAll();
  }
}

export class GPUBindGroupImpl extends GPUObjectBase implements GPUBindGroup {
  readonly __brand = "GPUBindGroup";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuBindGroupRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(label);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuBindGroupSetLabel(this._handle, stringView.ptr);
    encoder.freeAll();
  }
}
