# Sadia AI Live — GPU-free browser prototype

A mobile-first Bengali video-call **demo** that runs as a static website without a cloud GPU.

### Implemented
- Mobile video-call interface and local portrait upload
- Browser-based Bengali text input, speech synthesis and speech recognition (if supported)
- Simple speech-timed portrait motion; **not actual lip-sync**
- Optional self-camera preview, mute, call and hang-up
- Limited local rule-based responses (not a full AI model)

### Limitations
- No photorealistic face animation or real-time AI-generated video
- No integrated LLM or talking-avatar API
- Bengali browser voices and speech recognition may be unavailable on iOS
- Camera access requires HTTPS and permission
- Portrait selected by the user stays in their browser session; it is not uploaded

### Hosting
GitHub Pages can serve `index.html` and `app.js`. Enable Pages in repository settings if not already enabled.

### Future real-avatar integration
A verified hosted avatar provider or GPU-backed inference server would be required for realistic photo-to-video lip-sync. A verified LLM API needs a secure backend; never expose secret keys in client-side JavaScript.

## Deployment status (2026-10-20)
The Python backend has not been deployed or configured with an LLM provider. The static UI uses demo responses until window.SADIA_API_URL is set to a deployed HTTPS backend. LiveTalking requires a separate GPU-backed service; it cannot run on GitHub Pages. No voice cloning or real-time lip-sync is currently deployed.

Backend environment: LLM_BASE_URL (HTTPS OpenAI-compatible API base), LLM_MODEL, optional LLM_API_KEY, and ALLOWED_ORIGINS. Keep secrets server-side.
