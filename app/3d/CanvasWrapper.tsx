import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

const CanvasWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Canvas
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
