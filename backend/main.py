from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.db import Base, engine
from controllers.init import *
import os

ENV = os.getenv("ENV")

app = FastAPI(
    docs_url="/docs" if ENV == "dev" else None,
    redoc_url="/redoc" if ENV == "dev" else None,
    openapi_url="/openapi.json" if ENV == "dev" else None
)

#Enable Cors
origins = [
    "http://localhost:5173", 
    "https://y25-pbl-frontend.vercel.app",
    "https://mth.klef.in"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

#Create Tables
Base.metadata.create_all(bind = engine)

#Register all routes
app.include_router(UsersRouter)
app.include_router(DashboardRouter)
app.include_router(TasksRouter)

@app.get("/")
def home():
    return "Started...."