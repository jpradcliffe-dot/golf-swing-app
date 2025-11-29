import create from 'zustand';

export default create((set)=>({
  params:{ hipRotate:0, shoulderTurn:60, spineTilt:0, wrist:10 },
  setParam:(k,v)=>set(s=>({params:{...s.params,[k]:v}}))
}));
