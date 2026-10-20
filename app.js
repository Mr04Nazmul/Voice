// SPDX-License-Identifier: GPL-3.0-or-later
// Static-only application: no secret keys, scripted answers, or remote chat API.
const $ = s => document.querySelector(s);
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;
const state = {active:false, muted:true, silent:false, busy:false, speaking:false, ready:false, loading:false,
  session:0, stream:null, recognition:null, recognizing:false, micAllowed:false, restart:null,
  timer:null, started:0, history:[], engine:null, abort:null, photoURL:null, audioURL:null, utterance:null};
const MODEL = 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/50968a4468ef4233ed78cd7c3de230dd1d61a56b/Qwen3-0.6B-Q4_K_M.gguf';
const SYSTEM = 'You are Sadia, a friendly AI assistant. You are not the real person in the photo. Reply only in Bengali (বাংলা), naturally and briefly in 1 or 2 sentences. Never claim real personal memories. If unsure, say so. /no_think';
function status(t) { $('#status').textContent=t; }
function note(t) { $('#caption').textContent=t; }
function add(role,text) { const p=document.createElement('p');p.className=role;
 const b=document.createElement('b');b.textContent=role==='user'?'তুমি':'Sadia · AI';p.append(b,document.createTextNode(text));$('#messages').append(p);
 while($('#messages').children.length>40)$('#messages').firstChild.remove();p.scrollIntoView({block:'nearest'});return p;
}
function stopRecognition() { clearTimeout(state.restart);state.restart=null;try{state.recognition?.abort();}catch{} }
function stopSpeech() { state.audioEpoch=(state.audioEpoch||0)+1;try{state.audioSource?.stop();}catch{}state.audioSource=null; state.utterance=null;state.speaking=false;synth?.cancel();$('#app').classList.remove('speaking'); }
function voices() { return synth?.getVoices().filter(v=>/^bn(?:-|_|$)/i.test(v.lang)) || []; }
function refreshVoices() { const selected=$('#voices').value;$('#voices').replaceChildren();const list=voices();
 const fallback=document.createElement('option');fallback.value='robot';fallback.textContent='Free Bengali · robotic local voice (18.5 MB)';
 for(const v of list){const o=document.createElement('option');o.value=v.voiceURI;o.textContent=v.name+' · '+v.lang;$('#voices').append(o);}
 $('#voices').append(fallback);if(selected==='robot'||list.some(v=>v.voiceURI===selected))$('#voices').value=selected;
 $('#voiceStatus').textContent=list.length?'System TTS, Sadia-এর cloned voice নয়।':'বাংলা system voice নেই। Free local robotic voice ব্যবহার হবে; এটি Sadia-এর কণ্ঠ নয়। প্রথমবার 18.5 MB download।';
}
refreshVoices();synth?.addEventListener('voiceschanged',refreshVoices);
function listen() {
 if(!state.active||state.muted||state.busy||state.speaking||!state.micAllowed||state.recognizing||document.hidden)return;
 if(!SR){status('Speech recognition নেই — লিখে পাঠাও');return;}
 if(!state.recognition){const r=new SR();state.recognition=r;r.lang='bn-BD';r.continuous=false;r.interimResults=true;
 r.onstart=()=>{state.recognizing=true;if(state.active&&!state.muted)status('শুনছি… বাংলায় বলো');};
 r.onresult=e=>{if(!state.active||state.muted||state.busy||state.speaking)return;
  const result=e.results[e.resultIndex];if(result?.isFinal){const text=result[0].transcript.trim();if(text)void respond(text);}else if(result)note('তুমি: '+result[0].transcript);};
 r.onerror=e=>{if(!state.active)return;status('মাইক: '+e.error+' — লিখেও পাঠাতে পারো');
  if(['not-allowed','service-not-allowed','audio-capture','language-not-supported','network'].includes(e.error)){state.muted=true;updateMic();}};
 r.onend=()=>{state.recognizing=false;if(state.active&&!state.muted&&!state.busy&&!state.speaking)state.restart=setTimeout(listen,900);};
 }
 try{state.recognition.start();}catch(e){if(e.name!=='InvalidStateError')status('মাইক চালু হয়নি — আবার চাপো');}
}
function updateMic(){ $('#mute').setAttribute('aria-pressed',String(state.muted));$('#mute').setAttribute('aria-label',state.muted?'Unmute microphone':'Mute microphone');$('#micLabel').textContent=state.muted?'মাইক বন্ধ':'শুনছি'; }
async function speak(text, test=false) {
 if(state.silent||(!state.active&&!test)){if(state.active)listen();return;}
 if($('#voices').value==='robot'){await roboticSpeech(text,test);return;}
 const voice=voices().find(v=>v.voiceURI===$('#voices').value)||voices()[0];
 if(!voice){status('বাংলা voice নেই — উত্তর screen-এ দেখো');if(state.active)listen();return;}
 stopRecognition();stopSpeech();const session=state.session;
 const u=new SpeechSynthesisUtterance(text);state.utterance=u;u.lang=voice.lang;u.voice=voice;u.rate=.96;
 const done=()=>{if(state.utterance!==u)return;state.utterance=null;state.speaking=false;$('#app').classList.remove('speaking');
  if(state.active&&state.session===session){status(state.muted?'মাইক বন্ধ · লিখে পাঠাও':'শুনছি…');listen();}};
 u.onstart=()=>{if((!state.active&&!test)||state.session!==session){synth.cancel();return;}state.speaking=true;$('#app').classList.add('speaking');status('Sadia কথা বলছে…');};
 u.onend=done;u.onerror=e=>{done();if(!['canceled','interrupted'].includes(e.error))status('Audio: '+e.error+' — voice পরীক্ষা করো');};
 state.speaking=true; synth.speak(u);
}
async function loadAI(){
 if(state.ready||state.loading)return;state.loading=true;$('#loadAI').disabled=true;$('#progress').hidden=false;$('#modelStatus').textContent='AI engine চালু হচ্ছে…';
 try{
  if(!window.WebAssembly)throw Error('এই browser WebAssembly সমর্থন করে না');
  const {Wllama}=await import('./vendor/wllama/index.js');
  state.engine=new Wllama({'single-thread/wllama.wasm':new URL('./vendor/wllama/wllama.wasm',import.meta.url).href},{parallelDownloads:1,logger:{debug(){},log(){},warn:console.warn,error:console.error},suppressNativeLog:true});
  const modelURL=$('#modelChoice').value==='quality'?'https://huggingface.co/unsloth/Qwen3-1.7B-GGUF/resolve/d7f544eead698dbd1f15126ef60b45a1e1933222/Qwen3-1.7B-Q4_K_M.gguf':MODEL;
  $('#modelChoice').disabled=true;
  await state.engine.loadModelFromUrl(modelURL,{n_ctx:1024,n_batch:64,n_threads:1,useCache:true,
   progressCallback:({loaded,total})=>{const percent=total?Math.round(loaded/total*100):0;$('#progress').value=percent;
    $('#modelStatus').textContent=total&&loaded===total?'Download শেষ · model memory-তে load হচ্ছে…':`Model download ${percent}% · ${Math.round(loaded/1e6)} MB${total?' / '+Math.round(total/1e6)+' MB':''}`;}});
  $('#app').dataset.model=$('#modelChoice').value==='quality'?'Qwen3-1.7B':'Qwen3-0.6B';state.ready=true;$('#welcome').hidden=true;$('#loadAI').textContent='AI ready';note('AI প্রস্তুত। কল শুরু করে বাংলায় লিখো বা মাইক চালু করো।');status('On-device AI প্রস্তুত');
 }catch(e){console.error('AI load failed',e);$('#modelStatus').textContent='AI load হয়নি: '+e.message+'। Network/storage পরীক্ষা করে আবার চেষ্টা করো।';$('#loadAI').textContent='↻ আবার চেষ্টা করো';try{await state.engine?.exit();}catch{}state.engine=null;
 }finally{state.loading=false;$('#loadAI').disabled=false;$('#modelChoice').disabled=false;}
}
function startCall(){if(state.active)return;state.active=true;state.session++;state.started=Date.now();$('#app').classList.add('active');$('#call').setAttribute('aria-label','End call');$('#callLabel').textContent='End';
 status(state.ready?'কল শুরু · মাইক বন্ধ':'কল শুরু · আগে Free AI চালু করো');note(state.ready?'হ্যালো! কী নিয়ে কথা বলতে চাও?':'Free AI চালু করো; model ছাড়া AI উত্তর দেওয়া হবে না।');
 state.timer=setInterval(()=>{const s=Math.floor((Date.now()-state.started)/1000);$('#clock').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');},1000);
 // Unlock speech under the call button's user gesture. No automatic greeting is passed off as an LLM reply.
 unlockAudio();synth?.resume();if(!state.muted)listen();
}
function cameraOff(){state.stream?.getTracks().forEach(t=>t.stop());state.stream=null;$('#camera').srcObject=null;$('#self').classList.remove('on');$('#cameraToggle').setAttribute('aria-pressed','false');$('#cameraToggle').setAttribute('aria-label','Turn camera on');}
function endCall(){state.active=false;state.session++;state.abort?.abort();stopRecognition();stopSpeech();clearInterval(state.timer);state.muted=true;updateMic();cameraOff();$('#app').classList.remove('active');$('#call').setAttribute('aria-label','Start call');$('#callLabel').textContent='Call';status('কল শেষ হয়েছে');note('আবার কথা বলতে কল করো।');}
async function respond(text){text=text.trim().slice(0,450);if(!text)return;
 if(state.busy){status('আগের উত্তর আসছে — একটু অপেক্ষা করো');return;}
 if(!state.ready){note('প্রথমে Free AI চালু করো। কোনো scripted উত্তর ব্যবহার করা হয় না।');$('#welcome').hidden=false;return;}
 if(!state.active)startCall();stopRecognition();stopSpeech();state.busy=true;state.abort=new AbortController();const session=state.session;$('#send').disabled=true;status('ভাবছি…');add('user',text);const p=add('assistant','…');note('ভাবছি…');
 try{
  // Keep prompts within 1024 tokens; Bengali often uses several tokens per character.
  const messages=[{role:'system',content:SYSTEM},...state.history.slice(-2),{role:'user',content:text}];
  while(messages.length>2 && (await state.engine.tokenize(await state.engine.formatChat(messages,true),true)).length>820) messages.splice(1,Math.min(2,messages.length-2));
  if((await state.engine.tokenize(await state.engine.formatChat(messages,true),true)).length>820)throw Error('প্রশ্নটি একটু ছোট করে লিখো');
  const output=await state.engine.createCompletion((await state.engine.formatChat(messages,true))+'<think>\n\n</think>\n\n',{nPredict:120,useCache:false,abortSignal:state.abort.signal,sampling:{temp:.6,top_p:.9,repeat_penalty:1.1},
   onNewToken:(_t,_p,current,{abortSignal})=>{if(!state.active||state.session!==session){abortSignal();return;}p.lastChild.textContent=current;note(current);}});
  if(!state.active||state.session!==session)return;
  const answer=output.replace(/<think>[\s\S]*?<\/think>/g,'').trim();if(!answer)throw Error('মডেল খালি উত্তর দিয়েছে, আবার চেষ্টা করো');
  p.lastChild.textContent=answer;note(answer);state.history.push({role:'user',content:text},{role:'assistant',content:answer.slice(0,450)});state.history=state.history.slice(-2);
  status('উত্তর প্রস্তুত');state.busy=false;await speak(answer);
 }catch(e){if(state.active&&state.session===session){p.lastChild.textContent='উত্তর তৈরি হয়নি।';note('AI error: '+e.message);status('আবার ছোট প্রশ্ন লিখে চেষ্টা করো');}}
 finally{state.busy=false;$('#send').disabled=false;if(state.active&&state.session===session&&!state.speaking)listen();}
}
$('#loadAI').onclick=loadAI;$('#call').onclick=()=>state.active?endCall():startCall();
$('#composer').onsubmit=e=>{e.preventDefault();const text=$('#message').value.trim();if(text&&state.ready&&!state.busy){$('#message').value='';void respond(text);}else if(!state.ready)note('প্রথমে Free AI চালু করো।');};
$('#mute').onclick=()=>{if(!state.active)startCall();if(!state.muted){state.muted=true;stopRecognition();updateMic();status('মাইক বন্ধ');return;}
 if(!SR){status('এই browser-এ speech recognition নেই — text chat ব্যবহার করো');return;}
 if(!state.micAllowed){$('#micConsent').showModal();return;}state.muted=false;updateMic();listen();};
$('#micAgree').onclick=()=>{state.micAllowed=true;state.muted=false;updateMic();$('#micConsent').close();listen();};$('#micDecline').onclick=()=>$('#micConsent').close();
let cameraRequest=0, facing='user';
$('#cameraToggle').onclick=async()=>{if(state.stream){cameraOff();return;}const request=++cameraRequest,session=state.session;$('#cameraToggle').disabled=true;
 try{if(!navigator.mediaDevices?.getUserMedia)throw Error('Camera requires HTTPS and a supported browser');
  const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:facing},width:{ideal:320},height:{ideal:480}},audio:false});
  if(request!==cameraRequest||state.session!==session){stream.getTracks().forEach(t=>t.stop());return;}
  state.stream=stream;$('#camera').srcObject=stream;await $('#camera').play();$('#self').classList.add('on');$('#cameraToggle').setAttribute('aria-pressed','true');$('#cameraToggle').setAttribute('aria-label','Turn camera off');
 }catch(e){cameraOff();status('Camera: '+e.message);}finally{$('#cameraToggle').disabled=false;}};
$('#switchCamera').onclick=async()=>{facing=facing==='user'?'environment':'user';cameraOff();await $('#cameraToggle').onclick();};
$('#speaker').onclick=()=>{state.silent=!state.silent;$('#speaker').setAttribute('aria-pressed',String(state.silent));$('#speaker').setAttribute('aria-label',state.silent?'Unmute speaker':'Mute speaker');if(state.silent){stopSpeech();listen();}};
$('#chatToggle').onclick=()=>{$('#chat').hidden=!$('#chat').hidden;$('#chatToggle').setAttribute('aria-expanded',String(!$('#chat').hidden));};
$('#captionsToggle').onclick=()=>{$('#caption').hidden=!$('#caption').hidden;$('#captionsToggle').textContent=$('#caption').hidden?'CC off':'CC on';$('#captionsToggle').setAttribute('aria-pressed',String(!$('#caption').hidden));};
$('#clearChat').onclick=()=>{if(state.busy){status('উত্তর শেষ হলে chat মুছতে পারবে');return;}state.history=[];$('#messages').replaceChildren();note('কথোপকথন মুছে ফেলা হয়েছে।');};
$('#settingsOpen').onclick=$('#settingsMore').onclick=()=>{refreshVoices();$('#settings').showModal();};$('#settingsClose').onclick=()=>$('#settings').close();
$('#photo').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/')||f.size>15e6){status('15 MB-এর ছোট ছবি বেছে নাও');return;}
 const url=URL.createObjectURL(f),probe=new Image();probe.onload=()=>{if(state.photoURL)URL.revokeObjectURL(state.photoURL);state.photoURL=url;$('#face').src=url;};probe.onerror=()=>{URL.revokeObjectURL(url);status('এই ছবি format খোলা যাচ্ছে না; JPG/PNG বেছে নাও');};probe.src=url;};
$('#resetPhoto').onclick=()=>{if(state.photoURL)URL.revokeObjectURL(state.photoURL);state.photoURL=null;$('#face').src='./assets/sadia.jpg?v=5';$('#photo').value='';};
$('#reference').onchange=e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>25e6){status('25 MB-এর ছোট audio বেছে নাও');return;}if(state.audioURL)URL.revokeObjectURL(state.audioURL);state.audioURL=URL.createObjectURL(f);$('#referenceAudio').src=state.audioURL;$('#referenceAudio').hidden=false;};
$('#testVoice').onclick=()=>{unlockAudio();refreshVoices();void speak('হ্যালো, আমি সাদিয়া এআই। তুমি কেমন আছো?',true);};
$('#forget').onclick=async()=>{if(state.loading){$('#voiceStatus').textContent='Model download শেষ হলে cache মুছতে পারবে।';return;}endCall();
 try{while(state.busy)await new Promise(r=>setTimeout(r,50));await state.engine?.exit();await state.engine?.cacheManager.clear();state.engine=null;state.ready=false;$('#welcome').hidden=false;$('#loadAI').textContent='↓ Free AI চালু করো';$('#progress').value=0;$('#modelStatus').textContent='AI cache মুছে ফেলা হয়েছে।';$('#resetPhoto').click();$('#referenceAudio').pause();$('#referenceAudio').removeAttribute('src');$('#referenceAudio').load();$('#referenceAudio').hidden=true;$('#reference').value='';if(state.audioURL)URL.revokeObjectURL(state.audioURL);state.audioURL=null;state.history=[];$('#messages').replaceChildren();$('#voiceStatus').textContent='Local media এবং AI cache মুছে ফেলা হয়েছে।';}catch(e){$('#voiceStatus').textContent='Cache মুছতে সমস্যা: '+e.message;}};
$('#capabilities').textContent=`Speech recognition: ${SR?'API পাওয়া গেছে; Bengali service এখনও test প্রয়োজন':'নেই'} · TTS: ${synth?'পাওয়া গেছে':'নেই'} · WebAssembly: ${!!window.WebAssembly} · WebGPU: ${!!navigator.gpu} (AI uses CPU WASM)`;
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopRecognition();stopSpeech();cameraOff();state.muted=true;updateMic();}else if(state.active)status('ফিরে এসেছো · মাইক আবার চালু করো');});
window.addEventListener('pagehide',()=>{endCall();if(state.photoURL)URL.revokeObjectURL(state.photoURL);if(state.audioURL)URL.revokeObjectURL(state.audioURL);});

const icons={cameraToggle:'<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 10 6-4v12l-6-4z"/>',mute:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',call:'<path d="M4 15c4-5 12-5 16 0l1-2c1-5-19-5-18 0z"/>',switchCamera:'<path d="M4 7h4l2-3h4l2 3h4v14H4z"/><path d="M9 12a4 4 0 1 1-1 4m0 0v-3m0 3h3"/>',settingsMore:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'};
for(const [id,paths] of Object.entries(icons))document.getElementById(id).innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+paths+'</svg>';

function unlockAudio(){try{state.audioContext ||= new (window.AudioContext||window.webkitAudioContext)();void state.audioContext.resume();}catch{}}
let ttsWorker=null,ttsId=0;const ttsJobs=new Map();
function synthesizeBengali(text){return new Promise((resolve,reject)=>{
 if(!ttsWorker){ttsWorker=new Worker(new URL('./tts-worker.js',import.meta.url),{type:'module'});
 ttsWorker.onmessage=({data})=>{const job=ttsJobs.get(data.id);if(!job)return;clearTimeout(job.timer);ttsJobs.delete(data.id);data.error?job.reject(Error(data.error)):job.resolve(data.wav);};
 ttsWorker.onerror=()=>{for(const job of ttsJobs.values()){clearTimeout(job.timer);job.reject(Error('Free voice worker load হয়নি'));}ttsJobs.clear();ttsWorker?.terminate();ttsWorker=null;};}
 const id=++ttsId;const timer=setTimeout(()=>{ttsJobs.delete(id);reject(Error('Voice download timeout; আবার চেষ্টা করো'));},90000);ttsJobs.set(id,{resolve,reject,timer});ttsWorker.postMessage({id,text});
 });}
async function roboticSpeech(text,test){stopRecognition();stopSpeech();const epoch=state.audioEpoch,session=state.session;state.speaking=true;status('Free বাংলা audio তৈরি হচ্ছে…');
 try{unlockAudio();const wav=await synthesizeBengali(text);if(epoch!==state.audioEpoch||session!==state.session||(!state.active&&!test))return;
 const context=state.audioContext;if(!context)throw Error('AudioContext পাওয়া যায়নি');await context.resume();if(context.state!=='running')throw Error('Voice test button চেপে audio চালু করো');
 const buffer=await context.decodeAudioData(wav);if(epoch!==state.audioEpoch)return;
 const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination);state.audioSource=source;
 $('#voiceStatus').textContent=`Free Bengali audio generated: ${buffer.duration.toFixed(1)}s · ${buffer.length} samples · robotic, not cloned`;
 source.onended=()=>{if(epoch!==state.audioEpoch)return;state.audioSource=null;state.speaking=false;$('#app').classList.remove('speaking');if(state.active){status(state.muted?'মাইক বন্ধ · লিখে পাঠাও':'শুনছি…');listen();}};
 source.start();$('#app').classList.add('speaking');status('Sadia AI · robotic বাংলা voice');
 }catch(e){if(epoch===state.audioEpoch){state.speaking=false;$('#app').classList.remove('speaking');status('Audio: '+e.message);$('#voiceStatus').textContent=e.message;if(state.active)listen();}}
}
