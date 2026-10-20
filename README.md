# Sadia AI Live

Initial browser-call prototype. Contains a mobile call UI, browser speech recognition and speech synthesis (where supported), and a FastAPI backend scaffold. **No real face cloning, voice cloning, AI inference, or WebRTC is implemented yet.**

## Preview
Open `index.html` in a local server or enable GitHub Pages from Settings → Pages → Deploy from branch → main → /(root).

## Backend
`pip install -r backend/requirements.txt`
`uvicorn backend.main:app --reload`

## Privacy
Only use likeness and voice samples with the person's explicit permission. Never commit private voice recordings, photos, or API keys to this public repository.
