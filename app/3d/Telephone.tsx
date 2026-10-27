import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  Component,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Object3D } from "three";
import { useMediaQuery } from "~/hooks/useMediaQuery";

/*
 * The editable source model is public/gltfs/telephone.gltf (37 MB, base64
 * textures). `npm run assets:model` rebuilds it into a ~1.7 MB binary GLB with
 * 1024² JPEG textures, and that GLB is what the runtime loads.
 *
 * The candidates are tried in order, one at a time: the next one is only
 * requested if the previous one actually fails, so the heavy .gltf is never
 * pulled down on a healthy load. (Passing the array straight to useGLTF makes
 * drei fetch *every* entry in parallel, which defeats the optimisation.)
 */
const MODEL_SOURCES = ["/generated/telephone.glb", "/gltfs/telephone.gltf"];

type TelephoneProps = {
  url: string;
  onReady?: () => void;
};

const Telephone = ({ url, onReady }: TelephoneProps) => {
  const ref = useRef<Object3D>(null);
  const elapsed = useRef(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const { scene } = useGLTF(url);

  useEffect(() => {
    onReady?.();
  }, [onReady, scene]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (reducedMotion) {
      ref.current.rotation.y = Math.PI / 2;
      return;
    }
    // An unhurried, bounded turn keeps the front of the booth readable. The
    // previous perpetual spin could present its back as the contact arrived.
    elapsed.current += Math.min(delta, 0.05);
    ref.current.rotation.y =
      Math.PI / 2 + Math.sin(elapsed.current * 0.45) * 0.2;
  });

  return (
    <primitive
      ref={ref}
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1.8}
      object={scene}
    />
  );
};

/**
 * Catches a loader rejection for one candidate and asks the parent to move on
 * to the next source. React resets the boundary because the parent renders it
 * with a new `key`.
 */
class ModelSourceBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Contact model source failed, trying fallback", error);
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

type TelephoneModelProps = {
  onError?: () => void;
  onReady?: () => void;
};

/**
 * Loads the first source that works. When every candidate has failed the
 * caller is told, so the contact composition can drop the booth entirely
 * instead of showing an empty stage.
 */
export const TelephoneModel = ({ onError, onReady }: TelephoneModelProps) => {
  const [sourceIndex, setSourceIndex] = useState(0);
  const source = MODEL_SOURCES[sourceIndex] as string | undefined;

  useEffect(() => {
    if (!source) onError?.();
  }, [source, onError]);

  if (!source) return null;

  return (
    <ModelSourceBoundary
      key={source}
      onFail={() => setSourceIndex((index) => index + 1)}
    >
      <Suspense fallback={null}>
        <Telephone url={source} onReady={onReady} />
      </Suspense>
    </ModelSourceBoundary>
  );
};

type SceneBoundaryProps = {
  children: ReactNode;
  onError: () => void;
  fallback: ReactNode;
};

/**
 * A WebGL or model failure used to propagate out of the react-three-fiber tree
 * and take the whole route down with it. The contact composition never depends
 * on the sculpture, so it is isolated here: the copy stays, the booth is
 * skipped, and the failure is reported to the caller.
 */
export class TelephoneSceneBoundary extends Component<
  SceneBoundaryProps,
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Contact WebGL scene failed", error);
    this.props.onError();
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}
