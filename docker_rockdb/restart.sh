#!/bin/bash
# Script to restart the RockDB Backend inside the container
echo "Restarting RockDB Backend..."
pkill -f uvicorn
# The container's start.sh or restart policy should handle the actual relaunch 
# if it's running as a service, but here we just kill it.
# If uvicorn is the main process (PID 1), the container will restart automatically if --restart is set.
echo "Uvicorn process killed. Container should restart or reload if managed."
