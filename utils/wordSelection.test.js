// Standalone check: node utils/wordSelection.test.js
// ponytail: hand-rolled asserts, no framework — this file is the one runnable check for selection math.
const assert = require('assert');
const path = require('path');
const { execSync } = require('child_process');

// Transpile the TS helper on the fly via the project's tsc, then require it.
const ts = require('typescript');
const fs = require('fs');
const src = fs.readFileSync(path.join(__dirname, 'wordSelection.ts'), 'utf8');
const js = ts.transpileModule(src, { compilerOptions: { module: 'commonjs' } }).outputText;
const m = { exports: {} };
new Function('module', 'exports', js)(m, m.exports);
const { tokenize, findWordAtPoint, rangeFromIndices, indexInRanges } = m.exports;

// tokenize
assert.deepStrictEqual(tokenize('  In the  name '), ['In', 'the', 'name']);
assert.deepStrictEqual(tokenize(''), []);

// Two words on one row: [0..20]x[0..10], [25..45]x[0..10]
const frames = [
  { x: 0, y: 0, w: 20, h: 10 },
  { x: 25, y: 0, w: 20, h: 10 },
  { x: 0, y: 15, w: 20, h: 10 }, // second row
];
assert.strictEqual(findWordAtPoint(frames, 5, 5), 0);   // direct hit
assert.strictEqual(findWordAtPoint(frames, 30, 5), 1);  // direct hit word 2
assert.strictEqual(findWordAtPoint(frames, 24, 5), 1);  // gap -> nearest on row (centre 35 closer than 10)
assert.strictEqual(findWordAtPoint(frames, 5, 18), 2);  // second row
assert.strictEqual(findWordAtPoint(frames, 200, 200), 1); // far -> nearest centre (word 1 is rightmost)
assert.strictEqual(findWordAtPoint([], 0, 0), -1);

// range
assert.deepStrictEqual(rangeFromIndices(4, 1), { start: 1, end: 4 });
assert.deepStrictEqual(rangeFromIndices(2, 2), { start: 2, end: 2 });

// inRanges
assert.strictEqual(indexInRanges(3, [{ start: 1, end: 4 }]), true);
assert.strictEqual(indexInRanges(5, [{ start: 1, end: 4 }]), false);

console.log('wordSelection: all asserts passed');
