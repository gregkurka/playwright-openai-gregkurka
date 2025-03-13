#!/usr/bin/env bash

# Navigate to backend folder, run server in background
cd backend
npm run start:dev &

# Return to the main folder and then frontend, run dev in foreground or background
cd ../frontend
npm run dev &

# Wait for all background jobs to complete (if either is killed or stops, you'll return to the prompt)
wait
