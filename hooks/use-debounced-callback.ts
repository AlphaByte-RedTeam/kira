import { debounce } from "lodash";
import { useEffect, useState } from "react";
export function useDebouncedCallback<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  delay: number,
) {
  const [debounced] = useState(() =>
    debounce((...args: TArgs) => callback(...args), delay),
  );

  useEffect(() => {
    return () => {
      debounced.cancel();
    };
  }, [debounced]);

  return debounced;
}
