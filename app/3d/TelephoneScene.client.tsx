import { Component, type ErrorInfo, type ReactNode } from "react";
import CanvasWrapper from "./CanvasWrapper";
import { TelephoneModel, TelephoneSceneBoundary } from "./Telephone";

type Props = {
  onError?: () => void;
};

/**
 * Error boundary for the WebGL subtree. Anything thrown while creating the
 * canvas, decoding the model or rendering a frame stops at this boundary, so
 * the contact copy stays on screen and the rest of the page keeps working.
 */
class CanvasErrorBoundary extends Component<
  { children: ReactNode; onError?: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Contact WebGL canvas failed", error, info);
    this.props.onError?.();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export default function TelephoneScene({ onError }: Props) {
  return (
    <CanvasErrorBoundary onError={onError}>
      <CanvasWrapper>
        <TelephoneSceneBoundary onError={() => onError?.()} fallback={null}>
          <TelephoneModel onError={() => onError?.()} />
        </TelephoneSceneBoundary>
      </CanvasWrapper>
    </CanvasErrorBoundary>
  );
}
