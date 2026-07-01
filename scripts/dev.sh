#!/bin/bash
echo "Starting development environment..."
docker compose up postgres redis -d
echo "Database services started. Run each service locally:"
echo "  Backend:    cd backend && go run cmd/server/main.go"
echo "  AI Service: cd ai-service && uvicorn app.main:app --reload --port 8001"
echo "  Frontend:   cd frontend && npm run dev"
