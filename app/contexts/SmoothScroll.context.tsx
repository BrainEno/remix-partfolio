import type { InstanceOptions } from "locomotive-scroll";
import type LocomotiveScroll from "locomotive-scroll";
import type { ReactNode } from "react";
import { useState, useEffect, createContext } from "react";

export const SmoothScrollContext = createContext<{
  scroll: LocomotiveScroll | null;
}>({
  scroll: null,
});

export const SmoothScrollProvider = ({
  children,
  options,
}: {
  children: ReactNode;
  options: InstanceOptions;
}) => {
  const [scroll, setScroll] = useState<LocomotiveScroll | null>(null);

  useEffect(() => {
    if (!scroll) {
      (async () => {
        try {
          const LocomotiveScroll = (await import("locomotive-scroll")).default;
          setScroll(
            new LocomotiveScroll({
              el:
                (document.querySelector(
                  "[data-scroll-container]"
                ) as HTMLElement) ?? undefined,
              ...options,
            })
          );
        } catch (error) {
          throw Error(`[SmoothScrollProvider]:${error}`);
        }
      })();
    }

    return () => {
      scroll && scroll.destroy();
    };
  }, [options, scroll]);

  return (
    <SmoothScrollContext.Provider value={{ scroll }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
