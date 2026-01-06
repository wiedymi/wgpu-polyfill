/**
 * GPURenderBundle and GPURenderBundleEncoder implementation
 */

import { ptr } from "bun:ffi";
import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { WGPU_STRLEN } from "../ffi/types";
import { getTextureFormat } from "./texture";

// Global buffer storage to prevent GC issues
const renderBundleBuffers: Uint8Array[] = [];

export class GPURenderBundleImpl extends GPUObjectBase implements GPURenderBundle {
  readonly __brand = "GPURenderBundle";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuRenderBundleRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const labelBytes = new TextEncoder().encode(label + "\0");
    renderBundleBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderBundleBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderBundleSetLabel(this._handle, ptr(stringView));
  }
}

export class GPURenderBundleEncoderImpl extends GPUObjectBase implements GPURenderBundleEncoder {
  readonly __brand = "GPURenderBundleEncoder";

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuRenderBundleEncoderRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const labelBytes = new TextEncoder().encode(label + "\0");
    renderBundleBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderBundleBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderBundleEncoderSetLabel(this._handle, ptr(stringView));
  }

  setPipeline(pipeline: GPURenderPipeline): undefined {
    const pipelineHandle = (pipeline as unknown as { handle: Pointer }).handle;
    getLib().wgpuRenderBundleEncoderSetPipeline(this._handle, pipelineHandle);
    return undefined;
  }

  setBindGroup(
    index: GPUIndex32,
    bindGroup: GPUBindGroup | null,
    dynamicOffsets?: Iterable<GPUBufferDynamicOffset>
  ): undefined {
    const groupHandle = bindGroup
      ? (bindGroup as unknown as { handle: Pointer }).handle
      : (0 as Pointer);

    const offsets = dynamicOffsets ? Array.from(dynamicOffsets) : [];
    let offsetsPtr: Pointer = 0 as Pointer;

    if (offsets.length > 0) {
      const offsetsBuffer = new Uint32Array(offsets);
      renderBundleBuffers.push(new Uint8Array(offsetsBuffer.buffer));
      offsetsPtr = ptr(offsetsBuffer) as Pointer;
    }

    getLib().wgpuRenderBundleEncoderSetBindGroup(
      this._handle,
      index,
      groupHandle,
      offsets.length,
      offsetsPtr
    );
    return undefined;
  }

  setVertexBuffer(
    slot: GPUIndex32,
    buffer: GPUBuffer | null,
    offset?: GPUSize64,
    size?: GPUSize64
  ): undefined {
    const bufferHandle = buffer
      ? (buffer as unknown as { handle: Pointer }).handle
      : (0 as Pointer);
    const bufferSize = buffer ? (buffer as unknown as { size: number }).size : 0;

    getLib().wgpuRenderBundleEncoderSetVertexBuffer(
      this._handle,
      slot,
      bufferHandle,
      Number(offset ?? 0),
      Number(size ?? bufferSize)
    );
    return undefined;
  }

  setIndexBuffer(
    buffer: GPUBuffer,
    indexFormat: GPUIndexFormat,
    offset?: GPUSize64,
    size?: GPUSize64
  ): undefined {
    const bufferHandle = (buffer as unknown as { handle: Pointer }).handle;
    const bufferSize = (buffer as unknown as { size: number }).size;

    // Map index format to native enum
    const formatMap: Record<string, number> = {
      uint16: 1,
      uint32: 2,
    };
    const format = formatMap[indexFormat] ?? 1;

    getLib().wgpuRenderBundleEncoderSetIndexBuffer(
      this._handle,
      bufferHandle,
      format,
      Number(offset ?? 0),
      Number(size ?? bufferSize)
    );
    return undefined;
  }

  draw(
    vertexCount: GPUSize32,
    instanceCount?: GPUSize32,
    firstVertex?: GPUSize32,
    firstInstance?: GPUSize32
  ): undefined {
    getLib().wgpuRenderBundleEncoderDraw(
      this._handle,
      vertexCount,
      instanceCount ?? 1,
      firstVertex ?? 0,
      firstInstance ?? 0
    );
    return undefined;
  }

  drawIndexed(
    indexCount: GPUSize32,
    instanceCount?: GPUSize32,
    firstIndex?: GPUSize32,
    baseVertex?: GPUSignedOffset32,
    firstInstance?: GPUSize32
  ): undefined {
    getLib().wgpuRenderBundleEncoderDrawIndexed(
      this._handle,
      indexCount,
      instanceCount ?? 1,
      firstIndex ?? 0,
      baseVertex ?? 0,
      firstInstance ?? 0
    );
    return undefined;
  }

  drawIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): undefined {
    const bufferHandle = (indirectBuffer as unknown as { handle: Pointer }).handle;
    getLib().wgpuRenderBundleEncoderDrawIndirect(
      this._handle,
      bufferHandle,
      Number(indirectOffset)
    );
    return undefined;
  }

  drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): undefined {
    const bufferHandle = (indirectBuffer as unknown as { handle: Pointer }).handle;
    getLib().wgpuRenderBundleEncoderDrawIndexedIndirect(
      this._handle,
      bufferHandle,
      Number(indirectOffset)
    );
    return undefined;
  }

  pushDebugGroup(groupLabel: string): undefined {
    const labelBytes = new TextEncoder().encode(groupLabel + "\0");
    renderBundleBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderBundleBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderBundleEncoderPushDebugGroup(this._handle, ptr(stringView));
    return undefined;
  }

  popDebugGroup(): undefined {
    getLib().wgpuRenderBundleEncoderPopDebugGroup(this._handle);
    return undefined;
  }

  insertDebugMarker(markerLabel: string): undefined {
    const labelBytes = new TextEncoder().encode(markerLabel + "\0");
    renderBundleBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderBundleBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderBundleEncoderInsertDebugMarker(this._handle, ptr(stringView));
    return undefined;
  }

  finish(descriptor?: GPURenderBundleDescriptor): GPURenderBundle {
    // WGPURenderBundleDescriptor (24 bytes):
    // offset 0:  nextInChain (ptr, 8)
    // offset 8:  label.data (ptr, 8)
    // offset 16: label.length (size_t, 8)

    let descPtr: Pointer = 0 as Pointer;

    if (descriptor?.label) {
      const desc = new Uint8Array(24);
      renderBundleBuffers.push(desc);
      const view = new DataView(desc.buffer);

      const labelBytes = new TextEncoder().encode(descriptor.label + "\0");
      renderBundleBuffers.push(labelBytes);
      const labelPtr = ptr(labelBytes) as unknown as number;

      view.setBigUint64(0, BigInt(0), true);         // nextInChain
      view.setBigUint64(8, BigInt(labelPtr), true);  // label.data
      view.setBigUint64(16, WGPU_STRLEN, true);      // label.length

      descPtr = ptr(desc) as Pointer;
    }

    const handle = getLib().wgpuRenderBundleEncoderFinish(this._handle, descPtr);
    return new GPURenderBundleImpl(handle as Pointer, descriptor?.label);
  }
}

export function createRenderBundleEncoderDescriptor(
  descriptor: GPURenderBundleEncoderDescriptor
): Uint8Array {
  // WGPURenderBundleEncoderDescriptor (56 bytes):
  // offset 0:  nextInChain (ptr, 8)
  // offset 8:  label.data (ptr, 8)
  // offset 16: label.length (size_t, 8)
  // offset 24: colorFormatCount (size_t, 8)
  // offset 32: colorFormats (ptr, 8)
  // offset 40: depthStencilFormat (u32, 4)
  // offset 44: sampleCount (u32, 4)
  // offset 48: depthReadOnly (u32, 4)
  // offset 52: stencilReadOnly (u32, 4)

  const desc = new Uint8Array(56);
  renderBundleBuffers.push(desc);
  const view = new DataView(desc.buffer);

  // Label encoding
  let labelPtr = 0;
  if (descriptor.label) {
    const labelBytes = new TextEncoder().encode(descriptor.label + "\0");
    renderBundleBuffers.push(labelBytes);
    labelPtr = ptr(labelBytes) as unknown as number;
  }

  // Color formats array
  const colorFormats = descriptor.colorFormats;
  const colorFormatsCount = colorFormats.length;
  let colorFormatsPtr = 0;

  if (colorFormatsCount > 0) {
    const formatsBuffer = new Uint32Array(colorFormatsCount);
    for (let i = 0; i < colorFormatsCount; i++) {
      const format = colorFormats[i];
      formatsBuffer[i] = format ? getTextureFormat(format) : 0;
    }
    renderBundleBuffers.push(new Uint8Array(formatsBuffer.buffer));
    colorFormatsPtr = ptr(formatsBuffer) as unknown as number;
  }

  view.setBigUint64(0, BigInt(0), true);                                             // nextInChain
  view.setBigUint64(8, BigInt(labelPtr), true);                                      // label.data
  view.setBigUint64(16, WGPU_STRLEN, true);                                          // label.length
  view.setBigUint64(24, BigInt(colorFormatsCount), true);                            // colorFormatCount
  view.setBigUint64(32, BigInt(colorFormatsPtr), true);                              // colorFormats
  view.setUint32(40, getTextureFormat(descriptor.depthStencilFormat ?? ("" as GPUTextureFormat)), true); // depthStencilFormat
  view.setUint32(44, descriptor.sampleCount ?? 1, true);                             // sampleCount
  view.setUint32(48, descriptor.depthReadOnly ? 1 : 0, true);                        // depthReadOnly
  view.setUint32(52, descriptor.stencilReadOnly ? 1 : 0, true);                      // stencilReadOnly

  return desc;
}

/**
 * Clear render bundle buffers to free memory
 */
export function clearRenderBundleBuffers(): void {
  renderBundleBuffers.length = 0;
}
