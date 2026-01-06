/**
 * Memory cleanup utilities for the WebGPU polyfill
 *
 * This module provides functions to release memory held by buffer arrays
 * that are used to prevent garbage collection of FFI data.
 */

import { clearShaderBuffers, clearPipelineBuffers } from "./objects/device";
import { clearTextureBuffers } from "./objects/texture";
import { clearRenderPassBuffers } from "./objects/render-pass";
import { clearEncoderBuffers } from "./objects/command-encoder";
import { clearSamplerBuffers } from "./objects/sampler";
import { clearQuerySetBuffers } from "./objects/query-set";
import { clearRenderBundleBuffers } from "./objects/render-bundle";
import { clearQueueBuffers } from "./objects/queue";

/**
 * Clear all memory buffers across all modules
 * Call this after submitting command buffers to release temporary memory
 */
export function clearAllBuffers(): void {
  clearShaderBuffers();
  clearPipelineBuffers();
  clearTextureBuffers();
  clearRenderPassBuffers();
  clearEncoderBuffers();
  clearSamplerBuffers();
  clearQuerySetBuffers();
  clearRenderBundleBuffers();
  clearQueueBuffers();
}

// Re-export individual cleanup functions for selective cleanup
export {
  clearShaderBuffers,
  clearPipelineBuffers,
  clearTextureBuffers,
  clearRenderPassBuffers,
  clearEncoderBuffers,
  clearSamplerBuffers,
  clearQuerySetBuffers,
  clearRenderBundleBuffers,
  clearQueueBuffers,
};
