/**
 * Validation utilities for better error messages
 */

import type { Pointer } from "./ffi/types";

/**
 * Validates that a handle is not null/undefined
 */
export function validateHandle(handle: Pointer | null | undefined, objectType: string): asserts handle is Pointer {
  if (!handle) {
    throw new GPUValidationError(`Failed to create ${objectType}: native handle is null`);
  }
}

/**
 * Validates buffer size is valid
 */
export function validateBufferSize(size: number, label?: string): void {
  if (size <= 0) {
    throw new GPUValidationError(
      `Buffer size must be positive, got ${size}${label ? ` for buffer "${label}"` : ""}`
    );
  }
  if (size > 268435456) { // maxBufferSize
    throw new GPUValidationError(
      `Buffer size ${size} exceeds maxBufferSize (268435456)${label ? ` for buffer "${label}"` : ""}`
    );
  }
}

/**
 * Validates buffer usage flags
 */
export function validateBufferUsage(usage: number, label?: string): void {
  const validFlags = 0x3FF; // All valid buffer usage flags combined
  if ((usage & ~validFlags) !== 0) {
    throw new GPUValidationError(
      `Invalid buffer usage flags: ${usage.toString(16)}${label ? ` for buffer "${label}"` : ""}`
    );
  }
  if (usage === 0) {
    throw new GPUValidationError(
      `Buffer usage cannot be 0${label ? ` for buffer "${label}"` : ""}`
    );
  }

  // MAP_READ and MAP_WRITE cannot both be set
  const MAP_READ = 0x0001;
  const MAP_WRITE = 0x0002;
  if ((usage & MAP_READ) && (usage & MAP_WRITE)) {
    throw new GPUValidationError(
      `Buffer cannot have both MAP_READ and MAP_WRITE usage${label ? ` for buffer "${label}"` : ""}`
    );
  }
}

/**
 * Validates texture dimensions
 */
export function validateTextureDimensions(
  width: number,
  height: number,
  depthOrArrayLayers: number,
  dimension: string,
  label?: string
): void {
  const prefix = label ? ` for texture "${label}"` : "";

  if (width <= 0 || height <= 0 || depthOrArrayLayers <= 0) {
    throw new GPUValidationError(
      `Texture dimensions must be positive: ${width}x${height}x${depthOrArrayLayers}${prefix}`
    );
  }

  const limits = {
    "1d": { maxWidth: 8192, maxHeight: 1, maxDepth: 1 },
    "2d": { maxWidth: 8192, maxHeight: 8192, maxDepth: 256 },
    "3d": { maxWidth: 2048, maxHeight: 2048, maxDepth: 2048 },
  };

  const limit = limits[dimension as keyof typeof limits] ?? limits["2d"];

  if (width > limit.maxWidth) {
    throw new GPUValidationError(
      `Texture width ${width} exceeds maximum ${limit.maxWidth} for ${dimension} texture${prefix}`
    );
  }
  if (height > limit.maxHeight) {
    throw new GPUValidationError(
      `Texture height ${height} exceeds maximum ${limit.maxHeight} for ${dimension} texture${prefix}`
    );
  }
  if (depthOrArrayLayers > limit.maxDepth) {
    throw new GPUValidationError(
      `Texture depth/layers ${depthOrArrayLayers} exceeds maximum ${limit.maxDepth} for ${dimension} texture${prefix}`
    );
  }
}

/**
 * Validates texture usage flags
 */
export function validateTextureUsage(usage: number, label?: string): void {
  const validFlags = 0x1F; // All valid texture usage flags combined
  if ((usage & ~validFlags) !== 0) {
    throw new GPUValidationError(
      `Invalid texture usage flags: ${usage.toString(16)}${label ? ` for texture "${label}"` : ""}`
    );
  }
  if (usage === 0) {
    throw new GPUValidationError(
      `Texture usage cannot be 0${label ? ` for texture "${label}"` : ""}`
    );
  }
}

/**
 * Validates shader stage flags
 */
export function validateShaderStage(stage: number, context: string): void {
  const validFlags = 0x7; // VERTEX | FRAGMENT | COMPUTE
  if ((stage & ~validFlags) !== 0) {
    throw new GPUValidationError(
      `Invalid shader stage flags: ${stage.toString(16)} in ${context}`
    );
  }
  if (stage === 0) {
    throw new GPUValidationError(
      `Shader stage flags cannot be 0 in ${context}`
    );
  }
}

/**
 * Validates bind group index
 */
export function validateBindGroupIndex(index: number, maxBindGroups: number = 4): void {
  if (index < 0 || index >= maxBindGroups) {
    throw new GPUValidationError(
      `Bind group index ${index} out of range [0, ${maxBindGroups - 1}]`
    );
  }
}

/**
 * Validates vertex buffer slot
 */
export function validateVertexBufferSlot(slot: number, maxVertexBuffers: number = 8): void {
  if (slot < 0 || slot >= maxVertexBuffers) {
    throw new GPUValidationError(
      `Vertex buffer slot ${slot} out of range [0, ${maxVertexBuffers - 1}]`
    );
  }
}

/**
 * Validates workgroup dispatch sizes
 */
export function validateWorkgroupDispatch(x: number, y: number, z: number): void {
  const maxPerDimension = 65535;

  if (x <= 0 || y <= 0 || z <= 0) {
    throw new GPUValidationError(
      `Workgroup counts must be positive: (${x}, ${y}, ${z})`
    );
  }

  if (x > maxPerDimension || y > maxPerDimension || z > maxPerDimension) {
    throw new GPUValidationError(
      `Workgroup count exceeds maxComputeWorkgroupsPerDimension (${maxPerDimension}): (${x}, ${y}, ${z})`
    );
  }
}

/**
 * Validates color attachment count
 */
export function validateColorAttachmentCount(count: number, maxColorAttachments: number = 8): void {
  if (count > maxColorAttachments) {
    throw new GPUValidationError(
      `Color attachment count ${count} exceeds maxColorAttachments (${maxColorAttachments})`
    );
  }
}

/**
 * Validates that required fields are present
 */
export function validateRequired<T>(value: T | undefined | null, fieldName: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new GPUValidationError(`Required field "${fieldName}" is missing`);
  }
}

/**
 * Formats an error message with optional context
 */
export function formatError(message: string, context?: Record<string, unknown>): string {
  if (!context || Object.keys(context).length === 0) {
    return message;
  }

  const contextStr = Object.entries(context)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(", ");

  return contextStr ? `${message} (${contextStr})` : message;
}
