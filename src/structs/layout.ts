/**
 * Memory layout calculator for C structs
 * Handles alignment and padding automatically
 */

export type PrimitiveType =
  | "u8"
  | "i8"
  | "u16"
  | "i16"
  | "u32"
  | "i32"
  | "u64"
  | "i64"
  | "f32"
  | "f64"
  | "ptr"
  | "usize"
  | "bool";

export type FieldType = PrimitiveType | { struct: StructLayout } | { array: PrimitiveType; count: number };

export interface FieldDef {
  name: string;
  type: FieldType;
}

export interface FieldLayout {
  name: string;
  type: FieldType;
  offset: number;
  size: number;
  alignment: number;
}

export interface StructLayout {
  name: string;
  fields: FieldLayout[];
  size: number;
  alignment: number;
}

// Type info: size and alignment in bytes
const TYPE_INFO: Record<PrimitiveType, { size: number; alignment: number }> = {
  u8: { size: 1, alignment: 1 },
  i8: { size: 1, alignment: 1 },
  u16: { size: 2, alignment: 2 },
  i16: { size: 2, alignment: 2 },
  u32: { size: 4, alignment: 4 },
  i32: { size: 4, alignment: 4 },
  u64: { size: 8, alignment: 8 },
  i64: { size: 8, alignment: 8 },
  f32: { size: 4, alignment: 4 },
  f64: { size: 8, alignment: 8 },
  ptr: { size: 8, alignment: 8 }, // 64-bit pointers
  usize: { size: 8, alignment: 8 }, // 64-bit size_t
  bool: { size: 4, alignment: 4 }, // WGPUBool is uint32_t
};

function getTypeInfo(type: FieldType): { size: number; alignment: number } {
  if (typeof type === "string") {
    return TYPE_INFO[type];
  }
  if ("struct" in type) {
    return { size: type.struct.size, alignment: type.struct.alignment };
  }
  if ("array" in type) {
    const elemInfo = TYPE_INFO[type.array];
    return { size: elemInfo.size * type.count, alignment: elemInfo.alignment };
  }
  throw new Error(`Unknown type: ${JSON.stringify(type)}`);
}

function align(offset: number, alignment: number): number {
  const remainder = offset % alignment;
  return remainder === 0 ? offset : offset + (alignment - remainder);
}

/**
 * Define a struct layout with automatic alignment calculation
 */
export function defineStruct(name: string, fields: FieldDef[]): StructLayout {
  let offset = 0;
  let maxAlignment = 1;
  const layoutFields: FieldLayout[] = [];

  for (const field of fields) {
    const { size, alignment } = getTypeInfo(field.type);
    offset = align(offset, alignment);
    maxAlignment = Math.max(maxAlignment, alignment);

    layoutFields.push({
      name: field.name,
      type: field.type,
      offset,
      size,
      alignment,
    });

    offset += size;
  }

  // Final struct size must be aligned to max alignment (for arrays of structs)
  const structSize = align(offset, maxAlignment);

  return {
    name,
    fields: layoutFields,
    size: structSize,
    alignment: maxAlignment,
  };
}

/**
 * Get offset of a field by name
 */
export function getFieldOffset(layout: StructLayout, fieldName: string): number {
  const field = layout.fields.find((f) => f.name === fieldName);
  if (!field) {
    throw new Error(`Field '${fieldName}' not found in struct '${layout.name}'`);
  }
  return field.offset;
}
