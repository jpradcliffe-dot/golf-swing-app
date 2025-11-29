import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function Rig({ joints }){
  return (
    <group>
      {joints.map((j,i)=>(
        <mesh key={i} position={j.position}>
          <sphereGeometry args={[0.05,16,16]}/>
          <meshStandardMaterial color="cyan"/>
        </mesh>
      ))}
    </group>
  );
}

export default function SwingViewer(){
  const [skel,setSkel]=useState(null);
  useEffect(()=>{
    const raw=localStorage.getItem('jprg_skeleton');
    if(raw) setSkel(JSON.parse(raw));
  },[]);

  return (
    <Canvas camera={{position:[0,1,3]}}>
      <ambientLight intensity={0.7}/>
      <OrbitControls />
      {skel && <Rig joints={skel.joints}/>}
    </Canvas>
  );
}
