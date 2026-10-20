"""Sadia AI chat proxy. Configure an OpenAI-compatible backend with environment variables.
No API keys are ever sent to the browser. Default is explicitly demo-only.
"""
import os
import json
import urllib.request
import urllib.error
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Sadia AI Live API")
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "https://mr04nazmul.github.io").split(",") if x.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_methods=["GET","POST"], allow_headers=["Content-Type"])
BASE_URL = os.getenv("LLM_BASE_URL", "").rstrip("/")
MODEL = os.getenv("LLM_MODEL", "")
API_KEY = os.getenv("LLM_API_KEY", "")
SYSTEM = ("তুমি সাদিয়া নামের একজন বন্ধুসুলভ বাংলা AI সহকারী। তুমি সংক্ষিপ্ত ও স্বাভাবিক বাংলায় উত্তর দেবে। "
          "তুমি AI—কোনো বাস্তব ব্যক্তির স্মৃতি, পরিচয় বা অভিজ্ঞতা নিজের বলে দাবি করবে না।")
class Message(BaseModel):
    text: str = Field(min_length=1, max_length=3000)
    history: list[dict[str, str]] = Field(default_factory=list)

@app.get("/health")
def health():
    return {"status":"ok","mode":"llm" if BASE_URL and MODEL else "unconfigured"}

@app.post("/chat")
def chat(message: Message):
    if not BASE_URL or not MODEL:
        raise HTTPException(503, "AI backend is not configured")
    if not (BASE_URL.startswith("https://") or BASE_URL.startswith("http://localhost:") or BASE_URL.startswith("http://127.0.0.1:")):
        raise HTTPException(500, "LLM_BASE_URL must use HTTPS")
    history = []
    for m in message.history[-12:]:
        if m.get("role") in ("user","assistant") and isinstance(m.get("content"),str):
            history.append({"role":m["role"],"content":m["content"][:3000]})
    payload = {"model":MODEL,"messages":[{"role":"system","content":SYSTEM},*history,{"role":"user","content":message.text}],"temperature":0.7,"max_tokens":300}
    headers = {"Content-Type":"application/json"}
    if API_KEY: headers["Authorization"] = "Bearer "+API_KEY
    req = urllib.request.Request(BASE_URL+"/chat/completions", data=json.dumps(payload).encode(),headers=headers,method="POST")
    try:
        with urllib.request.urlopen(req,timeout=35) as res:
            data=json.load(res)
        reply=data["choices"][0]["message"]["content"]
        return {"reply":str(reply),"mode":"llm"}
    except (urllib.error.URLError,KeyError,ValueError,TimeoutError) as exc:
        raise HTTPException(502,"AI provider unavailable") from exc
