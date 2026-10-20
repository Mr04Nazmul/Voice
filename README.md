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
