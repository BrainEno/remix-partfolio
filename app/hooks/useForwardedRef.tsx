import { useEffect, useRef, type ForwardedRef } from "react";

export const useForwardedRef = <T,>(ref: ForwardedRef<T>) => {
  const innerRef = useRef<T>(null);

  useEffect(() => {
    if (!ref) return;

    if (typeof ref === "function") {
      ref(innerRef.current);
      return () => ref(null);
    }

    ref.current = innerRef.current;
    return () => {
      ref.current = null;
    };
  }, [ref]);

  return innerRef;
};
