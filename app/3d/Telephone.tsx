import { useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";

const Telephone = (props: ThreeElements["mesh"]) => {
  // const mesh = useRef<THREE.Mesh>(null!);
  const gltf = useGLTF("/gltfs/telephone.gltf");

  return (
    <primitive
      position={[0, 0, 0]}
      rotation={[0, Math.PI / 2, 0]}
      scale={1.5}
      object={gltf.scene}
    />
  );
};

export default Telephone;
