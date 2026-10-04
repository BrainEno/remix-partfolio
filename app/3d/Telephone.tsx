import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

const Telephone = () => {
  const ref = useRef<Mesh>(null!);
  const gltf = useGLTF("/gltfs/telephone.gltf");

  useFrame(() => {
    ref.current.rotation.y += 0.003;
  });

  return (
    <primitive
      ref={ref}
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1.8}
      object={gltf.scene}
    />
  );
};

export default Telephone;
