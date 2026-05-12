import test from 'ava';
import fc from 'fast-check';
import XXH from 'xxhashjs';
import { Buffer } from 'node:buffer';

import { xxh32 } from '../src/xxh32.js';

test('xxh32 matches xxhashjs h32', (t) => {
  const SEED = 0x9e3779b1 | 0;

  fc.assert(
    fc.property(fc.uint8Array({ maxLength: 1024 }), (bytes) => {
      const actual = xxh32(bytes, 0, bytes.length) >>> 0;
      const expected =
        XXH.h32(Buffer.from(bytes), SEED).toNumber() >>> 0;

      t.is(actual, expected, `Uint8Array<${bytes.toString()}>`);
    }),
    {
      numRuns: 1_000_000,
      seed: 0x12345678,
    },
  );
});
