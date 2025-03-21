export const memoizedDateFormatter = (date: string) => {
  return new Date(date).toLocaleDateString();
};

export const memoizedNumberFormatter = (number: number, decimals: number = 4) => {
  return number.toFixed(decimals);
};

export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  return debounced as (...args: Parameters<F>) => ReturnType<F>;
}; 