/**
 * Struct encoder - converts JS objects to native memory buffers
 */

import { ptr } from "bun:ffi";
import type { StructLayout, FieldType, PrimitiveType } from "./layout";
import type { Pointer } from "../ffi/types";

export interface EncodedStruct {
  buffer: ArrayBuffer;
  ptr: Pointer;
  size: number;
}

/**
 * Manages struct encoding and memory allocation
 * Call freeAll() when done to release temporary allocations
 */
export class StructEncoder {
  private allocations: Uint8Array[] = [];

  /**
   * Encode a struct to native memory
   */
  encode(layout: StructLayout, values: Record<string, unknown>): EncodedStruct {
    const buffer = new ArrayBuffer(layout.size);
    const view = new DataView(buffer);
    const u8 = new Uint8Array(buffer);

    for (const field of layout.fields) {
      const value = values[field.name];
      if (value !== undefined) {
        this.writeField(view, u8, field.offset, field.type, value);
      }
    }

    this.allocations.push(u8);
    return {
      buffer,
      ptr: ptr(u8) as Pointer,
      size: layout.size,
    };
  }

  /**
   * Encode a string to WGPUStringView format (data pointer + length)
   * Returns { data: Pointer, length: number } to embed in structs
   */
  encodeString(str: string): { data: Pointer; length: number } {
    if (!str) {
      return { data: 0 as Pointer, length: 0 };
    }
    const encoded = new TextEncoder().encode(str);
    this.allocations.push(encoded);
    return {
      data: ptr(encoded) as Pointer,
      length: encoded.length,
    };
  }

  /**
   * Encode a null-terminated C string
   */
  encodeCString(str: string): Pointer {
    const encoded = new TextEncoder().encode(str + "\0");
    this.allocations.push(encoded);
    return ptr(encoded) as Pointer;
  }

  /**
   * Allocate a buffer and return its pointer
   */
  alloc(size: number): { buffer: Uint8Array; ptr: Pointer } {
    const buffer = new Uint8Array(size);
    this.allocations.push(buffer);
    return { buffer, ptr: ptr(buffer) as Pointer };
  }

  /**
   * Create a pointer array from handles
   */
  ptrArray(pointers: Pointer[]): Pointer {
    if (pointers.length === 0) return 0 as Pointer;
    const buffer = new BigUint64Array(pointers.map((p) => BigInt(p)));
    const u8 = new Uint8Array(buffer.buffer);
    this.allocations.push(u8);
    return ptr(u8) as Pointer;
  }

  /**
   * Create a u32 array
   */
  u32Array(values: number[]): Pointer {
    if (values.length === 0) return 0 as Pointer;
    const buffer = new Uint32Array(values);
    const u8 = new Uint8Array(buffer.buffer);
    this.allocations.push(u8);
    return ptr(u8) as Pointer;
  }

  /**
   * Track external buffer for cleanup
   */
  track(buffer: Uint8Array): void {
    this.allocations.push(buffer);
  }

  /**
   * Free all allocations made by this encoder
   * Note: In Bun, memory is GC'd when the backing TypedArray is no longer referenced
   */
  freeAll(): void {
    this.allocations = [];
  }

  private writeField(
    view: DataView,
    u8: Uint8Array,
    offset: number,
    type: FieldType,
    value: unknown
  ): void {
    if (typeof type === "string") {
      this.writePrimitive(view, offset, type, value);
    } else if ("struct" in type) {
      // Nested struct - value should be a record
      const nestedLayout = type.struct;
      const nestedValue = value as Record<string, unknown>;
      for (const nestedField of nestedLayout.fields) {
        const fieldValue = nestedValue[nestedField.name];
        if (fieldValue !== undefined) {
          this.writeField(view, u8, offset + nestedField.offset, nestedField.type, fieldValue);
        }
      }
    } else if ("array" in type) {
      // Fixed-size array
      const arr = value as unknown[];
      const elemSize = this.getTypeSize(type.array);
      for (let i = 0; i < type.count && i < arr.length; i++) {
        this.writePrimitive(view, offset + i * elemSize, type.array, arr[i]);
      }
    }
  }

  private writePrimitive(view: DataView, offset: number, type: PrimitiveType, value: unknown): void {
    switch (type) {
      case "u8":
        view.setUint8(offset, value as number);
        break;
      case "i8":
        view.setInt8(offset, value as number);
        break;
      case "u16":
        view.setUint16(offset, value as number, true);
        break;
      case "i16":
        view.setInt16(offset, value as number, true);
        break;
      case "u32":
      case "bool":
        view.setUint32(offset, value as number, true);
        break;
      case "i32":
        view.setInt32(offset, value as number, true);
        break;
      case "u64":
      case "usize":
        view.setBigUint64(offset, BigInt(value as number | bigint), true);
        break;
      case "i64":
        view.setBigInt64(offset, BigInt(value as number | bigint), true);
        break;
      case "f32":
        view.setFloat32(offset, value as number, true);
        break;
      case "f64":
        view.setFloat64(offset, value as number, true);
        break;
      case "ptr":
        view.setBigUint64(offset, BigInt(value as number | bigint ?? 0), true);
        break;
    }
  }

  private getTypeSize(type: PrimitiveType): number {
    const sizes: Record<PrimitiveType, number> = {
      u8: 1,
      i8: 1,
      u16: 2,
      i16: 2,
      u32: 4,
      i32: 4,
      u64: 8,
      i64: 8,
      f32: 4,
      f64: 8,
      ptr: 8,
      usize: 8,
      bool: 4,
    };
    return sizes[type];
  }
}

/**
 * Decode a struct from native memory
 */
export class StructDecoder {
  private view: DataView;

  constructor(buffer: ArrayBuffer) {
    this.view = new DataView(buffer);
  }

  static fromPointer(pointer: Pointer, size: number): StructDecoder {
    const { toArrayBuffer } = require("bun:ffi");
    const buffer = toArrayBuffer(pointer, 0, size);
    return new StructDecoder(buffer);
  }

  readU8(offset: number): number {
    return this.view.getUint8(offset);
  }

  readI8(offset: number): number {
    return this.view.getInt8(offset);
  }

  readU16(offset: number): number {
    return this.view.getUint16(offset, true);
  }

  readI16(offset: number): number {
    return this.view.getInt16(offset, true);
  }

  readU32(offset: number): number {
    return this.view.getUint32(offset, true);
  }

  readI32(offset: number): number {
    return this.view.getInt32(offset, true);
  }

  readU64(offset: number): bigint {
    return this.view.getBigUint64(offset, true);
  }

  readI64(offset: number): bigint {
    return this.view.getBigInt64(offset, true);
  }

  readF32(offset: number): number {
    return this.view.getFloat32(offset, true);
  }

  readF64(offset: number): number {
    return this.view.getFloat64(offset, true);
  }

  readPtr(offset: number): Pointer {
    return Number(this.view.getBigUint64(offset, true)) as Pointer;
  }

  readBool(offset: number): boolean {
    return this.view.getUint32(offset, true) !== 0;
  }
}
