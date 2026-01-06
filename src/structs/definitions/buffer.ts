/**
 * Buffer related struct definitions
 */

import { defineStruct } from "../layout";
import { WGPUStringView } from "./common";

// WGPUBufferDescriptor
export const WGPUBufferDescriptor = defineStruct("WGPUBufferDescriptor", [
  { name: "nextInChain", type: "ptr" },
  { name: "label", type: { struct: WGPUStringView } },
  { name: "usage", type: "u64" }, // WGPUBufferUsage flags
  { name: "size", type: "u64" },
  { name: "mappedAtCreation", type: "bool" },
]);

// WGPUCommandEncoderDescriptor
export const WGPUCommandEncoderDescriptor = defineStruct("WGPUCommandEncoderDescriptor", [
  { name: "nextInChain", type: "ptr" },
  { name: "label", type: { struct: WGPUStringView } },
]);

// WGPUCommandBufferDescriptor
export const WGPUCommandBufferDescriptor = defineStruct("WGPUCommandBufferDescriptor", [
  { name: "nextInChain", type: "ptr" },
  { name: "label", type: { struct: WGPUStringView } },
]);

// WGPUComputePassTimestampWrites
export const WGPUComputePassTimestampWrites = defineStruct("WGPUComputePassTimestampWrites", [
  { name: "querySet", type: "ptr" },
  { name: "beginningOfPassWriteIndex", type: "u32" },
  { name: "endOfPassWriteIndex", type: "u32" },
]);

// WGPUComputePassDescriptor
export const WGPUComputePassDescriptor = defineStruct("WGPUComputePassDescriptor", [
  { name: "nextInChain", type: "ptr" },
  { name: "label", type: { struct: WGPUStringView } },
  { name: "timestampWrites", type: "ptr" }, // *WGPUComputePassTimestampWrites (nullable)
]);

// WGPUTexelCopyBufferLayout
export const WGPUTexelCopyBufferLayout = defineStruct("WGPUTexelCopyBufferLayout", [
  { name: "offset", type: "u64" },
  { name: "bytesPerRow", type: "u32" },
  { name: "rowsPerImage", type: "u32" },
]);

// WGPUTexelCopyBufferInfo
export const WGPUTexelCopyBufferInfo = defineStruct("WGPUTexelCopyBufferInfo", [
  { name: "layout", type: { struct: WGPUTexelCopyBufferLayout } },
  { name: "buffer", type: "ptr" },
]);
