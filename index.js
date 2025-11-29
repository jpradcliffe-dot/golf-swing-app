import React from 'react';
import UploadPanel from '../src/components/UploadPanel';
import SwingViewer from '../src/components/SwingViewer';
import ControlsPanel from '../src/components/ControlsPanel';

export default function Home(){
  return (
    <div style={{padding:20}}>
      <h1>JPRg Swing Lab</h1>
      <UploadPanel />
      <div style={{height:500, marginTop:20}}>
        <SwingViewer />
      </div>
      <ControlsPanel />
    </div>
  );
}
