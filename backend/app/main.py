from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import main

app = FastAPI(
    prefix="/api/v1",
    title="Habitly",
    openapi_url="/api/v1/openapi.json",
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

# Include the auth router
app.include_router(main.router)



@app.get("/", tags=["health check"])
def read_root():
    return {"message": "API is working"}
