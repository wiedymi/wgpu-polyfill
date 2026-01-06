/**
 * Polling utilities for processing wgpu-native events
 */

import { getLib, type Pointer } from "../ffi";

/**
 * Process events on an instance to dispatch callbacks
 */
export function processEvents(instance: Pointer): void {
  const lib = getLib();
  lib.wgpuInstanceProcessEvents(instance);
}

/**
 * Wait for a future with timeout
 * @param instance The WGPUInstance
 * @param futureId The future ID to wait for
 * @param timeoutNs Timeout in nanoseconds (0 = no wait, just poll)
 * @returns WGPUWaitStatus
 */
export function waitAny(instance: Pointer, futureId: bigint, timeoutNs: bigint = 0n): number {
  const lib = getLib();

  // Create WGPUFutureWaitInfo struct
  const buffer = new ArrayBuffer(16); // WGPUFuture (8 bytes) + WGPUBool (4 bytes) + padding
  const view = new DataView(buffer);
  view.setBigUint64(0, futureId, true); // future.id
  view.setUint32(8, 0, true); // completed = false

  const { ptr } = require("bun:ffi");
  const futuresPtr = ptr(new Uint8Array(buffer));

  const status = lib.wgpuInstanceWaitAny(instance, 1, futuresPtr, timeoutNs);

  return status;
}

/**
 * Poll for callbacks by processing events repeatedly
 * Useful for waiting on async operations without blocking
 */
export async function pollUntilComplete<T>(
  instance: Pointer,
  promise: Promise<T>,
  options: {
    maxIterations?: number;
    intervalMs?: number;
  } = {}
): Promise<T> {
  const { maxIterations = 10000, intervalMs = 1 } = options;
  const lib = getLib();

  let iterations = 0;
  let resolved = false;
  let result: T;
  let error: Error | null = null;

  promise
    .then((r) => {
      resolved = true;
      result = r;
    })
    .catch((e) => {
      resolved = true;
      error = e;
    });

  while (!resolved && iterations < maxIterations) {
    // Process events to dispatch callbacks
    lib.wgpuInstanceProcessEvents(instance);

    // Yield to event loop
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    iterations++;
  }

  if (!resolved) {
    throw new Error(`Polling timed out after ${iterations} iterations`);
  }

  if (error) {
    throw error;
  }

  return result!;
}

/**
 * Simple async sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
