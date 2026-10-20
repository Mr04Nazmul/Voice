# Sadia AI Live

A $0, GitHub Pages-only Bengali AI photo-call assistant. **This is not photorealistic live video, voice cloning, or lip-sync.**

Live: https://mr04nazmul.github.io/Voice/

## Use

1. Tap **Free AI চালু করো** to download the default 1.11 GB Qwen3-1.7B model (or choose the 397 MB experimental smaller option). Prefer Wi-Fi. The model runs in your browser using CPU WebAssembly; the phone needs additional memory and may be slow.
2. Start a call and type in Bengali. Replies come from the local LLM, not a script.
3. Enable microphone only after reading the audio-processing disclosure. Bengali speech recognition depends on your browser's speech service.
4. Open Settings → test Bengali voice. Sadia reference-voice mode is explicitly unavailable until a cloning runtime is connected. Optional installed Bengali system voice or free robotic Bengali fallback (18.5 MB) can be selected separately. This is not Sadia's cloned voice.
5. Camera is a local-only floating selfie preview. Ending the call or hiding the tab stops camera/microphone/speech.

The supplied portrait appears by default. Local portrait and reference-audio selection is available. Reference audio playback does not clone a voice; the authorized private sample is not published.

## Hosting and implementation

Plain HTML/CSS/ES modules. No build step, paid backend, cloud inference or client secret keys. wllama 2.3.7 and its single-thread WASM are vendored; Qwen weights download from the pinned Unsloth Hugging Face revision and cache locally. The original backend/ files are preserved for reference and are **not deployed or used** by the application.

[Technology evaluation](RESEARCH.md) · [Verified test results](TEST-RESULTS.md)

## Limitations

- Still portrait and speech-activity bars, not face animation or generated video.
- No personalized voice cloning.
- Small local model may produce poor Bengali, inaccuracies, or slow replies.
- Browser Bengali STT is not guaranteed. Generic local robotic TTS is available; no personalized voice cloning. Text input remains available after model load.
- Physical iPhone Safari/Android device tests must not be inferred from desktop automation.
- First model load needs internet, storage and sufficient memory. Mobile OS may terminate the tab.

No substantive assistant replies are hardcoded. Missing model/voice/permissions are surfaced as errors, not disguised as working AI.

Software license for the rewritten frontend: GPL-3.0-or-later. Third-party software and portrait/media rights remain separate. See THIRD-PARTY.md and FRONTEND-LICENSE.

## Personal context

Settings supports a local-only profile editor and private JSON import. Profile notes persist only in that browser and are treated as user-provided roleplay context, not the real Sadia’s memories. No private name/relationship defaults are committed to public source.

**Observed limit:** all tested local models generated incorrect Bengali on a simple factual prompt; the 1.7B model was slow. This is not accepted as reliable intelligent Bengali conversation. See the test log before relying on responses.
