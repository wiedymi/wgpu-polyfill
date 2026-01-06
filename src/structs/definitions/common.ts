/**
 * Common WGPU struct definitions
 */

import { defineStruct } from "../layout";

// WGPUStringView { data: *const char, length: size_t }
export const WGPUStringView = defineStruct("WGPUStringView", [
  { name: "data", type: "ptr" },
  { name: "length", type: "usize" },
]);

// WGPUChainedStruct { next: *WGPUChainedStruct, sType: WGPUSType }
export const WGPUChainedStruct = defineStruct("WGPUChainedStruct", [
  { name: "next", type: "ptr" },
  { name: "sType", type: "u32" },
]);

// WGPUChainedStructOut { next: *WGPUChainedStructOut, sType: WGPUSType }
export const WGPUChainedStructOut = defineStruct("WGPUChainedStructOut", [
  { name: "next", type: "ptr" },
  { name: "sType", type: "u32" },
]);

// WGPUColor { r: f64, g: f64, b: f64, a: f64 }
export const WGPUColor = defineStruct("WGPUColor", [
  { name: "r", type: "f64" },
  { name: "g", type: "f64" },
  { name: "b", type: "f64" },
  { name: "a", type: "f64" },
]);

// WGPUExtent3D { width: u32, height: u32, depthOrArrayLayers: u32 }
export const WGPUExtent3D = defineStruct("WGPUExtent3D", [
  { name: "width", type: "u32" },
  { name: "height", type: "u32" },
  { name: "depthOrArrayLayers", type: "u32" },
]);

// WGPUOrigin3D { x: u32, y: u32, z: u32 }
export const WGPUOrigin3D = defineStruct("WGPUOrigin3D", [
  { name: "x", type: "u32" },
  { name: "y", type: "u32" },
  { name: "z", type: "u32" },
]);

// WGPUFuture { id: u64 }
export const WGPUFuture = defineStruct("WGPUFuture", [{ name: "id", type: "u64" }]);

// WGPUFutureWaitInfo { future: WGPUFuture, completed: WGPUBool }
export const WGPUFutureWaitInfo = defineStruct("WGPUFutureWaitInfo", [
  { name: "future", type: { struct: WGPUFuture } },
  { name: "completed", type: "bool" },
]);

// WGPUInstanceCapabilities
export const WGPUInstanceCapabilities = defineStruct("WGPUInstanceCapabilities", [
  { name: "nextInChain", type: "ptr" },
  { name: "timedWaitAnyEnable", type: "bool" },
  { name: "timedWaitAnyMaxCount", type: "usize" },
]);

// WGPUInstanceDescriptor
export const WGPUInstanceDescriptor = defineStruct("WGPUInstanceDescriptor", [
  { name: "nextInChain", type: "ptr" },
  { name: "features", type: { struct: WGPUInstanceCapabilities } },
]);
