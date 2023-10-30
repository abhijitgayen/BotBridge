from fastapi import FastAPI
from utils.chat import BasicChatBot
from pydantic import BaseModel 
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class for_bot_res(BaseModel):
    message: str
    channel: Union[str, None] = None
    user_id: Union[str, None] = None

@app.on_event("startup")
def startup():
    global chatbot_model
    chatbot_model = BasicChatBot(intent_file_path = 'data/personal_assistant.json' , model_file_path = "model/personal_assistant.pth")

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/chatbot")
def  get_bot_response(for_bot_res: for_bot_res):
    bot_response, _ = chatbot_model.get_bot_response(for_bot_res.message)
    return random.choice(bot_response.get('responses')) 