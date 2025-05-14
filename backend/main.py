
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.chat import router as chat_router
from backend.rank import router as rank_router
import logging

# Set up logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_router.router)
app.include_router(rank_router)

@app.get("/")
async def root():
    return {"message": "Lovable backend is running"}

@app.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status code: {response.status_code}")
    return response
