/**
 * Formats a numerical value for money to have exactly 2 decimal places.
 * @param value The numerical value to format.
 * @returns The formatted string.
 */
export const formatPrice = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
};
