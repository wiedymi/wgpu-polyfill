/**
 * Memory profiling and leak detection for WebGPU polyfill
 */

import { installPolyfill, GPUBufferUsage, GPUTextureUsage, uninstallPolyfill, clearAllBuffers } from "./src";

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

function getMemoryUsage(): { heapUsed: number; rss: number } {
  const mem = process.memoryUsage();
  return {
    heapUsed: mem.heapUsed,
    rss: mem.rss,
  };
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface MemorySnapshot {
  label: string;
  heapUsed: number;
  rss: number;
}

class MemoryTracker {
  private snapshots: MemorySnapshot[] = [];
  private initialHeap = 0;
  private initialRss = 0;

  start() {
    // Force GC if available
    if (global.gc) {
      global.gc();
    }
    const mem = getMemoryUsage();
    this.initialHeap = mem.heapUsed;
    this.initialRss = mem.rss;
    this.snapshots = [];
  }

  snapshot(label: string) {
    const mem = getMemoryUsage();
    this.snapshots.push({
      label,
      heapUsed: mem.heapUsed,
      rss: mem.rss,
    });
  }

  report(): void {
    console.log("\nMemory Profile Report:");
    console.log("=".repeat(60));

    for (const snap of this.snapshots) {
      const heapDelta = snap.heapUsed - this.initialHeap;
      const rssDelta = snap.rss - this.initialRss;
      console.log(`  ${snap.label}:`);
      console.log(`    Heap: ${formatBytes(snap.heapUsed)} (${heapDelta >= 0 ? "+" : ""}${formatBytes(heapDelta)})`);
      console.log(`    RSS:  ${formatBytes(snap.rss)} (${rssDelta >= 0 ? "+" : ""}${formatBytes(rssDelta)})`);
    }

    if (this.snapshots.length >= 2) {
      const first = this.snapshots[0];
      const last = this.snapshots[this.snapshots.length - 1];
      const heapGrowth = last.heapUsed - first.heapUsed;
      const rssGrowth = last.rss - first.rss;

      console.log("\nOverall Growth:");
      console.log(`  Heap: ${heapGrowth >= 0 ? "+" : ""}${formatBytes(heapGrowth)}`);
      console.log(`  RSS:  ${rssGrowth >= 0 ? "+" : ""}${formatBytes(rssGrowth)}`);
    }
  }
}

async function testBufferLeaks(): Promise<boolean> {
  console.log("\n--- Buffer Leak Test ---");
  const tracker = new MemoryTracker();
  tracker.start();
  tracker.snapshot("Before allocation");

  const buffers: GPUBuffer[] = [];

  // Allocate many buffers
  for (let i = 0; i < 100; i++) {
    buffers.push(
      device.createBuffer({
        size: 65536, // 64KB each
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
    );
  }
  tracker.snapshot("After allocating 100 x 64KB buffers");

  // Destroy all buffers
  for (const buf of buffers) {
    buf.destroy();
  }
  buffers.length = 0;
  tracker.snapshot("After destroying all buffers");

  // Clear internal buffers
  clearAllBuffers();
  tracker.snapshot("After clearAllBuffers()");

  tracker.report();

  const mem = getMemoryUsage();
  const heapGrowth = mem.heapUsed - tracker["initialHeap"];
  const passed = heapGrowth < 10 * 1024 * 1024; // Less than 10MB growth
  console.log(`  ${passed ? "PASSED" : "FAILED"}: Heap growth ${formatBytes(heapGrowth)}`);
  return passed;
}

async function testTextureLeaks(): Promise<boolean> {
  console.log("\n--- Texture Leak Test ---");
  const tracker = new MemoryTracker();
  tracker.start();
  tracker.snapshot("Before allocation");

  const textures: GPUTexture[] = [];

  // Allocate many textures
  for (let i = 0; i < 50; i++) {
    textures.push(
      device.createTexture({
        size: [256, 256],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      })
    );
  }
  tracker.snapshot("After allocating 50 x 256x256 textures");

  // Destroy all textures
  for (const tex of textures) {
    tex.destroy();
  }
  textures.length = 0;
  tracker.snapshot("After destroying all textures");

  tracker.report();

  const mem = getMemoryUsage();
  const heapGrowth = mem.heapUsed - tracker["initialHeap"];
  const passed = heapGrowth < 10 * 1024 * 1024; // Less than 10MB growth
  console.log(`  ${passed ? "PASSED" : "FAILED"}: Heap growth ${formatBytes(heapGrowth)}`);
  return passed;
}

async function testPipelineLeaks(): Promise<boolean> {
  console.log("\n--- Pipeline Leak Test ---");
  const tracker = new MemoryTracker();
  tracker.start();
  tracker.snapshot("Before allocation");

  // Create many shaders and pipelines
  for (let i = 0; i < 50; i++) {
    const shader = device.createShaderModule({
      code: `
        @group(0) @binding(0) var<storage, read_write> data: array<f32>;
        @compute @workgroup_size(64)
        fn main(@builtin(global_invocation_id) gid: vec3u) {
          data[gid.x] = f32(${i});
        }
      `,
    });
    device.createComputePipeline({
      layout: "auto",
      compute: { module: shader, entryPoint: "main" },
    });
  }
  tracker.snapshot("After creating 50 shader+pipeline pairs");

  // Clear internal buffers
  clearAllBuffers();
  tracker.snapshot("After clearAllBuffers()");

  tracker.report();

  const mem = getMemoryUsage();
  const heapGrowth = mem.heapUsed - tracker["initialHeap"];
  const passed = heapGrowth < 50 * 1024 * 1024; // Less than 50MB growth (shaders can be large)
  console.log(`  ${passed ? "PASSED" : "FAILED"}: Heap growth ${formatBytes(heapGrowth)}`);
  return passed;
}

async function testLongRunningWorkload(): Promise<boolean> {
  console.log("\n--- Long Running Workload Test ---");
  const tracker = new MemoryTracker();
  tracker.start();
  tracker.snapshot("Before workload");

  const shader = device.createShaderModule({
    code: `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) gid: vec3u) {
        data[gid.x] *= 2.0;
      }
    `,
  });

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: shader, entryPoint: "main" },
  });

  // Create a buffer for compute operations
  const buffer = device.createBuffer({
    size: 65536,
    usage: GPUBufferUsage.STORAGE,
  });

  const bindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer } }],
  });

  // Run many iterations
  for (let iteration = 0; iteration < 1000; iteration++) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(256);
    pass.end();
    device.queue.submit([encoder.finish()]);

    if (iteration === 0) {
      tracker.snapshot("After 1 iteration");
    } else if (iteration === 99) {
      tracker.snapshot("After 100 iterations");
    } else if (iteration === 999) {
      tracker.snapshot("After 1000 iterations");
    }
  }

  buffer.destroy();
  clearAllBuffers();
  tracker.snapshot("After cleanup");

  tracker.report();

  const mem = getMemoryUsage();
  const heapGrowth = mem.heapUsed - tracker["initialHeap"];
  const passed = heapGrowth < 50 * 1024 * 1024; // Less than 50MB growth
  console.log(`  ${passed ? "PASSED" : "FAILED"}: Heap growth ${formatBytes(heapGrowth)}`);
  return passed;
}

async function testRenderPassLeaks(): Promise<boolean> {
  console.log("\n--- Render Pass Leak Test ---");
  const tracker = new MemoryTracker();
  tracker.start();
  tracker.snapshot("Before workload");

  const shader = device.createShaderModule({
    code: `
      @vertex
      fn vs(@builtin(vertex_index) idx: u32) -> @builtin(position) vec4f {
        var pos = array<vec2f, 3>(
          vec2f(0.0, 0.5),
          vec2f(-0.5, -0.5),
          vec2f(0.5, -0.5)
        );
        return vec4f(pos[idx], 0.0, 1.0);
      }

      @fragment
      fn fs() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0);
      }
    `,
  });

  const pipeline = device.createRenderPipeline({
    layout: "auto",
    vertex: { module: shader, entryPoint: "vs" },
    fragment: {
      module: shader,
      entryPoint: "fs",
      targets: [{ format: "rgba8unorm" }],
    },
  });

  const texture = device.createTexture({
    size: [256, 256],
    format: "rgba8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  // Run many render passes
  for (let iteration = 0; iteration < 500; iteration++) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: texture.createView(),
        loadOp: "clear",
        storeOp: "store",
      }],
    });
    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();
    device.queue.submit([encoder.finish()]);

    if (iteration === 0) {
      tracker.snapshot("After 1 render pass");
    } else if (iteration === 99) {
      tracker.snapshot("After 100 render passes");
    } else if (iteration === 499) {
      tracker.snapshot("After 500 render passes");
    }
  }

  texture.destroy();
  clearAllBuffers();
  tracker.snapshot("After cleanup");

  tracker.report();

  const mem = getMemoryUsage();
  const heapGrowth = mem.heapUsed - tracker["initialHeap"];
  const passed = heapGrowth < 50 * 1024 * 1024; // Less than 50MB growth
  console.log(`  ${passed ? "PASSED" : "FAILED"}: Heap growth ${formatBytes(heapGrowth)}`);
  return passed;
}

async function main() {
  console.log("=== WebGPU Polyfill Memory Profiling ===\n");

  await setup();

  const results: boolean[] = [];

  results.push(await testBufferLeaks());
  results.push(await testTextureLeaks());
  results.push(await testPipelineLeaks());
  results.push(await testLongRunningWorkload());
  results.push(await testRenderPassLeaks());

  await teardown();

  console.log("\n=== Memory Profile Summary ===");
  const passed = results.filter(Boolean).length;
  const failed = results.length - passed;
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);

  if (failed > 0) {
    console.log("\nNote: Some tests failed. This may indicate memory leaks");
    console.log("that should be investigated in long-running applications.");
    process.exit(1);
  } else {
    console.log("\nAll memory tests passed!");
  }
}

main().catch(console.error);
