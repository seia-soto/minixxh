import { xxh32d64 } from '../src/xxh32d64.js';
import { CASES, createInput, runBench } from './runner.js';

for (const benchCase of CASES) {
  const input = createInput(benchCase.size);

  console.log(
    `Input: ${benchCase.label} x ${benchCase.iterations.toLocaleString()}`,
  );

  runBench(
    {
      name: 'minixxh',
      hash: () => xxh32d64(input, 0, input.length),
    },
    benchCase,
  );
}
