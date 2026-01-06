/**
 * Performance benchmarks for WebGPU polyfill
 */

import { installPolyfill, GPUBufferUsage, GPUTextureUsage, uninstallPolyfill } from "./src";

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

interface BenchmarkResult {
  name: string;
  iterations: number;
  totalMs: number;
  avgMs: number;
  opsPerSec: number;
}

async function benchmark(
  name: string,
  fn: () => void | Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  // Warmup
  for (let i = 0; i < Math.min(10, iterations); i++) {
    await fn();
  }

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const totalMs = performance.now() - start;
  const avgMs = totalMs / iterations;
  const opsPerSec = 1000 / avgMs;

  return {
    name,
    iterations,
    totalMs,
    avgMs,
    opsPerSec,
  };
}

function formatResult(result: BenchmarkResult): string {
  return `  ${result.name}: ${result.avgMs.toFixed(3)}ms avg (${result.opsPerSec.toFixed(0)} ops/s, ${result.iterations} iterations)`;
}

async function benchmarkBufferCreation(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Small buffers
  results.push(
    await benchmark("Buffer creation (64 bytes)", () => {
      const buf = device.createBuffer({
        size: 64,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      buf.destroy();
    }, 1000)
  );

  // Medium buffers
  results.push(
    await benchmark("Buffer creation (64KB)", () => {
      const buf = device.createBuffer({
        size: 65536,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      buf.destroy();
    }, 500)
  );

  // Large buffers
  results.push(
    await benchmark("Buffer creation (1MB)", () => {
      const buf = device.createBuffer({
        size: 1024 * 1024,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });
      buf.destroy();
    }, 100)
  );

  // With mapped creation
  results.push(
    await benchmark("Buffer creation (64KB, mappedAtCreation)", () => {
      const buf = device.createBuffer({
        size: 65536,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      buf.unmap();
      buf.destroy();
    }, 500)
  );

  return results;
}

async function benchmarkShaderCompilation(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Simple compute shader
  results.push(
    await benchmark("Shader compilation (simple compute)", () => {
      device.createShaderModule({
        code: `
          @compute @workgroup_size(64)
          fn main(@builtin(global_invocation_id) gid: vec3u) {}
        `,
      });
    }, 100)
  );

  // Complex compute shader
  results.push(
    await benchmark("Shader compilation (complex compute)", () => {
      device.createShaderModule({
        code: `
          struct Params {
            a: f32,
            b: f32,
            c: f32,
            d: f32,
          }
          @group(0) @binding(0) var<storage, read_write> data: array<vec4f>;
          @group(0) @binding(1) var<uniform> params: Params;

          @compute @workgroup_size(256)
          fn main(@builtin(global_invocation_id) gid: vec3u) {
            let idx = gid.x;
            if (idx >= arrayLength(&data)) { return; }
            var v = data[idx];
            v = v * params.a + params.b;
            v = sin(v) * params.c;
            v = cos(v) + params.d;
            data[idx] = v;
          }
        `,
      });
    }, 100)
  );

  // Vertex + fragment shader
  results.push(
    await benchmark("Shader compilation (vertex + fragment)", () => {
      device.createShaderModule({
        code: `
          struct VertexOutput {
            @builtin(position) position: vec4f,
            @location(0) color: vec4f,
          }

          @vertex
          fn vs(@builtin(vertex_index) idx: u32) -> VertexOutput {
            var out: VertexOutput;
            let x = f32(idx % 2u) * 2.0 - 1.0;
            let y = f32(idx / 2u) * 2.0 - 1.0;
            out.position = vec4f(x, y, 0.0, 1.0);
            out.color = vec4f(x * 0.5 + 0.5, y * 0.5 + 0.5, 0.0, 1.0);
            return out;
          }

          @fragment
          fn fs(in: VertexOutput) -> @location(0) vec4f {
            return in.color;
          }
        `,
      });
    }, 100)
  );

  return results;
}

async function benchmarkPipelineCreation(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  const computeShader = device.createShaderModule({
    code: `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) gid: vec3u) {
        data[gid.x] *= 2.0;
      }
    `,
  });

  results.push(
    await benchmark("Compute pipeline creation", () => {
      device.createComputePipeline({
        layout: "auto",
        compute: { module: computeShader, entryPoint: "main" },
      });
    }, 100)
  );

  const renderShader = device.createShaderModule({
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

  results.push(
    await benchmark("Render pipeline creation", () => {
      device.createRenderPipeline({
        layout: "auto",
        vertex: { module: renderShader, entryPoint: "vs" },
        fragment: {
          module: renderShader,
          entryPoint: "fs",
          targets: [{ format: "rgba8unorm" }],
        },
      });
    }, 100)
  );

  return results;
}

async function benchmarkComputeDispatch(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  const shader = device.createShaderModule({
    code: `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;
      @compute @workgroup_size(256)
      fn main(@builtin(global_invocation_id) gid: vec3u) {
        let idx = gid.x;
        if (idx >= arrayLength(&data)) { return; }
        data[idx] = data[idx] * 2.0 + 1.0;
      }
    `,
  });

  const pipeline = device.createComputePipeline({
    layout: "auto",
    compute: { module: shader, entryPoint: "main" },
  });

  // Small dispatch (64K elements)
  const smallBuffer = device.createBuffer({
    size: 64 * 1024 * 4, // 64K floats
    usage: GPUBufferUsage.STORAGE,
  });
  const smallBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: smallBuffer } }],
  });

  results.push(
    await benchmark("Compute dispatch (64K elements)", () => {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, smallBindGroup);
      pass.dispatchWorkgroups(256); // 256 * 256 = 65536
      pass.end();
      device.queue.submit([encoder.finish()]);
    }, 100)
  );

  // Medium dispatch (1M elements)
  const mediumBuffer = device.createBuffer({
    size: 1024 * 1024 * 4, // 1M floats
    usage: GPUBufferUsage.STORAGE,
  });
  const mediumBindGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: mediumBuffer } }],
  });

  results.push(
    await benchmark("Compute dispatch (1M elements)", () => {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, mediumBindGroup);
      pass.dispatchWorkgroups(4096); // 4096 * 256 = 1M
      pass.end();
      device.queue.submit([encoder.finish()]);
    }, 50)
  );

  smallBuffer.destroy();
  mediumBuffer.destroy();

  return results;
}

async function benchmarkRenderPass(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

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

  // Small render target
  const smallTexture = device.createTexture({
    size: [256, 256],
    format: "rgba8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  results.push(
    await benchmark("Render pass (256x256, 1 triangle)", () => {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: smallTexture.createView(),
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      pass.setPipeline(pipeline);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }, 100)
  );

  // Large render target
  const largeTexture = device.createTexture({
    size: [1024, 1024],
    format: "rgba8unorm",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  results.push(
    await benchmark("Render pass (1024x1024, 1 triangle)", () => {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: largeTexture.createView(),
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      pass.setPipeline(pipeline);
      pass.draw(3);
      pass.end();
      device.queue.submit([encoder.finish()]);
    }, 50)
  );

  // Multiple draws
  results.push(
    await benchmark("Render pass (256x256, 100 draws)", () => {
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: smallTexture.createView(),
          loadOp: "clear",
          storeOp: "store",
        }],
      });
      pass.setPipeline(pipeline);
      for (let i = 0; i < 100; i++) {
        pass.draw(3);
      }
      pass.end();
      device.queue.submit([encoder.finish()]);
    }, 50)
  );

  smallTexture.destroy();
  largeTexture.destroy();

  return results;
}

async function benchmarkTextureOperations(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Texture creation
  results.push(
    await benchmark("Texture creation (256x256)", () => {
      const tex = device.createTexture({
        size: [256, 256],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      tex.destroy();
    }, 500)
  );

  results.push(
    await benchmark("Texture creation (1024x1024)", () => {
      const tex = device.createTexture({
        size: [1024, 1024],
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
      });
      tex.destroy();
    }, 100)
  );

  // Texture view creation
  const texture = device.createTexture({
    size: [256, 256],
    format: "rgba8unorm",
    usage: GPUTextureUsage.TEXTURE_BINDING,
    mipLevelCount: 8,
  });

  results.push(
    await benchmark("Texture view creation", () => {
      texture.createView();
    }, 500)
  );

  results.push(
    await benchmark("Texture view creation (with options)", () => {
      texture.createView({
        baseMipLevel: 0,
        mipLevelCount: 4,
      });
    }, 500)
  );

  texture.destroy();

  return results;
}

async function main() {
  console.log("=== WebGPU Polyfill Benchmarks ===\n");

  await setup();

  console.log("1. Buffer Creation");
  for (const result of await benchmarkBufferCreation()) {
    console.log(formatResult(result));
  }

  console.log("\n2. Shader Compilation");
  for (const result of await benchmarkShaderCompilation()) {
    console.log(formatResult(result));
  }

  console.log("\n3. Pipeline Creation");
  for (const result of await benchmarkPipelineCreation()) {
    console.log(formatResult(result));
  }

  console.log("\n4. Compute Dispatch");
  for (const result of await benchmarkComputeDispatch()) {
    console.log(formatResult(result));
  }

  console.log("\n5. Render Pass");
  for (const result of await benchmarkRenderPass()) {
    console.log(formatResult(result));
  }

  console.log("\n6. Texture Operations");
  for (const result of await benchmarkTextureOperations()) {
    console.log(formatResult(result));
  }

  console.log("\n=== Benchmark Complete ===");

  await teardown();
}

main().catch(console.error);
