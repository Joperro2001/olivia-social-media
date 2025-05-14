from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from chat.chat_router import router as chat_feature_router
from ranking.rank_router import router as ranking_router

app = FastAPI(
    title="Olivia - Social Spark Backend",
    description="API for Olivia, the AI Relocation Assistant and Social Spark features.",
    version="0.1.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for now, restrict in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include the routers from different features
app.include_router(chat_feature_router, prefix="/chat", tags=["Chat"])
app.include_router(ranking_router, prefix="/rank", tags=["Ranking"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

# To run this application (from the project root, e.g., olivia-social-spark/):
# uvicorn backend.main:app --reload --port 8080 