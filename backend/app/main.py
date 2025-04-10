from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routes import main
from app.db import get_session

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from app.utils import reset_missed_streaks
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = BackgroundScheduler()
    scheduler.start()
    app.state.scheduler = scheduler
    
    # Schedule the job to run daily at midnight
    scheduler.add_job(
        lambda: reset_missed_streaks(next(get_session())),  # Pass the db session
        trigger=CronTrigger(hour=0, minute=0),  # Runs at midnight daily
        id="daily_streak_reset",
        replace_existing=True
    )
    
    yield
    
    # Shutdown
    scheduler.shutdown()

app = FastAPI(
    title="Habitly",
    openapi_url="/api/v1/openapi.json",
    lifespan=lifespan  # Add lifespan manager
)

# Enable CORS for PWA
origins = [
    "http://localhost:3000",
]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main router with prefix
app.include_router(main.router,)

@app.get("/", tags=[" check"])
def read_root():
    return {"message": "API is working"}

@app.get("/scheduler/status")
def check_scheduler():
    scheduler = app.state.scheduler 
    return {
        "running": scheduler.running,
        "jobs": [str(job) for job in scheduler.get_jobs()]
    }