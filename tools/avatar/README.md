# Private talking-portrait rendering — verified CPU experiment

This directory records the speech and face pipeline that actually ran on 20 October 2026. It is **not a live-call backend**. GitHub Pages cannot run these Python models. No voice recordings, transcripts, generated speech, or model weights are included in this repository.

## Verified result

An authorized 4.1-second recording conditioned SPRING_F5 to generate a different Bengali sentence. A separate Whisper large-v3-turbo transcription recognized the new sentence with average log probability -0.107; spelling/pronunciation and speaker similarity still require human listening. The output initially repeated 1.36 seconds of reference words; that section was trimmed after word-level transcription. Do not blindly apply that trim to other utterances.

LivePortrait transferred expression, eye direction and head movement from its bundled demonstration driver to the selected portrait. Wav2Lip then generated audio-conditioned mouth frames. The final private preview is about 5 seconds, H.264/AAC, 714×814, 15 fps, 74 distinct frames; ffmpeg decoded its audio/video without errors. The reference recording was not spliced into the output.

Measured CPU cost: speech 253.78 seconds for 6.44 seconds of audio; face animation 325 seconds for 47 frames. These timings rule out low-latency conversations on this tested CPU. iPhone rendering/playback and subjective voice matching remain unverified. Facial motion is transferred from a driver; it is not emotion inferred from conversation. The 96×96 Wav2Lip face network softens mouth detail and does not preserve every original facial pixel.

## Components actually used

| Component | Version / source | Purpose and restriction |
| --- | --- | --- |
| SPRINGLab/SPRING_F5 | HF revision `898dd2a56fbb42c994b545fadfdd831eeadfafb0` | Bengali reference-conditioned TTS; Apache-2.0 model card. Independent alternative to gated IndicF5. |
| F5-TTS | 1.1.22 | Inference code; MIT. DiT 1024 dimensions, 22 layers, 16 heads, text dimension 512, 4 conv layers. |
| Vocos | charactr/vocos-mel-24khz | 24 kHz waveform decoding; MIT model card. |
| LivePortrait | `9b294b3d0536135442ea73cb01e6cb3ca7029dd3` | MIT code. Bundled InsightFace pretrained models have separate noncommercial research terms. |
| Wav2Lip | `bac9a81e63ecc153202353372e5724b83d9e6322` | Official GAN checkpoint; personal/research/noncommercial use only, not a general commercial license. |
| PyTorch / TorchAudio / TorchVision | 2.8.0+cpu / 2.8.0+cpu / 0.23.0+cpu | CPU inference. |
| NumPy / librosa / Transformers | 2.2.6 / 0.10.2.post1 / 4.46.3 | Tested compatibility versions; tokenizers 0.20.3, huggingface_hub 0.36.2. |

Upstreams: [SPRING_F5](https://huggingface.co/SPRINGLab/SPRING_F5), [F5-TTS](https://github.com/SWivid/F5-TTS), [LivePortrait](https://github.com/KlingAIResearch/LivePortrait), [Wav2Lip](https://github.com/Rudrabha/Wav2Lip). No paid inference service was used.

## Files and privacy

`clone_voice.py` is the tested speech worker with private paths/text changed to explicit CLI arguments. Inputs are an authorized mono WAV, exact reference transcript, new text, and locally downloaded model directory. It defaults to 32 inference steps on CPU and writes only duration/model/timing to its JSON sidecar. A safetensors inference checkpoint was extracted from the official training checkpoint using `torch.load(..., weights_only=True, mmap=True)` and its tensor-only `model_state_dict`. The 5.4 GB original file SHA-256 was `6824673c8b5e570b2f5ef231e19be2f9e756cfccddee63650ed96f77510092ba`; inference weights are about 1.3 GB.

`blend_mouth.py` is the tested postprocessor, with its paths and mouth ellipse exposed as arguments. It blends only the mouth region into matching expression frames and marks the output as an AI preview; its output was byte-identical to the original tested intermediate. The demonstration driver was extended with a forward/reverse cycle to cover the speech duration.

`wav2lip-modern-runtime.patch` contains the actual compatibility fixes used: librosa keyword arguments and explicit loading of the official TorchScript checkpoint. Apply only to the pinned Wav2Lip source above; review third-party model code before loading it.

The tested LivePortrait invocation used `--flag-force-cpu --no-flag-use-half-precision --driving-multiplier 0.65`. Wav2Lip used a manually checked face box and batch size 4. Face boxes must be checked for every portrait; a box from this experiment must not be assumed correct for another image.

Store inputs and outputs outside the public repository. This is a private rendering experiment, not an instruction to upload personal media to a public Space or commit it. Arbitrary new speech can be rendered with the reference, but instant cloned-voice replies and semantic emotional expression have not been implemented or deployed.
