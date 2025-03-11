export const memoizedDateFormatter = (() => {
  const cache = new Map<string, string>();
  
  return (date: string): string => {
    if (cache.has(date)) {
      return cache.get(date)!;
    }
    const formatted = new Date(date).toLocaleDateString();
    cache.set(date, formatted);
    return formatted;
  };
})();

export const memoizedNumberFormatter = (() => {
  const cache = new Map<number, string>();
  
  return (value: number, decimals: number = 4): string => {
    const key = value * Math.pow(10, decimals);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const formatted = value.toFixed(decimals);
    cache.set(key, formatted);
    return formatted;
  };
})();

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 