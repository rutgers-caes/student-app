const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync('src/pages/AssessmentMetricsPage/metric-display-value.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText;
const loaded = { exports: {} };
new Function('exports', 'module', compiled)(loaded.exports, loaded);
const { comparisonMetricValue } = loaded.exports;
assert.equal(comparisonMetricValue({ value: 3, savings: 4200 }, 'currency'), 4200);
assert.equal(comparisonMetricValue({ value: 3, savings: 4200 }, 'number'), 3);
assert.equal(comparisonMetricValue({ value: 3, savings: 0 }, 'currency'), 0);
assert.equal(comparisonMetricValue({ value: 3, savings: null }, 'currency'), null);
assert.equal(comparisonMetricValue({ value: null, savings: 4200 }, 'number'), null);
console.log('PASS: five metric-display checks preserve savings, quantities, zero, and missing values.');
