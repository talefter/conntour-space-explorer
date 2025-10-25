from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.api import router

app = FastAPI(
    title="Conntour Space Explorer API",
    description="NASA image search and exploration API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)