/**
 * Debug test for shader module creation - complete test with device
 */

import { ptr, dlopen, JSCallback, toArrayBuffer } from "bun:ffi";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const libPath = join(__dirname, "lib/darwin-arm64/lib/libwgpu_native.dylib");

const symbols = {
  wgpuCreateInstance: { args: ["ptr"] as const, returns: "ptr" as const },
  wgpuInstanceRequestAdapter: { args: ["ptr", "ptr", "ptr"] as const, returns: "u64" as const },
  wgpuInstanceProcessEvents: { args: ["ptr"] as const, returns: "void" as const },
  wgpuAdapterRequestDevice: { args: ["ptr", "ptr", "ptr"] as const, returns: "u64" as const },
  wgpuDeviceCreateShaderModule: { args: ["ptr", "ptr"] as const, returns: "ptr" as const },
  wgpuDeviceGetQueue: { args: ["ptr"] as const, returns: "ptr" as const },
};

const lib = dlopen(libPath, symbols);

// Keep allocations alive
const allocations: Uint8Array[] = [];

function alloc(size: number): { buffer: Uint8Array; ptr: number } {
  const buffer = new Uint8Array(size);
  allocations.push(buffer);
  return { buffer, ptr: ptr(buffer) as unknown as number };
}

function allocString(str: string): { ptr: number; length: number } {
  // Null-terminate the string just to be safe
  const bytes = new TextEncoder().encode(str + "\0");
  allocations.push(bytes);
  return { ptr: ptr(bytes) as unknown as number, length: str.length };
}

async function main() {
  console.log("=== Direct FFI Debug Test ===\n");

  // Create instance
  const instanceDesc = alloc(48); // WGPUInstanceDescriptor
  const instance = lib.symbols.wgpuCreateInstance(instanceDesc.ptr);
  console.log("Instance:", instance);

  if (!instance) {
    console.error("Failed to create instance");
    return;
  }

  // Request adapter
  console.log("\nRequesting adapter...");
  let adapter: unknown = null;

  const adapterCallback = new JSCallback(
    (status: number, adapterPtr: unknown, msgData: unknown, msgLen: unknown, ud1: unknown, ud2: unknown) => {
      console.log("  Adapter callback - status:", status, "adapter:", adapterPtr);
      if (status === 1) { // Success
        adapter = adapterPtr;
      }
    },
    { args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"], returns: "void" }
  );

  // WGPURequestAdapterOptions
  const adapterOptions = alloc(32);
  const adapterOptionsView = new DataView(adapterOptions.buffer.buffer);
  adapterOptionsView.setBigUint64(0, BigInt(0), true); // nextInChain
  adapterOptionsView.setUint32(8, 2, true); // featureLevel = Core
  adapterOptionsView.setUint32(12, 0), true; // powerPreference
  adapterOptionsView.setBigUint64(16, BigInt(0), true); // forceFallbackAdapter
  adapterOptionsView.setBigUint64(24, BigInt(0), true); // compatibleSurface

  // WGPURequestAdapterCallbackInfo
  const adapterCallbackInfo = alloc(48);
  const adapterCbView = new DataView(adapterCallbackInfo.buffer.buffer);
  adapterCbView.setBigUint64(0, BigInt(0), true); // nextInChain
  adapterCbView.setUint32(8, 2, true); // mode = AllowProcessEvents
  adapterCbView.setBigUint64(16, BigInt(adapterCallback.ptr as unknown as number), true); // callback
  adapterCbView.setBigUint64(24, BigInt(0), true); // userdata1
  adapterCbView.setBigUint64(32, BigInt(0), true); // userdata2

  lib.symbols.wgpuInstanceRequestAdapter(instance, adapterOptions.ptr, adapterCallbackInfo.ptr);

  // Poll until we get an adapter
  for (let i = 0; i < 100 && !adapter; i++) {
    lib.symbols.wgpuInstanceProcessEvents(instance);
    await new Promise(r => setTimeout(r, 10));
  }

  if (!adapter) {
    console.error("Failed to get adapter");
    return;
  }
  console.log("Got adapter:", adapter);

  // Request device
  console.log("\nRequesting device...");
  let device: unknown = null;

  const deviceCallback = new JSCallback(
    (status: number, devicePtr: unknown, msgData: unknown, msgLen: unknown, ud1: unknown, ud2: unknown) => {
      console.log("  Device callback - status:", status, "device:", devicePtr);
      if (status === 1) { // Success
        device = devicePtr;
      }
    },
    { args: ["u32", "ptr", "ptr", "usize", "ptr", "ptr"], returns: "void" }
  );

  // WGPUDeviceDescriptor (simplified - just zeros)
  const deviceDesc = alloc(128);

  // WGPURequestDeviceCallbackInfo
  const deviceCallbackInfo = alloc(48);
  const deviceCbView = new DataView(deviceCallbackInfo.buffer.buffer);
  deviceCbView.setBigUint64(0, BigInt(0), true); // nextInChain
  deviceCbView.setUint32(8, 2, true); // mode = AllowProcessEvents
  deviceCbView.setBigUint64(16, BigInt(deviceCallback.ptr as unknown as number), true); // callback
  deviceCbView.setBigUint64(24, BigInt(0), true); // userdata1
  deviceCbView.setBigUint64(32, BigInt(0), true); // userdata2

  lib.symbols.wgpuAdapterRequestDevice(adapter, deviceDesc.ptr, deviceCallbackInfo.ptr);

  // Poll until we get a device
  for (let i = 0; i < 100 && !device; i++) {
    lib.symbols.wgpuInstanceProcessEvents(instance);
    await new Promise(r => setTimeout(r, 10));
  }

  if (!device) {
    console.error("Failed to get device");
    return;
  }
  console.log("Got device:", device);

  // Now test shader module creation
  console.log("\n=== Testing Shader Module Creation ===\n");

  const shaderCode = "@compute @workgroup_size(1) fn main() {}";
  const codeStr = allocString(shaderCode);

  console.log("Shader code:", shaderCode);
  console.log("Code ptr:", codeStr.ptr);
  console.log("Code length:", codeStr.length);

  // WGPUShaderSourceWGSL (chained struct)
  // Layout based on header:
  // struct WGPUChainedStruct { next: ptr (8), sType: u32 (4), padding (4) } = 16 bytes
  // struct WGPUShaderSourceWGSL { chain (16), code.data (8), code.length (8) } = 32 bytes
  const wgslSource = alloc(32);
  const wgslView = new DataView(wgslSource.buffer.buffer);

  wgslView.setBigUint64(0, BigInt(0), true); // chain.next = null
  wgslView.setUint32(8, 2, true); // chain.sType = WGPUSType_ShaderSourceWGSL (0x00000002)
  // Padding at 12-15 is implicitly zero
  wgslView.setBigUint64(16, BigInt(codeStr.ptr), true); // code.data
  wgslView.setBigUint64(24, BigInt(codeStr.length), true); // code.length

  console.log("\nWGPUShaderSourceWGSL layout:");
  console.log("  [0-7]   chain.next:", wgslView.getBigUint64(0, true));
  console.log("  [8-11]  chain.sType:", wgslView.getUint32(8, true));
  console.log("  [16-23] code.data:", wgslView.getBigUint64(16, true));
  console.log("  [24-31] code.length:", wgslView.getBigUint64(24, true));

  // WGPUShaderModuleDescriptor
  // Layout: nextInChain (8), label.data (8), label.length (8) = 24 bytes
  const moduleDesc = alloc(24);
  const moduleView = new DataView(moduleDesc.buffer.buffer);

  moduleView.setBigUint64(0, BigInt(wgslSource.ptr), true); // nextInChain -> WGSL source
  moduleView.setBigUint64(8, BigInt(0), true); // label.data = null
  moduleView.setBigUint64(16, BigInt(0), true); // label.length = 0

  console.log("\nWGPUShaderModuleDescriptor layout:");
  console.log("  [0-7]   nextInChain:", moduleView.getBigUint64(0, true));
  console.log("  [8-15]  label.data:", moduleView.getBigUint64(8, true));
  console.log("  [16-23] label.length:", moduleView.getBigUint64(16, true));

  console.log("\nCalling wgpuDeviceCreateShaderModule...");

  try {
    const shaderModule = lib.symbols.wgpuDeviceCreateShaderModule(device, moduleDesc.ptr);
    console.log("Shader module result:", shaderModule);

    if (shaderModule) {
      console.log("\nSUCCESS: Shader module created!");
    } else {
      console.log("\nFAILED: Shader module is null");
    }
  } catch (err) {
    console.error("Error creating shader module:", err);
  }
}

main().catch(console.error);
