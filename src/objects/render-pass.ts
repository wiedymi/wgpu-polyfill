/**
 * GPURenderPassEncoder implementation
 */

import { ptr } from "bun:ffi";
import { GPUObjectBase } from "./base";
import { getLib, type Pointer } from "../ffi";
import { WGPU_STRLEN } from "../ffi/types";

// Global buffer storage to prevent GC issues
const renderPassBuffers: Uint8Array[] = [];

export class GPURenderPassEncoderImpl extends GPUObjectBase implements GPURenderPassEncoder {
  readonly __brand = "GPURenderPassEncoder";
  private _ended = false;

  constructor(handle: Pointer, label?: string) {
    super(handle, label);
  }

  protected releaseImpl(): void {
    getLib().wgpuRenderPassEncoderRelease(this._handle);
  }

  protected setLabelImpl(label: string): void {
    const labelBytes = new TextEncoder().encode(label + "\0");
    renderPassBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderPassBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderPassEncoderSetLabel(this._handle, ptr(stringView));
  }

  setPipeline(pipeline: GPURenderPipeline): undefined {
    const pipelineHandle = (pipeline as unknown as { handle: Pointer }).handle;
    getLib().wgpuRenderPassEncoderSetPipeline(this._handle, pipelineHandle);
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
      renderPassBuffers.push(new Uint8Array(offsetsBuffer.buffer));
      offsetsPtr = ptr(offsetsBuffer) as Pointer;
    }

    getLib().wgpuRenderPassEncoderSetBindGroup(
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

    getLib().wgpuRenderPassEncoderSetVertexBuffer(
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
      "uint16": 1,
      "uint32": 2,
    };
    const format = formatMap[indexFormat] ?? 1;

    getLib().wgpuRenderPassEncoderSetIndexBuffer(
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
    getLib().wgpuRenderPassEncoderDraw(
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
    getLib().wgpuRenderPassEncoderDrawIndexed(
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
    getLib().wgpuRenderPassEncoderDrawIndirect(
      this._handle,
      bufferHandle,
      Number(indirectOffset)
    );
    return undefined;
  }

  drawIndexedIndirect(indirectBuffer: GPUBuffer, indirectOffset: GPUSize64): undefined {
    const bufferHandle = (indirectBuffer as unknown as { handle: Pointer }).handle;
    getLib().wgpuRenderPassEncoderDrawIndexedIndirect(
      this._handle,
      bufferHandle,
      Number(indirectOffset)
    );
    return undefined;
  }

  setViewport(
    x: number,
    y: number,
    width: number,
    height: number,
    minDepth: number,
    maxDepth: number
  ): undefined {
    getLib().wgpuRenderPassEncoderSetViewport(
      this._handle,
      x,
      y,
      width,
      height,
      minDepth,
      maxDepth
    );
    return undefined;
  }

  setScissorRect(x: GPUIntegerCoordinate, y: GPUIntegerCoordinate, width: GPUIntegerCoordinate, height: GPUIntegerCoordinate): undefined {
    getLib().wgpuRenderPassEncoderSetScissorRect(this._handle, x, y, width, height);
    return undefined;
  }

  setBlendConstant(color: GPUColor): undefined {
    // WGPUColor (32 bytes): 4 doubles
    const colorBuffer = new Float64Array([
      typeof color === "object" && "r" in color ? color.r : (color as number[])[0],
      typeof color === "object" && "g" in color ? color.g : (color as number[])[1],
      typeof color === "object" && "b" in color ? color.b : (color as number[])[2],
      typeof color === "object" && "a" in color ? color.a : (color as number[])[3],
    ]);
    renderPassBuffers.push(new Uint8Array(colorBuffer.buffer));
    getLib().wgpuRenderPassEncoderSetBlendConstant(this._handle, ptr(colorBuffer));
    return undefined;
  }

  setStencilReference(reference: GPUStencilValue): undefined {
    getLib().wgpuRenderPassEncoderSetStencilReference(this._handle, reference);
    return undefined;
  }

  beginOcclusionQuery(queryIndex: GPUSize32): undefined {
    getLib().wgpuRenderPassEncoderBeginOcclusionQuery(this._handle, queryIndex);
    return undefined;
  }

  endOcclusionQuery(): undefined {
    getLib().wgpuRenderPassEncoderEndOcclusionQuery(this._handle);
    return undefined;
  }

  executeBundles(bundles: Iterable<GPURenderBundle>): undefined {
    const bundleArray = Array.from(bundles);
    if (bundleArray.length === 0) return undefined;

    const handles = bundleArray.map((b) => (b as unknown as { handle: Pointer }).handle);
    const handlesBuffer = new BigUint64Array(handles.map((h) => BigInt(h as unknown as number)));
    renderPassBuffers.push(new Uint8Array(handlesBuffer.buffer));

    getLib().wgpuRenderPassEncoderExecuteBundles(
      this._handle,
      bundleArray.length,
      ptr(handlesBuffer)
    );
    return undefined;
  }

  pushDebugGroup(groupLabel: string): undefined {
    const labelBytes = new TextEncoder().encode(groupLabel + "\0");
    renderPassBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderPassBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderPassEncoderPushDebugGroup(this._handle, ptr(stringView));
    return undefined;
  }

  popDebugGroup(): undefined {
    getLib().wgpuRenderPassEncoderPopDebugGroup(this._handle);
    return undefined;
  }

  insertDebugMarker(markerLabel: string): undefined {
    const labelBytes = new TextEncoder().encode(markerLabel + "\0");
    renderPassBuffers.push(labelBytes);
    const labelPtr = ptr(labelBytes) as unknown as number;

    const stringView = new Uint8Array(16);
    renderPassBuffers.push(stringView);
    const view = new DataView(stringView.buffer);
    view.setBigUint64(0, BigInt(labelPtr), true);
    view.setBigUint64(8, WGPU_STRLEN, true);

    getLib().wgpuRenderPassEncoderInsertDebugMarker(this._handle, ptr(stringView));
    return undefined;
  }

  end(): undefined {
    if (this._ended) return undefined;
    this._ended = true;
    getLib().wgpuRenderPassEncoderEnd(this._handle);
    return undefined;
  }
}

/**
 * Clear render pass buffers to free memory
 */
export function clearRenderPassBuffers(): void {
  renderPassBuffers.length = 0;
}
