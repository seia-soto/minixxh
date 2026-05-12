# minixxh

`minixxh` is a fork of [`xxhashjs`](https://github.com/pierrec/js-xxhash)
by Pierre Curto, refactored to use ES Module and Uint8Array.

[xxHash](https://github.com/Cyan4973/xxHash) is a very fast
hashing algorithm, and this library provides pure JavaScript
implementation of xxHash32. It is valuable especially in the
restrictive environment such as service worker or under strict
CSP regulation.

**Benchmark**

The below is the output of `pnpm bench` on Apple M1 16GB running
Node.JS v26.1.0 via macOS 26.4.1 (Darwin Kernel Version 25.4.0).

```
Input: 64 B x 5,000,000
minixxh         1810.76 MiB/s    0.169s check=0
xxhash-wasm     1821.84 MiB/s    0.168s check=0
xxhashjs         169.49 MiB/s    1.801s check=0
Input: 512 B x 2,500,000
minixxh         2450.47 MiB/s    0.498s check=0
xxhash-wasm     4777.30 MiB/s    0.256s check=0
xxhashjs         422.05 MiB/s    2.892s check=0
Input: 1 KiB x 1,000,000
minixxh         2507.81 MiB/s    0.389s check=0
xxhash-wasm     5419.82 MiB/s    0.180s check=0
xxhashjs         469.07 MiB/s    2.082s check=0
Input: 64 KiB x 20,000
minixxh         2594.97 MiB/s    0.482s check=0
xxhash-wasm     6208.43 MiB/s    0.201s check=0
xxhashjs         529.44 MiB/s    2.361s check=0
Input: 1 MiB x 1,000
minixxh         2582.26 MiB/s    0.387s check=0
xxhash-wasm     6049.81 MiB/s    0.165s check=0
xxhashjs         521.08 MiB/s    1.919s check=0
```

**Installation**

```sh
npm install minixxh
```

## API

### `xxh32(input: Uint8Array, beg: number, end: number): number`

```javascript
import { xxh32 } from 'minixxh/xxh32';

const input = new TextEncoder().encode('abcd');
const hash = xxh32(input, 0, input.length);

console.log(hash.toString(16));
```

- `input` must be a `Uint8Array`.
- `beg` and `end` are byte offsets.
- The seed is **static**: `0x9e3779b1`.
- The return value is an unsigned 32-bit integer.

### `xxh32d64(input: Uint8Array, beg: number, end: number): bigint`

```javascript
import { xxh32d64 } from 'minixxh/xxh32d64';

const input = new TextEncoder().encode('abcd');
const hash = xxh32d64(input, 0, input.length);

console.log(hash.toString(16));
```

`xxh32d64` calculates two xxHash32 values in one pass using two
different static seeds, then merges them into one `bigint`:

```javascript
(BigInt(highHash) << 32n) | BigInt(lowHash);
```

- `input` must be a `Uint8Array`.
- `beg` and `end` are byte offsets.
- The high 32-bit seed is **static**: `0x9e3779b1`.
- The low 32-bit seed is **static**: `0x85ebca77`.
- The return value is an unsigned `bigint`.

## License

MIT
