import { performance } from 'node:perf_hooks';
import XXH from 'xxhashjs';
import xxhash from 'xxhash-wasm';

import { SEED, xxh32 } from '../src/xxh32.js';

const CASES = [
  {
    label: '64 B',
    size: 64,
    iterations: 5_000_000,
    warmup: 100_000,
  },
  {
    label: '512 B',
    size: 512,
    iterations: 2_500_000,
    warmup: 50_000,
  },
  {
    label: '1 KiB',
    size: 1024,
    iterations: 1_000_000,
    warmup: 10_000,
  },
  {
    label: '64 KiB',
    size: 64 * 1024,
    iterations: 20_000,
    warmup: 1_000,
  },
  {
    label: '1 MiB',
    size: 1024 * 1024,
    iterations: 1_000,
    warmup: 100,
  },
];

type Bench = {
  name: string;
  hash: () => number;
};

type Case = (typeof CASES)[number];

function createInput(size: number): Uint8Array {
  const input = new Uint8Array(size);

  for (let i = 0; i < input.length; i++) {
    input[i] = (i * 31 + 17) & 0xff;
  }

  return input;
}

function runBench({ name, hash }: Bench, benchCase: Case): void {
  for (let i = 0; i < benchCase.warmup; i++) {
    hash();
  }

  let check = 0;
  const start = performance.now();

  for (let i = 0; i < benchCase.iterations; i++) {
    check ^= hash();
  }

  const seconds = (performance.now() - start) / 1000;
  const megabytes =
    (benchCase.size * benchCase.iterations) / 1024 / 1024;
  const throughput = megabytes / seconds;

  console.log(
    `${name.padEnd(12)} ${throughput.toFixed(2).padStart(10)} MiB/s ${seconds
      .toFixed(3)
      .padStart(8)}s check=${check >>> 0}`,
  );
}

const { h32Raw } = await xxhash();

for (const benchCase of CASES) {
  const input = createInput(benchCase.size);
  const buffer = Buffer.from(
    input.buffer,
    input.byteOffset,
    input.byteLength,
  );

  const expected = xxh32(input, 0, input.length) >>> 0;
  const wasmHash = h32Raw(input, SEED) >>> 0;
  const xxhashjsHash = XXH.h32(buffer, SEED).toNumber() >>> 0;

  if (wasmHash !== expected || xxhashjsHash !== expected) {
    throw new Error(
      `hash mismatch: minixxh=${expected}, xxhash-wasm=${wasmHash}, xxhashjs=${xxhashjsHash}`,
    );
  }

  console.log(
    `Input: ${benchCase.label} x ${benchCase.iterations.toLocaleString()}`,
  );

  runBench(
    {
      name: 'minixxh',
      hash: () => xxh32(input, 0, input.length) >>> 0,
    },
    benchCase,
  );

  runBench(
    {
      name: 'xxhash-wasm',
      hash: () => h32Raw(input, SEED) >>> 0,
    },
    benchCase,
  );

  runBench(
    {
      name: 'xxhashjs',
      hash: () => XXH.h32(buffer, SEED).toNumber() >>> 0,
    },
    benchCase,
  );
}
