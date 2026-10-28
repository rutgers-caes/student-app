// Savings-only rows must read the savings field, not the quantity field.
export function comparisonMetricValue(
  metric: { value: number | null; savings: number | null },
  valueType: 'currency' | 'number',
): number | null {
  return valueType === 'currency' ? metric.savings : metric.value;
}
