from pathlib import Path
import cv2,numpy as np
import argparse
parser=argparse.ArgumentParser(description='Blend audio-conditioned mouth frames into a matching expression video. Produces silent intermediate video.')
parser.add_argument('--lipsync',type=Path,required=True)
parser.add_argument('--motion',type=Path,required=True)
parser.add_argument('--output',type=Path,required=True)
parser.add_argument('--mouth-ellipse',nargs=4,type=int,required=True,metavar=('CX','CY','RX','RY'))
args=parser.parse_args()
a=cv2.VideoCapture(str(args.lipsync))
b=cv2.VideoCapture(str(args.motion))
fps=a.get(cv2.CAP_PROP_FPS);w=int(a.get(3));h=int(a.get(4))
out=cv2.VideoWriter(str(args.output),cv2.VideoWriter_fourcc(*'mp4v'),fps,(w,h))
mask=np.zeros((h,w),np.float32)
cx,cy,rx,ry=args.mouth_ellipse
cv2.ellipse(mask,(cx,cy),(rx,ry),0,0,360,1,-1)
mask=cv2.GaussianBlur(mask,(61,61),15)[:,:,None]
n=0
while True:
 ok,p=a.read()
 if not ok:break
 ok,s=b.read()
 if not ok:
  b.set(cv2.CAP_PROP_POS_FRAMES,0);ok,s=b.read()
 frame=(p*mask+s*(1-mask)).clip(0,255).astype(np.uint8)
 cv2.rectangle(frame,(15,15),(211,46),(31,28,28),-1)
 cv2.putText(frame,'AI-generated preview',(25,36),cv2.FONT_HERSHEY_SIMPLEX,.5,(255,255,255),1,cv2.LINE_AA)
 out.write(frame);n+=1
out.release();a.release();b.release()
print(n,'frames',fps,'fps')
