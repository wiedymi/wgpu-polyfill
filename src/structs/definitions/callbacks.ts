/**
 * WGPU callback info struct definitions
 */

import { defineStruct } from "../layout";

// WGPURequestAdapterCallbackInfo
export const WGPURequestAdapterCallbackInfo = defineStruct("WGPURequestAdapterCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" }, // WGPUCallbackMode
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPURequestDeviceCallbackInfo
export const WGPURequestDeviceCallbackInfo = defineStruct("WGPURequestDeviceCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUBufferMapCallbackInfo
export const WGPUBufferMapCallbackInfo = defineStruct("WGPUBufferMapCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUQueueWorkDoneCallbackInfo
export const WGPUQueueWorkDoneCallbackInfo = defineStruct("WGPUQueueWorkDoneCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUDeviceLostCallbackInfo
export const WGPUDeviceLostCallbackInfo = defineStruct("WGPUDeviceLostCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUUncapturedErrorCallbackInfo
export const WGPUUncapturedErrorCallbackInfo = defineStruct("WGPUUncapturedErrorCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUPopErrorScopeCallbackInfo
export const WGPUPopErrorScopeCallbackInfo = defineStruct("WGPUPopErrorScopeCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUCompilationInfoCallbackInfo
export const WGPUCompilationInfoCallbackInfo = defineStruct("WGPUCompilationInfoCallbackInfo", [
  { name: "nextInChain", type: "ptr" },
  { name: "mode", type: "u32" },
  { name: "callback", type: "ptr" },
  { name: "userdata1", type: "ptr" },
  { name: "userdata2", type: "ptr" },
]);

// WGPUCreateComputePipelineAsyncCallbackInfo
export const WGPUCreateComputePipelineAsyncCallbackInfo = defineStruct(
  "WGPUCreateComputePipelineAsyncCallbackInfo",
  [
    { name: "nextInChain", type: "ptr" },
    { name: "mode", type: "u32" },
    { name: "callback", type: "ptr" },
    { name: "userdata1", type: "ptr" },
    { name: "userdata2", type: "ptr" },
  ]
);

// WGPUCreateRenderPipelineAsyncCallbackInfo
export const WGPUCreateRenderPipelineAsyncCallbackInfo = defineStruct(
  "WGPUCreateRenderPipelineAsyncCallbackInfo",
  [
    { name: "nextInChain", type: "ptr" },
    { name: "mode", type: "u32" },
    { name: "callback", type: "ptr" },
    { name: "userdata1", type: "ptr" },
    { name: "userdata2", type: "ptr" },
  ]
);
