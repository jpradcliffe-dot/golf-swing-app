import React from 'react';
import useStore from '../store/useStore';

export default function ControlsPanel(){
  const params = useStore(s=>s.params);
  const setParam = useStore(s=>s.setParam);

  return (
    <div style={{marginTop:20}}>
      <h3>Controls</h3>
      <label>Hip Rotate: {params.hipRotate}</label>
      <input type="range" min="-30" max="60" value={params.hipRotate}
        onChange={e=>setParam('hipRotate',+e.target.value)} />
    </div>
  )
}
