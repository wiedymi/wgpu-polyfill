/**
 * GPUComputePassEncoder implementation
 */

import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { StructEncoder } from "../structs/encoder";

export class GPUComputePassEncoderImpl extends GPUObjectBase implements GPUComputePassEncoder {
  readonly __brand = "GPUComputePassEncoder";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuComputePassEncoderRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(label);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuComputePassEncoderSetLabel(this._handle, stringView.ptr);
    encoder.freeAll();
  }

  setPipeline(pipeline: GPUComputePipeline): undefined {
    const pipelineHandle = (pipeline as unknown as { handle: Pointer }).handle;
    getLib().wgpuComputePassEncoderSetPipeline(this._handle, pipelineHandle);
  }

  setBindGroup(
    index: GPUIndex32,
    bindGroup: GPUBindGroup | null,
    dynamicOffsets?: Iterable<GPUBufferDynamicOffset>
  ): undefined {
    const bindGroupHandle = bindGroup
      ? (bindGroup as unknown as { handle: Pointer }).handle
      : (0 as Pointer);

    const offsets = dynamicOffsets ? Array.from(dynamicOffsets) : [];

    if (offsets.length === 0) {
      getLib().wgpuComputePassEncoderSetBindGroup(
        this._handle,
        index,
        bindGroupHandle,
        0,
        0 as Pointer
      );
    } else {
      const encoder = new StructEncoder();
      const offsetsBuffer = encoder.alloc(offsets.length * 4);
      const view = new DataView(offsetsBuffer.buffer.buffer);
      for (let i = 0; i < offsets.length; i++) {
        view.setUint32(i * 4, offsets[i], true);
      }
      getLib().wgpuComputePassEncoderSetBindGroup(
        this._handle,
        index,
        bindGroupHandle,
        offsets.length,
        offsetsBuffer.ptr
      );
      encoder.freeAll();
    }
  }

  dispatchWorkgroups(
    workgroupCountX: GPUSize32,
    workgroupCountY?: GPUSize32,
    workgroupCountZ?: GPUSize32
  ): undefined {
    getLib().wgpuComputePassEncoderDispatchWorkgroups(
      this._handle,
      workgroupCountX,
      workgroupCountY ?? 1,
      workgroupCountZ ?? 1
    );
  }

  dispatchWorkgroupsIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): undefined {
    const bufferHandle = (indirectBuffer as unknown as { handle: Pointer }).handle;
    getLib().wgpuComputePassEncoderDispatchWorkgroupsIndirect(
      this._handle,
      bufferHandle,
      BigInt(indirectOffset)
    );
  }

  end(): undefined {
    getLib().wgpuComputePassEncoderEnd(this._handle);
  }

  pushDebugGroup(groupLabel: string): undefined {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(groupLabel);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuComputePassEncoderPushDebugGroup(this._handle, stringView.ptr);
    encoder.freeAll();
  }

  popDebugGroup(): undefined {
    getLib().wgpuComputePassEncoderPopDebugGroup(this._handle);
  }

  insertDebugMarker(markerLabel: string): undefined {
    const encoder = new StructEncoder();
    const { data, length } = encoder.encodeString(markerLabel);
    const stringView = encoder.alloc(16);
    const view = new DataView(stringView.buffer.buffer);
    view.setBigUint64(0, BigInt(data), true);
    view.setBigUint64(8, BigInt(length), true);
    getLib().wgpuComputePassEncoderInsertDebugMarker(this._handle, stringView.ptr);
    encoder.freeAll();
  }
}
