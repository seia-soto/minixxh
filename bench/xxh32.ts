import XXH from 'xxhashjs';
import xxhash from 'xxhash-wasm';

import { SEED, xxh32 } from '../src/xxh32.js';
import { CASES, createInput, runBench } from './runner.js';

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
