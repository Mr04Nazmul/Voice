# Sadia AI Live

A $0, GitHub Pages-only Bengali AI photo-call assistant. **This is not photorealistic live video, voice cloning, or lip-sync.**

Live: https://mr04nazmul.github.io/Voice/

## Use

1. Tap **Free AI চালু করো** to download the 397 MB Qwen model. Prefer Wi-Fi. The model runs in your browser using CPU WebAssembly; the phone needs additional memory and may be slow.
2. Start a call and type in Bengali. Replies come from the local LLM, not a script.
3. Enable microphone only after reading the audio-processing disclosure. Bengali speech recognition depends on your browser's speech service.
4. Open Settings → test Bengali voice. Audio requires an installed Bengali system voice. This is not Sadia's cloned voice.
5. Camera is a local-only floating selfie preview. Ending the call or hiding the tab stops camera/microphone/speech.

The supplied portrait appears by default. Local portrait and reference-audio selection is available. Reference audio playback does not clone a voice; the authorized private sample is not published.

## Hosting and implementation

Plain HTML/CSS/ES modules. No build step, paid backend, cloud inference or client secret keys. wllama 2.3.7 and its single-thread WASM are vendored; Qwen weights download from the pinned Unsloth Hugging Face revision and cache locally. The original backend/ files are preserved for reference and are **not deployed or used** by the application.

[Technology evaluation](RESEARCH.md) · [Verified test results](TEST-RESULTS.md)

## Limitations

- Still portrait and speech-activity bars, not face animation or generated video.
- No personalized voice cloning.
- Small local model may produce poor Bengali, inaccuracies, or slow replies.
- No guaranteed browser Bengali STT/TTS; text fallback is always available after model load.
- Physical iPhone Safari/Android device tests must not be inferred from desktop automation.
- First model load needs internet, storage and sufficient memory. Mobile OS may terminate the tab.

No substantive assistant replies are hardcoded. Missing model/voice/permissions are surfaced as errors, not disguised as working AI.
