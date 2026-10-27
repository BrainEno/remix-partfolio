import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

/* The cabinet is a tall, narrow object: 0.82 x 2 x 0.82 world units before the
   scene's own 1.8 scale. R3F's default camera is a 75 degree fov at z = 5,
   which shows about 7.7 units of height, so the booth filled barely half of
   its own container and roughly a fifth of its width. 34 degrees at z = 8
   shows about 4.9 units, so the booth fills about three quarters of the
   container height; the container's 2/5 aspect ratio keeps it centred with
   sane side margins. Getting the framing right is also what makes the
   entrance trustworthy - a booth that is never cropped can be moved by a
   transform without losing its edges. */
const CANVAS_CAMERA = {
  position: [0, 0, 8] as [number, number, number],
  fov: 34,
};

const CanvasWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Canvas
      camera={CANVAS_CAMERA}
      dpr={[1, 1.5]}
      frameloop="always"
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
      }}
      performance={{ min: 0.5, debounce: 250 }}
    >
      {/*
        The booth is a textured enamel object, not a lit studio prop: with a
        0.5 ambient and a narrow 0.15 rad spot most of it fell into silhouette
        and read as a dark red blob over the type. A brighter ambient plus a
        front fill keeps the phone box's red and its TELEPHONE sign legible on
        the white page, and a lower-intensity back light keeps the edges.
      */}
      <ambientLight intensity={0.95} />
      <directionalLight position={[4, 6, 9]} intensity={1.15} />
      <spotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={1.1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
};

export default CanvasWrapper;
