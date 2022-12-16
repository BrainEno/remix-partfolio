import type * as THREE from "three";
import { Float, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useRef, useState } from "react";
import { Mesh, Vector3 } from "three";

const Banana = (props: ThreeElements["mesh"]) => {
  const mesh = useRef<THREE.Mesh>(null!);
  const gltf = useGLTF("/gltfs/banana.gltf");

  return (
    <primitive
      position={[0, 0, 0]}
      rotation={[0,Math.PI / 2,, 0]}
      scale={0.1}
      object={gltf.scene}
    />
  );
};

export default Banana;
