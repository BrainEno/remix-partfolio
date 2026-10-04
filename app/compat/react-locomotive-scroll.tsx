import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type ScrollInstance = any;

type ScrollContextValue = {
  scroll: ScrollInstance | null;
  isReady: boolean;
};

const ScrollContext = createContext<ScrollContextValue>({
  scroll: null,
  isReady: false,
});

type LocomotiveScrollProviderProps = {
  children: ReactNode;
  options?: Record<string, unknown>;
  watch?: unknown[];
  containerRef: RefObject<HTMLElement | null>;
  onUpdate?: () => void;
};

export function LocomotiveScrollProvider({
  children,
  options = {},
  containerRef,
  onUpdate,
}: LocomotiveScrollProviderProps) {
  const [scroll, setScroll] = useState<ScrollInstance | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let active = true;
    let instance: ScrollInstance | null = null;

    void import("locomotive-scroll").then(({ default: LocomotiveScroll }) => {
      if (!active) return;

      instance = new LocomotiveScroll({
        el: element,
        ...options,
      });
      setScroll(instance);
      instance.update?.();
      onUpdate?.();
    });

    return () => {
      active = false;
      instance?.destroy?.();
      setScroll(null);
    };
  }, [containerRef, onUpdate, options]);

  const value = useMemo(
    () => ({ scroll, isReady: scroll !== null }),
    [scroll]
  );

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export function useLocomotiveScroll() {
  return useContext(ScrollContext);
}
