// SPDX-License-Identifier: GPL-3.0-or-later
// Bengali formant synthesis, entirely local. Not a voice clone.
import ESpeakNG from 'https://cdn.jsdelivr.net/npm/espeak-ng@1.0.2/dist/espeak-ng.js';
let queue=Promise.resolve();
self.onmessage=({data:{id,text,emotion}})=>{queue=queue.then(async()=>{
 try{const module=await ESpeakNG({arguments:['-w','speech.wav','-v','bn','-s',emotion==='gentle'?'135':emotion==='cheerful'?'165':'150','-p',emotion==='gentle'?'45':'55',text],print(){},printErr(){}});
 const bytes=module.FS.readFile('speech.wav');const wav=bytes.slice().buffer;self.postMessage({id,wav},[wav]);
 }catch(e){self.postMessage({id,error:String(e.message||e)});}
 });};
