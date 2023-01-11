import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

const CanvasWrapper = ({ children }: { children: JSX.Element }) => {
  return (
    <Canvas>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
};

export default CanvasWrapper;
