/**
 * wgpu-native function signatures for Bun FFI
 */

import type { FFIFunction } from "bun:ffi";

// FFI type shorthands
type ptr = "ptr";
type void_ = "void";
type u32 = "u32";
type u64 = "u64";
type usize = "usize";
type bool_ = "bool";

const ptr: ptr = "ptr";
const void_: void_ = "void";
const u32: u32 = "u32";
const u64: u64 = "u64";
const usize: usize = "usize";
const bool_: bool_ = "bool";

export const symbols = {
  // Instance
  wgpuCreateInstance: {
    args: [ptr] as const, // descriptor
    returns: ptr,
  },
  wgpuInstanceRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuInstanceAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuInstanceRequestAdapter: {
    args: [ptr, ptr, ptr] as const, // instance, options, callbackInfo (passed by value as ptr to struct)
    returns: u64, // WGPUFuture.id
  },
  wgpuInstanceProcessEvents: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuInstanceWaitAny: {
    args: [ptr, usize, ptr, u64] as const, // instance, futureCount, futures, timeoutNS
    returns: u32, // WGPUWaitStatus
  },

  // Adapter
  wgpuAdapterRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuAdapterAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuAdapterGetInfo: {
    args: [ptr, ptr] as const, // adapter, info
    returns: u32, // WGPUStatus
  },
  wgpuAdapterGetLimits: {
    args: [ptr, ptr] as const, // adapter, limits
    returns: u32, // WGPUStatus
  },
  wgpuAdapterGetFeatures: {
    args: [ptr, ptr] as const, // adapter, features
    returns: void_,
  },
  wgpuAdapterHasFeature: {
    args: [ptr, u32] as const, // adapter, feature
    returns: u32, // WGPUBool
  },
  wgpuAdapterRequestDevice: {
    args: [ptr, ptr, ptr] as const, // adapter, descriptor, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuAdapterInfoFreeMembers: {
    args: [ptr] as const, // adapterInfo (passed by value)
    returns: void_,
  },

  // Device
  wgpuDeviceRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuDeviceAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuDeviceDestroy: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuDeviceGetQueue: {
    args: [ptr] as const,
    returns: ptr,
  },
  wgpuDeviceGetLimits: {
    args: [ptr, ptr] as const, // device, limits
    returns: u32,
  },
  wgpuDeviceGetFeatures: {
    args: [ptr, ptr] as const, // device, features
    returns: void_,
  },
  wgpuDeviceHasFeature: {
    args: [ptr, u32] as const, // device, feature
    returns: u32,
  },
  wgpuDeviceCreateBuffer: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateTexture: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateSampler: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateShaderModule: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateBindGroup: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateBindGroupLayout: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreatePipelineLayout: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateComputePipeline: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateComputePipelineAsync: {
    args: [ptr, ptr, ptr] as const, // device, descriptor, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuDeviceCreateRenderPipeline: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDeviceCreateRenderPipelineAsync: {
    args: [ptr, ptr, ptr] as const, // device, descriptor, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuDeviceCreateCommandEncoder: {
    args: [ptr, ptr] as const, // device, descriptor (nullable)
    returns: ptr,
  },
  wgpuDeviceCreateQuerySet: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuDevicePushErrorScope: {
    args: [ptr, u32] as const, // device, filter
    returns: void_,
  },
  wgpuDevicePopErrorScope: {
    args: [ptr, ptr] as const, // device, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuDeviceSetLabel: {
    args: [ptr, ptr] as const, // device, label (WGPUStringView passed as ptr)
    returns: void_,
  },

  // Queue
  wgpuQueueRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuQueueAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuQueueSubmit: {
    args: [ptr, usize, ptr] as const, // queue, commandCount, commands
    returns: void_,
  },
  wgpuQueueWriteBuffer: {
    args: [ptr, ptr, u64, ptr, usize] as const, // queue, buffer, offset, data, size
    returns: void_,
  },
  wgpuQueueWriteTexture: {
    args: [ptr, ptr, ptr, usize, ptr, ptr] as const, // queue, destination, data, dataSize, dataLayout, writeSize
    returns: void_,
  },
  wgpuQueueOnSubmittedWorkDone: {
    args: [ptr, ptr] as const, // queue, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuQueueSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // Buffer
  wgpuBufferRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBufferAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBufferDestroy: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBufferMapAsync: {
    args: [ptr, u32, usize, usize, ptr] as const, // buffer, mode, offset, size, callbackInfo
    returns: u64, // WGPUFuture.id
  },
  wgpuBufferGetMappedRange: {
    args: [ptr, usize, usize] as const, // buffer, offset, size
    returns: ptr,
  },
  wgpuBufferGetConstMappedRange: {
    args: [ptr, usize, usize] as const, // buffer, offset, size
    returns: ptr,
  },
  wgpuBufferUnmap: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBufferGetSize: {
    args: [ptr] as const,
    returns: u64,
  },
  wgpuBufferGetUsage: {
    args: [ptr] as const,
    returns: u32, // WGPUBufferUsage flags
  },
  wgpuBufferGetMapState: {
    args: [ptr] as const,
    returns: u32, // WGPUBufferMapState
  },
  wgpuBufferSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // Texture
  wgpuTextureRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuTextureAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuTextureDestroy: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuTextureCreateView: {
    args: [ptr, ptr] as const, // texture, descriptor
    returns: ptr,
  },
  wgpuTextureGetWidth: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetHeight: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetDepthOrArrayLayers: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetMipLevelCount: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetSampleCount: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetFormat: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureGetUsage: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuTextureSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // TextureView
  wgpuTextureViewRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuTextureViewAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuTextureViewSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // Sampler
  wgpuSamplerRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuSamplerAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuSamplerSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // ShaderModule
  wgpuShaderModuleRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuShaderModuleAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuShaderModuleGetCompilationInfo: {
    args: [ptr, ptr] as const, // module, callbackInfo
    returns: u64,
  },
  wgpuShaderModuleSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // BindGroup
  wgpuBindGroupRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBindGroupAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBindGroupSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // BindGroupLayout
  wgpuBindGroupLayoutRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBindGroupLayoutAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuBindGroupLayoutSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // PipelineLayout
  wgpuPipelineLayoutRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuPipelineLayoutAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuPipelineLayoutSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // ComputePipeline
  wgpuComputePipelineRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePipelineAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePipelineGetBindGroupLayout: {
    args: [ptr, u32] as const, // pipeline, groupIndex
    returns: ptr,
  },
  wgpuComputePipelineSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // RenderPipeline
  wgpuRenderPipelineRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPipelineAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPipelineGetBindGroupLayout: {
    args: [ptr, u32] as const, // pipeline, groupIndex
    returns: ptr,
  },
  wgpuRenderPipelineSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // CommandEncoder
  wgpuCommandEncoderRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuCommandEncoderAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuCommandEncoderBeginComputePass: {
    args: [ptr, ptr] as const, // encoder, descriptor
    returns: ptr,
  },
  wgpuCommandEncoderBeginRenderPass: {
    args: [ptr, ptr] as const, // encoder, descriptor
    returns: ptr,
  },
  wgpuCommandEncoderCopyBufferToBuffer: {
    args: [ptr, ptr, u64, ptr, u64, u64] as const, // encoder, src, srcOffset, dst, dstOffset, size
    returns: void_,
  },
  wgpuCommandEncoderCopyBufferToTexture: {
    args: [ptr, ptr, ptr, ptr] as const, // encoder, source, destination, copySize
    returns: void_,
  },
  wgpuCommandEncoderCopyTextureToBuffer: {
    args: [ptr, ptr, ptr, ptr] as const, // encoder, source, destination, copySize
    returns: void_,
  },
  wgpuCommandEncoderCopyTextureToTexture: {
    args: [ptr, ptr, ptr, ptr] as const, // encoder, source, destination, copySize
    returns: void_,
  },
  wgpuCommandEncoderClearBuffer: {
    args: [ptr, ptr, u64, u64] as const, // encoder, buffer, offset, size
    returns: void_,
  },
  wgpuCommandEncoderFinish: {
    args: [ptr, ptr] as const, // encoder, descriptor
    returns: ptr,
  },
  wgpuCommandEncoderInsertDebugMarker: {
    args: [ptr, ptr] as const, // encoder, markerLabel
    returns: void_,
  },
  wgpuCommandEncoderPopDebugGroup: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuCommandEncoderPushDebugGroup: {
    args: [ptr, ptr] as const, // encoder, groupLabel
    returns: void_,
  },
  wgpuCommandEncoderResolveQuerySet: {
    args: [ptr, ptr, u32, u32, ptr, u64] as const, // encoder, querySet, firstQuery, queryCount, destination, destinationOffset
    returns: void_,
  },
  wgpuCommandEncoderSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuCommandEncoderWriteTimestamp: {
    args: [ptr, ptr, u32] as const, // encoder, querySet, queryIndex
    returns: void_,
  },

  // CommandBuffer
  wgpuCommandBufferRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuCommandBufferAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuCommandBufferSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // ComputePassEncoder
  wgpuComputePassEncoderRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderSetPipeline: {
    args: [ptr, ptr] as const, // pass, pipeline
    returns: void_,
  },
  wgpuComputePassEncoderSetBindGroup: {
    args: [ptr, u32, ptr, usize, ptr] as const, // pass, groupIndex, group, dynamicOffsetCount, dynamicOffsets
    returns: void_,
  },
  wgpuComputePassEncoderDispatchWorkgroups: {
    args: [ptr, u32, u32, u32] as const, // pass, x, y, z
    returns: void_,
  },
  wgpuComputePassEncoderDispatchWorkgroupsIndirect: {
    args: [ptr, ptr, u64] as const, // pass, indirectBuffer, indirectOffset
    returns: void_,
  },
  wgpuComputePassEncoderEnd: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderInsertDebugMarker: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderPopDebugGroup: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderPushDebugGroup: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuComputePassEncoderSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // RenderPassEncoder
  wgpuRenderPassEncoderRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderSetPipeline: {
    args: [ptr, ptr] as const, // pass, pipeline
    returns: void_,
  },
  wgpuRenderPassEncoderSetBindGroup: {
    args: [ptr, u32, ptr, usize, ptr] as const, // pass, groupIndex, group, dynamicOffsetCount, dynamicOffsets
    returns: void_,
  },
  wgpuRenderPassEncoderSetVertexBuffer: {
    args: [ptr, u32, ptr, u64, u64] as const, // pass, slot, buffer, offset, size
    returns: void_,
  },
  wgpuRenderPassEncoderSetIndexBuffer: {
    args: [ptr, ptr, u32, u64, u64] as const, // pass, buffer, format, offset, size
    returns: void_,
  },
  wgpuRenderPassEncoderDraw: {
    args: [ptr, u32, u32, u32, u32] as const, // pass, vertexCount, instanceCount, firstVertex, firstInstance
    returns: void_,
  },
  wgpuRenderPassEncoderDrawIndexed: {
    args: [ptr, u32, u32, u32, "i32", u32] as const, // pass, indexCount, instanceCount, firstIndex, baseVertex, firstInstance
    returns: void_,
  },
  wgpuRenderPassEncoderDrawIndirect: {
    args: [ptr, ptr, u64] as const, // pass, indirectBuffer, indirectOffset
    returns: void_,
  },
  wgpuRenderPassEncoderDrawIndexedIndirect: {
    args: [ptr, ptr, u64] as const, // pass, indirectBuffer, indirectOffset
    returns: void_,
  },
  wgpuRenderPassEncoderEnd: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderSetViewport: {
    args: [ptr, "f32", "f32", "f32", "f32", "f32", "f32"] as const, // pass, x, y, width, height, minDepth, maxDepth
    returns: void_,
  },
  wgpuRenderPassEncoderSetScissorRect: {
    args: [ptr, u32, u32, u32, u32] as const, // pass, x, y, width, height
    returns: void_,
  },
  wgpuRenderPassEncoderSetBlendConstant: {
    args: [ptr, ptr] as const, // pass, color
    returns: void_,
  },
  wgpuRenderPassEncoderSetStencilReference: {
    args: [ptr, u32] as const, // pass, reference
    returns: void_,
  },
  wgpuRenderPassEncoderInsertDebugMarker: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderPopDebugGroup: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderPushDebugGroup: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuRenderPassEncoderExecuteBundles: {
    args: [ptr, usize, ptr] as const, // pass, bundleCount, bundles
    returns: void_,
  },
  wgpuRenderPassEncoderBeginOcclusionQuery: {
    args: [ptr, u32] as const, // pass, queryIndex
    returns: void_,
  },
  wgpuRenderPassEncoderEndOcclusionQuery: {
    args: [ptr] as const, // pass
    returns: void_,
  },

  // QuerySet
  wgpuQuerySetRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuQuerySetAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuQuerySetDestroy: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuQuerySetGetCount: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuQuerySetGetType: {
    args: [ptr] as const,
    returns: u32,
  },
  wgpuQuerySetSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // RenderBundle
  wgpuRenderBundleRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },

  // RenderBundleEncoder
  wgpuDeviceCreateRenderBundleEncoder: {
    args: [ptr, ptr] as const, // device, descriptor
    returns: ptr,
  },
  wgpuRenderBundleEncoderRelease: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleEncoderAddRef: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleEncoderSetPipeline: {
    args: [ptr, ptr] as const, // encoder, pipeline
    returns: void_,
  },
  wgpuRenderBundleEncoderSetBindGroup: {
    args: [ptr, u32, ptr, usize, ptr] as const, // encoder, groupIndex, group, dynamicOffsetCount, dynamicOffsets
    returns: void_,
  },
  wgpuRenderBundleEncoderSetVertexBuffer: {
    args: [ptr, u32, ptr, u64, u64] as const, // encoder, slot, buffer, offset, size
    returns: void_,
  },
  wgpuRenderBundleEncoderSetIndexBuffer: {
    args: [ptr, ptr, u32, u64, u64] as const, // encoder, buffer, format, offset, size
    returns: void_,
  },
  wgpuRenderBundleEncoderDraw: {
    args: [ptr, u32, u32, u32, u32] as const, // encoder, vertexCount, instanceCount, firstVertex, firstInstance
    returns: void_,
  },
  wgpuRenderBundleEncoderDrawIndexed: {
    args: [ptr, u32, u32, u32, "i32", u32] as const, // encoder, indexCount, instanceCount, firstIndex, baseVertex, firstInstance
    returns: void_,
  },
  wgpuRenderBundleEncoderDrawIndirect: {
    args: [ptr, ptr, u64] as const, // encoder, indirectBuffer, indirectOffset
    returns: void_,
  },
  wgpuRenderBundleEncoderDrawIndexedIndirect: {
    args: [ptr, ptr, u64] as const, // encoder, indirectBuffer, indirectOffset
    returns: void_,
  },
  wgpuRenderBundleEncoderFinish: {
    args: [ptr, ptr] as const, // encoder, descriptor
    returns: ptr,
  },
  wgpuRenderBundleEncoderInsertDebugMarker: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleEncoderPopDebugGroup: {
    args: [ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleEncoderPushDebugGroup: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
  wgpuRenderBundleEncoderSetLabel: {
    args: [ptr, ptr] as const,
    returns: void_,
  },
} satisfies Record<string, FFIFunction>;

export type WGPUSymbols = typeof symbols;
