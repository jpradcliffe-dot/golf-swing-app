import React, { useState } from 'react';

export default function UploadPanel(){
  const [msg,setMsg]=useState('Upload a swing video');

  async function handle(e){
    const f=e.target.files[0];
    const fd=new FormData();
    fd.append('file',f);
    const r=await fetch('/api/upload',{method:'POST',body:fd});
    const j=await r.json();
    localStorage.setItem('jprg_skeleton',JSON.stringify(j));
    setMsg('Uploaded & processed');
  }

  return (
    <div>
      <p>{msg}</p>
      <input type="file" accept="video/*" onChange={handle}/>
    </div>
  );
}
