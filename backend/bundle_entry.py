import uvicorn
import os
import sys

# Add the parent directory to sys.path so it can find the 'backend' package
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__filename__))))

from backend.main import app

if __name__ == "__main__":
    # In production/bundled mode, we run uvicorn programmatically
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
