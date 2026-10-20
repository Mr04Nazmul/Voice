from pathlib import Path
import time,json
import torch,soundfile as sf
from f5_tts.model import DiT
from f5_tts.infer.utils_infer import load_model,load_vocoder,infer_batch_process
import argparse
parser=argparse.ArgumentParser(description='Private authorized Bengali reference-conditioned speech rendering; CPU, not realtime.')
parser.add_argument('--models', type=Path, required=True)
parser.add_argument('--reference', type=Path, required=True)
parser.add_argument('--reference-text-file', type=Path, required=True)
parser.add_argument('--text-file', type=Path, required=True)
parser.add_argument('--output', type=Path, required=True)
args=parser.parse_args()
args.output.parent.mkdir(parents=True,exist_ok=True)
torch.set_num_threads(4)
torch.manual_seed(42)
start=time.time()
ref=args.reference_text_file.read_text(encoding='utf-8').strip()+' '
gen=args.text_file.read_text(encoding='utf-8').strip()
print('Loading voice model',flush=True)
model=load_model(DiT,dict(dim=1024,depth=22,heads=16,ff_mult=2,text_dim=512,conv_layers=4),str(args.models/'spring/inference.safetensors'),vocab_file=str(args.models/'spring/vocab.txt'),use_ema=False,device='cpu')
vocoder=load_vocoder('vocos',device='cpu',hf_cache_dir=str(args.models/'vocos'))
a,sr=sf.read(args.reference,dtype='float32')
print('Generating new Bengali speech',flush=True)
for wave,sr,mel in infer_batch_process((torch.from_numpy(a).unsqueeze(0),sr),ref,[gen],model,vocoder,nfe_step=32,device='cpu',progress=None):
 sf.write(args.output,wave,sr)
 (args.output.with_suffix('.json')).write_text(json.dumps(dict(seconds=len(wave)/sr,elapsed=time.time()-start,model='SPRINGLab/SPRING_F5',steps=32),ensure_ascii=False,indent=2))
 print('DONE',len(wave)/sr,'seconds; elapsed',time.time()-start,flush=True)
