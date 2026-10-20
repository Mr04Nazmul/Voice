# Source and licenses

The rewritten Sadia frontend (index.html, style.css, app.js and tts-worker.js) is distributed under GPL-3.0-or-later; see FRONTEND-LICENSE. Source is this repository. User portraits and private voice media are not covered by this software license. The pre-existing backend/ is preserved and is not part of this rewritten frontend.

- wllama 2.3.7: MIT, vendored code and WASM. Copyright 2024 Xuan Son NGUYEN. See vendor/wllama/LICENSE and https://github.com/ngxson/wllama/tree/2.3.7. llama.cpp compiled inside the binary retains its MIT license: https://github.com/ggml-org/llama.cpp/blob/master/LICENSE.
- Qwen3-0.6B weights: Apache-2.0. Local quantization: https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/tree/50968a4468ef4233ed78cd7c3de230dd1d61a56b. See assets/QWEN-LICENSE. Downloaded by the browser, not embedded in this repository.
- Optional/fallback espeak-ng 1.0.2 JavaScript/WASM: GPL-3.0-or-later. Imported unmodified from the versioned jsDelivr npm package, only in a separate local worker. Full package license: https://cdn.jsdelivr.net/npm/espeak-ng@1.0.2/LICENSE. Corresponding project source and build instructions: https://github.com/ianmarmour/espeak-ng.js and https://github.com/espeak-ng/espeak-ng. This is rule-based/formant TTS, not a neural clone or a natural human voice. Package WASM includes language data and is 18,485,010 bytes.
