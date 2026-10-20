# Sadia AI Live — verified results

Tested 2026-10-20 through the real public GitHub Pages site in a cloud Chrome browser. **The full requested realistic Sadia video assistant is NOT complete.**

| Acceptance / test | Observed result |
| --- | --- |
| Public deployment | GitHub Pages served the rewritten UI, model loader, settings, and worker. Deployment run and final version verification are recorded in repository commit history. |
| Portrait | Visible in live Chrome. The clean user upload was previously hash-verified byte-for-byte against the live asset. At the user's later request, the prior preferred portrait was restored; no face synthesis or alteration was applied. |
| Call lifecycle | Start changed control to End; hang-up returned to Start; another call started. Timer ran. |
| Captions | CC off removed the caption from the accessibility tree; CC on restored it. |
| Text chat | User input submitted; model reply streamed/rendered into the chat log. Expand/collapse worked. |
| Local model inference | Qwen2.5-0.5B, Qwen3-0.6B and Qwen3-1.7B actually loaded and generated output in the public browser. No keyword reply function remains. |
| Bengali response quality | FAILED factual smoke test. For “বাংলাদেশের রাজধানীর নাম কী?”, the larger Qwen3-1.7B generated “বাংলাদেশের রাজধানী বাংলাদেশ হয়ে থাকে।” The smaller models were also incorrect. These are real generated responses but are not trustworthy conversational quality. |
| Latency | Not real-time. During the larger model test, no first output was visible at 45 seconds on the call timer. Mobile performance is not measured. |
| Native Bengali TTS | No Bengali system voice was installed in this browser. Missing-voice status was displayed correctly. |
| Free local Bengali fallback | eSpeak NG generated a 3.9-second decoded audio buffer with 170,986 samples, and WebAudio started playback with no application error. Node smoke test also generated a valid RIFF/WAVE. This is generic robotic speech, not Sadia's voice. Human audible quality was not independently graded. |
| Reference-only preference | Latest build defaults to explicitly unavailable Sadia reference cloning; it does not silently substitute robotic/system voices. Generic voice must be chosen separately. |
| Microphone | Consent dialog worked. After acceptance, the cloud speech service returned not-allowed; app muted and showed an error. Actual microphone input/Bengali transcription NOT verified. |
| Camera | Actual getUserMedia call returned “Requested device not found” in cloud Chrome. Error was handled. A working selfie camera preview and front/back camera switch NOT verified. |
| Facial animation / lip-sync | NOT implemented. Portrait remains still. Speaking bars are decorative activity indicators timed to speech events, not real waveform or lip-sync. |
| Voice cloning | NOT implemented. Authorized private sample metadata was found; sample was never published. IndicF5 requires gated model access and a suitable private inference runtime; neither was available to the public Pages site. |
| Memory / persona | Device-local profile editor, JSON import, user-provided-context prompt and tone settings implemented. Actual JSON import saved the profile; page reload retained its name and notes in the settings fields. LLM recall accuracy for this profile is not verified. Personal relationship details are not in public source. Persona context is not represented as the real person's verified memories. |
| JavaScript | Node syntax checks passed; control IDs matched HTML; no private m4a/mp3 was in repository. Earlier original-build regex syntax error was eliminated. Recent inspected Chrome errors were browser-extension messages, not app JavaScript errors. |
| iPhone Safari / Android Chrome | Physical devices UNVERIFIED. Responsive styles, playsinline/muted video, user-gesture audio unlock, single-thread WASM and permission cleanup are implemented; these are not substitutes for device testing. |

## Remaining blockers

1. A verified free private voice-cloning and audio-driven avatar inference runtime is not connected. GitHub Pages cannot execute IndicF5, MuseTalk or LiveTalking Python/GPU inference.
2. Small on-device LLMs failed the Bengali quality test; larger local inference was too slow for a natural live call. No external LLM credential or cloud inference was fabricated.
3. Physical camera, microphone, Safari memory limits and real Bengali speech recognition still need hardware validation.
4. Reference media and resemblance do not supply the real person's actual personality or memories. User-configured roleplay notes remain clearly attributed.

This report intentionally separates implemented code, successful execution, failed quality checks, and unverified hardware behavior.
