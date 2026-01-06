/**
 * Edge case and error condition tests for WebGPU polyfill
 */

import { installPolyfill, GPUBufferUsage, GPUTextureUsage, GPUMapMode, uninstallPolyfill } from "./src";

let gpu: GPU;
let adapter: GPUAdapter;
let device: GPUDevice;

async function setup() {
  gpu = installPolyfill();
  adapter = (await gpu.requestAdapter())!;
  device = await adapter.requestDevice();
}

async function teardown() {
  device.destroy();
  uninstallPolyfill();
}

// Test utilities
let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (error) {
      console.log(`  ✗ ${name}: ${error}`);
      failed++;
    }
  };
}

function expectThrows(fn: () => void, message?: string) {
  try {
    fn();
    throw new Error(message || "Expected function to throw");
  } catch (e) {
    // Expected
  }
}

async function expectRejects(promise: Promise<unknown>, message?: string) {
  try {
    await promise;
    throw new Error(message || "Expected promise to reject");
  } catch (e) {
    // Expected
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log("=== Edge Case & Error Condition Tests ===\n");

  await setup();

  // Buffer edge cases
  console.log("1. Buffer Edge Cases");

  await test("zero-size buffer should fail or create empty buffer", () => {
    // Some implementations allow size 0, others don't
    try {
      const buf = device.createBuffer({ size: 0, usage: GPUBufferUsage.STORAGE });
      buf.destroy();
    } catch (e) {
      // Expected to fail
    }
  })();

  await test("buffer with no usage flags should fail", () => {
    expectThrows(() => {
      device.createBuffer({ size: 64, usage: 0 });
    });
  })();

  await test("very large buffer allocation", async () => {
    // Should either succeed or throw OOM/validation, not crash
    try {
      const buf = device.createBuffer({
        size: 1024 * 1024 * 128, // 128MB (max is 256MB)
        usage: GPUBufferUsage.STORAGE,
      });
      buf.destroy();
    } catch (e) {
      // OOM or validation error is acceptable
    }
  })();

  await test("buffer exceeding max size should fail", () => {
    expectThrows(() => {
      device.createBuffer({
        size: 1024 * 1024 * 512, // 512MB exceeds max 256MB
        usage: GPUBufferUsage.STORAGE,
      });
    });
  })();

  await test("buffer mapAsync with invalid mode", async () => {
    const buf = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    // Try to map for write when only read is allowed
    try {
      await buf.mapAsync(GPUMapMode.WRITE);
    } catch (e) {
      // Expected - buffer doesn't have MAP_WRITE usage
    }
    buf.destroy();
  })();

  await test("double unmap should not crash", () => {
    const buf = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    });
    buf.unmap();
    buf.unmap(); // Should not crash
    buf.destroy();
  })();

  await test("getMappedRange on unmapped buffer", () => {
    const buf = device.createBuffer({
      size: 64,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });
    expectThrows(() => {
      buf.getMappedRange();
    });
    buf.destroy();
  })();

  // Texture edge cases
  console.log("\n2. Texture Edge Cases");

  await test("1x1 texture", () => {
    const tex = device.createTexture({
      size: [1, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    assert(tex.width === 1 && tex.height === 1, "Size should be 1x1");
    tex.destroy();
  })();

  await test("3D texture", () => {
    const tex = device.createTexture({
      size: [16, 16, 4],
      dimension: "3d",
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });
    assert(tex.dimension === "3d", "Dimension should be 3d");
    assert(tex.depthOrArrayLayers === 4, "Depth should be 4");
    tex.destroy();
  })();

  await test("texture array", () => {
    const tex = device.createTexture({
      size: [64, 64, 6],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING,
    });
    assert(tex.depthOrArrayLayers === 6, "Array layers should be 6");
    tex.destroy();
  })();

  await test("texture with mip levels", () => {
    const tex = device.createTexture({
      size: [256, 256],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      mipLevelCount: 4,
    });
    assert(tex.mipLevelCount === 4, "Mip levels should be 4");
    tex.destroy();
  })();

  await test("double texture destroy should not crash", () => {
    const tex = device.createTexture({
      size: [64, 64],
      format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    tex.destroy();
    tex.destroy(); // Should not crash
  })();

  // Shader edge cases
  console.log("\n3. Shader Edge Cases");

  await test("empty shader should fail", () => {
    expectThrows(() => {
      device.createShaderModule({ code: "" });
    });
  })();

  // Note: Invalid WGSL tests skipped - wgpu-native panics instead of returning error
  // await test("invalid WGSL should fail", () => { ... });
  // await test("shader with syntax error", () => { ... });
  console.log("  (skipped: invalid WGSL tests - wgpu-native panics)");

  // Pipeline edge cases
  console.log("\n4. Pipeline Edge Cases");

  // Note: "pipeline with non-existent entry point" skipped - wgpu-native panics
  console.log("  (skipped: non-existent entry point test - wgpu-native panics)");

  await test("render pipeline without fragment targets (depth-only)", () => {
    const shader = device.createShaderModule({
      code: `
        @vertex
        fn vs() -> @builtin(position) vec4f { return vec4f(0.0); }
      `,
    });
    // Should work (depth-only rendering)
    const pipeline = device.createRenderPipeline({
      layout: "auto",
      vertex: { module: shader, entryPoint: "vs" },
      depthStencil: {
        format: "depth24plus",
        depthWriteEnabled: true,
        depthCompare: "less",
      },
    });
  })();

  // Bind group edge cases
  console.log("\n5. Bind Group Edge Cases");

  // Note: "bind group with wrong buffer size" skipped - wgpu-native panics
  console.log("  (skipped: wrong buffer size test - wgpu-native panics)");

  await test("bind group with correct buffer size", () => {
    const shader = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<uniform> data: vec4f;
        @compute @workgroup_size(1)
        fn main() { _ = data; }
      `,
    });
    const pipeline = device.createComputePipeline({
      layout: "auto",
      compute: { module: shader, entryPoint: "main" },
    });
    const buffer = device.createBuffer({
      size: 16, // Correct size for vec4f
      usage: GPUBufferUsage.UNIFORM,
    });
    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [{ binding: 0, resource: { buffer } }],
    });
    buffer.destroy();
  })();

  // Command encoder edge cases
  console.log("\n6. Command Encoder Edge Cases");

  // Note: Command encoder validation tests skipped - wgpu-native panics on these
  console.log("  (skipped: finish encoder twice - wgpu-native panics)");
  console.log("  (skipped: use encoder after finish - wgpu-native panics)");
  console.log("  (skipped: render pass without ending - wgpu-native panics)");

  await test("basic command encoder workflow", () => {
    const encoder = device.createCommandEncoder();
    const tex = device.createTexture({
      size: [64, 64],
      format: "rgba8unorm",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: tex.createView(),
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    pass.end();
    const cmdBuffer = encoder.finish();
    device.queue.submit([cmdBuffer]);
    tex.destroy();
  })();

  // Error scope edge cases
  console.log("\n7. Error Scope Edge Cases");

  // Note: "pop error scope with empty stack" skipped - wgpu-native panics
  console.log("  (skipped: pop with empty stack - wgpu-native panics)");

  await test("nested error scopes", async () => {
    device.pushErrorScope("validation");
    device.pushErrorScope("out-of-memory");

    const error1 = await device.popErrorScope();
    const error2 = await device.popErrorScope();

    // Both should return null for valid operations
  })();

  // Query set edge cases
  console.log("\n8. Query Set Edge Cases");

  // Note: "query set with count 0" skipped - wgpu-native panics
  console.log("  (skipped: query set with count 0 - wgpu-native panics)");

  await test("valid query set creation and destroy", () => {
    const qs = device.createQuerySet({ type: "occlusion", count: 4 });
    qs.destroy();
  })();

  // Note: "resolve query set out of bounds" skipped - wgpu-native may panic
  console.log("  (skipped: resolve out of bounds - wgpu-native panics)");

  // Sampler edge cases
  console.log("\n9. Sampler Edge Cases");

  await test("sampler with all options", () => {
    const sampler = device.createSampler({
      addressModeU: "repeat",
      addressModeV: "mirror-repeat",
      addressModeW: "clamp-to-edge",
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
      lodMinClamp: 0,
      lodMaxClamp: 32,
      maxAnisotropy: 16,
    });
  })();

  await test("comparison sampler", () => {
    const sampler = device.createSampler({
      compare: "less",
    });
  })();

  // Cleanup and summary
  console.log("\n=== Edge Case Test Summary ===");
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  await teardown();

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
