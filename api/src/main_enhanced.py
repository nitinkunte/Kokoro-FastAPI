"""
Enhanced FastAPI wrapper to support progress tracking endpoint
without modifying the upstream main.py
"""

import sys
import os

# Import original app
from .main import app, settings

# Import our new router
from .routers.audio_enhanced import router as enhanced_router

# Include the enhanced router
app.include_router(enhanced_router, prefix="/enhanced/v1")

if __name__ == "__main__":
    import uvicorn
    # Make sure we use the same host and port settings
    uvicorn.run("api.src.main_enhanced:app", host=settings.host, port=settings.port, reload=True)
