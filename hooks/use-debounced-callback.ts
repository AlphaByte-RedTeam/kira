import { debounce } from "lodash";
import { useEffect, useState } from "react";

export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
) {
  const [debounced] = useState(() =>
    debounce((...args: Parameters<T>) => callback(...args), delay),
  );

  useEffect(() => {
    debounced.cancel();
  }, [debounced]);

  return debounced;
}
