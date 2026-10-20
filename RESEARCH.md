# Sadia AI Live: technical decision record

Reviewed 2026-10-20. Budget: $0. Frontend: GitHub Pages. No paid service, server inference, Colab, or secret client API key.

## Chosen pipeline

Local browser speech recognition (bn-BD, availability depends on browser/vendor service) → Qwen3-1.7B (default, 1,107,409,472 bytes) or Qwen3-0.6B (396,705,472 bytes) GGUF Q4_K_M through wllama 2.3.7 WebAssembly → installed Bengali speechSynthesis voice or local eSpeak NG Bengali synthesis. Text input and captions remain available when speech APIs or a Bengali voice are missing. Every substantive assistant reply is model-generated; no keyword response fallback.

The small Qwen download is 397 MB decimal and the default is 1.11 GB, verified through Hugging Face file metadata; memory usage is larger than the file. CPU single-thread inference avoids requiring WebGPU, SharedArrayBuffer, or COOP/COEP response headers, which default GitHub Pages hosting cannot configure. Model loading and inference run in a worker. 1024-token context, 100-token output and short history limit memory. Small-model Bengali quality is experimental; this does not match a cloud frontier model. No claim of real-time latency on an iPhone.

wllama version 2.3.7 is vendored with its WebAssembly binary. Its API and that exact build were inspected; current version 3 documentation has a different API and is not used. Qwen weights are downloaded from a pinned Unsloth quantization revision; voice samples are never sent to Hugging Face. Cache stays in the browser. The in-app delete control clears the wllama cache and local session media.

## Evaluated options

| Technology | License / resources verified | Decision |
| --- | --- | --- |
| [wllama](https://github.com/ngxson/wllama/tree/2.3.7) | MIT; browser CPU WASM SIMD, worker, single-thread available; weights separately licensed | Chosen for no-GPU execution. No model-sized files committed to GitHub. |
| [Qwen3 0.6B GGUF](https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/tree/50968a4468ef4233ed78cd7c3de230dd1d61a56b) | Apache 2.0; Unsloth Q4_K_M 397 MB; 0.6B parameters | Chosen small multilingual LLM; Bengali usefulness must be tested, not assumed. |
| [WebLLM](https://github.com/mlc-ai/web-llm) | Apache 2.0; WebGPU browser LLM, model weights have separate licenses; model-dependent hundreds of MB to multiple GB | Real option on compatible GPUs. Not the default because the user's older iOS and mobile memory cannot be assumed compatible. No unverified Safari version claim. |
| [Transformers.js](https://huggingface.co/docs/transformers.js/index) | Apache 2.0; ONNX Runtime browser WASM/WebGPU; model size varies by model and quantization | Valid alternative for Whisper and LLMs. Stacking STT + LLM + TTS models adds memory/download overhead. Not added without an on-device memory validation. |
| [MediaPipe face landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) | MediaPipe Apache 2.0 code; model assets separately distributed. Face landmarks/blendshapes, not photo-to-talking-video generation | Does not solve photorealistic audio-driven mouth generation. Not loaded on the call screen. |
| [TalkingHead](https://github.com/met4citizen/TalkingHead) | MIT JavaScript; Three.js rigged GLB avatar and morph targets required; asset size depends on avatar, speech provider separate | Good real 3D lip-sync, but an arbitrary portrait is not a rigged GLB. Would replace facial likeness with a different 3D character. Not misrepresented as a photo animator. |
| [LiveTalking](https://github.com/lipku/LiveTalking) | Apache 2.0 wrapper; submodels retain own terms; Python, model weights and GPU inference per lip-sync stream | Cannot execute on GitHub Pages. Documentation recommends GPU hardware; no free always-on GPU endpoint verified. |
| [MuseTalk](https://github.com/TMElyralab/MuseTalk) | MIT code; project permits trained-model commercial use, dependencies separately licensed; Python/PyTorch stack and multiple checkpoints. Reports 30fps+ on Tesla V100, 256×256 face region | Not browser-ready; V100 benchmark is not iPhone capability. Identity details can change. Not deployed. |
| [Wav2Lip](https://github.com/Rudrabha/Wav2Lip) | Original open-source pretrained pipeline restricted to personal/research/noncommercial use due to LRS2; Python/ffmpeg + detector/checkpoints | Not a browser module or unrestricted production model. Not deployed. |
| [LivePortrait](https://github.com/KlingAIResearch/LivePortrait) | MIT project; bundled dependencies including InsightFace have additional model restrictions; Python, multiple checkpoints, motion source | Motion transfer is not alone audio-conditioned Bengali lip-sync. Cannot run as a stock GitHub Pages script. Not deployed. |
| Browser STT/TTS | Browser/OS service terms; no downloadable JS voice model; available languages vary | Explicit Bengali voice matching; local eSpeak NG 1.0.2 fallback when no installed Bengali voice exists. No promise of offline speech recognition. |

For unselected server avatar stacks, no single bundle size is asserted: detector, speech, VAE, enhancement and avatar assets vary. No combined checkpoint set was downloaded or browser-ported. None is claimed runnable at $0 on iPhone.

## Facial rendering

The earlier user-preferred portrait was restored at their final request and is displayed unchanged as a still image, with a versioned URL to avoid stale image caches. A five-bar indicator appears during native speech events or local fallback audio playback. Its heights are decorative, not measured audio amplitude. It is neither facial animation nor phoneme lip-sync. No CSS head zoom or fake mouth is used. This preserves the source appearance exactly but does not fulfill realistic talking-face video.

## Privacy

Camera uses getUserMedia(video only), local muted playsinline preview, no recorder or upload. End-call, tab hiding and pagehide stop tracks. Microphone requires a separate disclosure because browser SpeechRecognition may send audio to the browser vendor. Uploaded portrait/reference audio use temporary object URLs. No private voice sample is committed. The optional/free eSpeak NG worker imports its 1.0.2 JS and 18,485,010-byte WASM from jsDelivr, then synthesizes audio locally. This is GPL-3.0-or-later formant speech, with source/license links in THIRD-PARTY.md; it is distinctly robotic and not cloning. The default portrait is intentionally public as requested. Chats are memory-only, rendered as text, never HTML; no analytics or API keys. Model downloads reveal ordinary network metadata to Hugging Face; local inference does not send chat there.

## Testing scope

See TEST-RESULTS.md for actual results. API feature detection is not equivalent to speech recognition success. A desktop/WebKit or mobile viewport test is not a physical iPhone test. Audible Bengali output, real microphone recognition, and iPhone Safari remain unverified unless the test log explicitly records them.

## Model selection after actual testing

Both the initial Qwen2.5-0.5B and replacement Qwen3-0.6B generated incorrect Bengali answers in the live browser. Their ability to run is not evidence of useful Bengali conversation. The interface now defaults to a larger Qwen3-1.7B Q4_K_M model, with a memory/download warning and a smaller experimental option. Real test results, including any remaining failures, belong in TEST-RESULTS.md. Neither variant is a guaranteed human-quality conversation model.

## Authorized personalized voice status

The user later required the original authorized voice specifically. Default mode therefore does not substitute a generic voice. IndicF5 (https://huggingface.co/ai4bharat/IndicF5) lists an MIT model license but gates weight access behind account/conditions acceptance. Its official workflow needs reference audio plus its exact transcript and Python inference. No user account access or suitable private runtime was available; the skill package does not contain a running model. No voice clone was rendered and no clone endpoint is claimed live. The supplied sample remains private.

Private persona notes are stored locally only after save/import, and can be cleared. The public repository intentionally contains no private relationship profile. Tone settings affect prompts and optional generic speech rate/pitch, not facial emotions.
