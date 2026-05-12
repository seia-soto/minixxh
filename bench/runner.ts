import { performance } from 'node:perf_hooks';

export const CASES: Pref[] = [
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

export type Pref = {
  label: string;
  size: number;
  iterations: number;
  warmup: number;
};

export type Func = {
  name: string;
  hash: (() => number) | (() => bigint);
};

export function createInput(size: number): Uint8Array {
  const input = new Uint8Array(size);

  for (let i = 0; i < input.length; i++) {
    input[i] = (i * 31 + 17) & 0xff;
  }

  return input;
}

export function formatHash(value: number | bigint): string {
  return typeof value === 'bigint'
    ? `0x${value.toString(16)}`
    : `${value >>> 0}`;
}

export function runBench(
  { name, hash }: Func,
  pref: Pref,
): void {
  let check: bigint | number =
    typeof hash() === 'bigint' ? 0n : 0;

  for (let i = 0; i < pref.warmup; i++) {
    hash();
  }

  const start = performance.now();

  for (let i = 0; i < pref.iterations; i++) {
    // @ts-expect-error check and hash() output is always same.
    check ^= hash();
  }

  const seconds = (performance.now() - start) / 1000;
  const megabytes = (pref.size * pref.iterations) / 1024 / 1024;
  const throughput = megabytes / seconds;

  console.log(
    `${name.padEnd(14)} ${throughput.toFixed(2).padStart(10)} MiB/s ${seconds
      .toFixed(3)
      .padStart(8)}s check=${formatHash(check)}`,
  );
}
