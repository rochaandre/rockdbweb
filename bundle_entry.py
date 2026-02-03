import uvicorn
import os
import sys

# Since this script is now at the root, the 'backend' package is directly accessible
from backend.main import app

if __name__ == "__main__":
    # In production/bundled mode, we run uvicorn programmatically
    # Default to 8080 for Electron
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")
