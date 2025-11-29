import fs from 'fs';
import path from 'path';
import formidable from 'formidable';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).end();

  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if(err) return res.status(500).json({error: err.message});
    const skeleton = {
      joints: [
        { name: "hip", position: [0,1.0,0] },
        { name: "spine", position: [0,1.3,0] },
        { name: "shoulder", position: [0,1.6,0] }
      ]
    };
    return res.status(200).json(skeleton);
  });
}
