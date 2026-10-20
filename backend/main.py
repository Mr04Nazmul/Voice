from fastapi import FastAPI
from pydantic import BaseModel
app = FastAPI(title="Sadia AI Live API")
class Message(BaseModel):
    text: str
@app.get("/health")
def health():
    return {"status": "ok", "mode": "prototype"}
@app.post("/chat")
def chat(message: Message):
    return {"reply": "এটি একটি প্রাথমিক API। নিরাপদ LLM provider এখনো সংযুক্ত হয়নি।"}
