from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
from datetime import datetime, timezone
from weather_service import get_real_weather
from ai_service import check_hazard_risk
from cache import RISK_CACHE, CACHE_EXPIRATION_MINUTES
from routers import auth, risk, news, chat
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI App
app = FastAPI(
    title="Flood Alert System Backend (Modular)",
    description="Refactored modular backend for the Guardian App using Vertex AI Gemini",
    version="2.1.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://natures-event-zeta.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- BACKGROUND REFRESH SYSTEM ---
async def background_refresh_cache():
    """Periodically refreshes weather data in the shared RISK_CACHE."""
    while True:
        await asyncio.sleep(600)  # Every 10 minutes
        logger.info("[CRON] Refreshing Weather Data Cache...")
        for location in list(RISK_CACHE.keys()):
            try:
                live_weather_data = await get_real_weather(location)
                primary_hazard, risk_level, explanation = await check_hazard_risk(location, live_weather_data)
                RISK_CACHE[location] = {
                    "primary_hazard": primary_hazard,
                    "risk_level": risk_level,
                    "explanation": explanation,
                    "weather_data_used": live_weather_data,
                    "timestamp": datetime.now(timezone.utc)
                }
            except Exception as e:
                logger.error(f"[CRON] Failed to refresh {location}: {e}")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(background_refresh_cache())

# --- ROUTER REGISTRATION ---
app.include_router(auth.router)
app.include_router(risk.router)
app.include_router(news.router)
app.include_router(chat.router)


# 1. Mount the folder where the React build sits
# This folder is created by the Dockerfile 'COPY' command
# Check if static directory exists to avoid errors during local dev without build
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

# 2. The "Catch-All" route
# If the user visits the site, send them the React index.html
@app.get("/{catchall:path}")
async def serve_react(catchall: str):
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    # If API route is not found, return 404 instead of index if it starts with /api
    if catchall.startswith("api"):
        return {"error": "API route not found"}
    return {"message": "Guardian Tactical Backend is online. Frontend build not detected."}

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)