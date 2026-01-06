/**
 * FFI bindings loader for wgpu-native
 */

import { dlopen, ptr, toArrayBuffer, toBuffer, CString } from "bun:ffi";
import { symbols, type WGPUSymbols } from "./symbols";
import type { Pointer } from "./types";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Get library path based on platform
function getLibraryPath(): string {
  const platform = process.platform;
  const arch = process.arch;

  const platformMap: Record<string, string> = {
    "darwin-arm64": "darwin-arm64/lib/libwgpu_native.dylib",
    "darwin-x64": "darwin-x64/lib/libwgpu_native.dylib",
    "linux-x64": "linux-x64/lib/libwgpu_native.so",
    "win32-x64": "win32-x64/lib/wgpu_native.dll",
  };

  const key = `${platform}-${arch}`;
  const relativePath = platformMap[key];

  if (!relativePath) {
    throw new Error(`Unsupported platform: ${key}`);
  }

  // Resolve path relative to this module
  const __dirname = dirname(fileURLToPath(import.meta.url));
  return join(__dirname, "..", "..", "lib", relativePath);
}

// Loaded library singleton
let lib: ReturnType<typeof dlopen<WGPUSymbols>> | null = null;

/**
 * Get or load the wgpu-native library
 */
export function getLib() {
  if (!lib) {
    const libPath = getLibraryPath();
    lib = dlopen(libPath, symbols);
  }
  return lib.symbols;
}

/**
 * Memory utilities for working with native pointers
 */
export const memory = {
  /**
   * Allocate a buffer and return its pointer
   */
  alloc(size: number): { buffer: ArrayBuffer; ptr: Pointer } {
    const buffer = new ArrayBuffer(size);
    const uint8 = new Uint8Array(buffer);
    return { buffer, ptr: ptr(uint8) as Pointer };
  },

  /**
   * Create a view of native memory as ArrayBuffer
   */
  view(pointer: Pointer, size: number): ArrayBuffer {
    return toArrayBuffer(pointer, 0, size);
  },

  /**
   * Create a Buffer view of native memory
   */
  viewBuffer(pointer: Pointer, size: number): Buffer {
    return toBuffer(pointer, 0, size);
  },

  /**
   * Read a null-terminated C string from a pointer
   */
  readCString(pointer: Pointer): string {
    if (!pointer) return "";
    return new CString(pointer).toString();
  },

  /**
   * Read a string with known length from a pointer
   */
  readString(pointer: Pointer, length: number): string {
    if (!pointer || length === 0) return "";
    const buffer = toArrayBuffer(pointer, 0, length);
    return new TextDecoder().decode(buffer);
  },

  /**
   * Encode a string to a null-terminated C string buffer
   * Returns the buffer and its pointer
   */
  encodeCString(str: string): { buffer: Uint8Array; ptr: Pointer } {
    const encoded = new TextEncoder().encode(str + "\0");
    return { buffer: encoded, ptr: ptr(encoded) as Pointer };
  },

  /**
   * Encode a string without null terminator (for WGPUStringView)
   * Returns the buffer and its pointer
   */
  encodeString(str: string): { buffer: Uint8Array; ptr: Pointer; length: number } {
    const encoded = new TextEncoder().encode(str);
    return { buffer: encoded, ptr: ptr(encoded) as Pointer, length: encoded.length };
  },

  /**
   * Get a pointer to a TypedArray or ArrayBuffer
   */
  ptr(data: ArrayBuffer | ArrayBufferView): Pointer {
    if (data instanceof ArrayBuffer) {
      return ptr(new Uint8Array(data)) as unknown as Pointer;
    }
    if (data instanceof DataView) {
      return ptr(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)) as unknown as Pointer;
    }
    // TypedArray - convert to Uint8Array for FFI
    if ("buffer" in data) {
      return ptr(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)) as unknown as Pointer;
    }
    return ptr(data as Uint8Array) as unknown as Pointer;
  },

  /**
   * Create a pointer array from an array of pointers
   */
  ptrArray(pointers: Pointer[]): { buffer: BigUint64Array; ptr: Pointer } {
    const buffer = new BigUint64Array(pointers.map((p) => BigInt(p)));
    return { buffer, ptr: ptr(buffer) as Pointer };
  },
};

// Re-export types
export * from "./types";
export { symbols } from "./symbols";
