/**
 * GPUShaderModule implementation
 */

import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { StructEncoder } from "../structs/encoder";

export class GPUShaderModuleImpl extends GPUObjectBase implements GPUShaderModule {
  readonly __brand = "GPUShaderModule";
  private _instance: Pointer;

  constructor(handle: Pointer, instance: Pointer, label?: string) {
    super(handle, label);
    this._instance = instance;
  }

  protected releaseImpl(): void {
    getLib().wgpuShaderModuleRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(label);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuShaderModuleSetLabel(this._handle, stringView.ptr);
    encoder.freeAll();
  }

  async getCompilationInfo(): Promise<GPUCompilationInfo> {
    // Note: wgpuShaderModuleGetCompilationInfo is not implemented in wgpu-native
    // Return empty compilation info (which is what native WebGPU does for valid shaders)
    // If the shader had errors, createShaderModule would have thrown already
    return {
      __brand: "GPUCompilationInfo",
      messages: [],
    } as GPUCompilationInfo;
  }
}
