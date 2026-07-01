# Mythos AI Security Platform

An enterprise-grade AI-powered cybersecurity platform for threat detection, incident response, threat intelligence, and security automation.

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Nginx (Reverse Proxy)                    │
└──────────────┬──────────────────┬──────────────────┬────────┘
               │                  │                  │
      ┌────────▼────────┐ ┌───────▼───────┐ ┌───────▼───────┐
      │  React Frontend  │ │  Go Gin API   │ │ Python AI SVC │
      │   (TypeScript)   │ │  (Backend)    │ │  (LangGraph)  │
      └─────────────────┘ └───────┬───────┘ └───────┬───────┘
                                  │                  │
                         ┌────────▼────────┐ ┌──────▼──────┐
                         │   PostgreSQL    │ │    Redis    │
                         └─────────────────┘ └─────────────┘
```

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🤖 AI SOC Analyst | LangGraph-powered autonomous security analyst |
| 🔍 Threat Hunting | MITRE ATT&CK-based proactive threat hunting |
| 🦠 Malware Analysis | YARA rule matching and behavioral analysis |
| 📋 CVE Intelligence | Real-time CVE database with severity scoring |
| 🎯 IOC Search | Indicator of Compromise search and enrichment |
| 🚨 AI Incident Response | Automated PICERL playbook generation |
| 💬 AI Security Chat | Conversational AI for security operations |
| 📊 DevSecOps Dashboard | CI/CD pipeline security monitoring |
| 🔭 Vulnerability Scanner | Asset vulnerability discovery and tracking |
| 🗺️ Attack Path Visualization | Interactive attack graph visualization |

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, Recharts
- **Backend**: Go 1.21, Gin, GORM, JWT
- **AI Service**: Python 3.11, FastAPI, LangGraph, LangChain, OpenAI/Llama
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Container**: Docker, Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Security**: MITRE ATT&CK, Sigma Rules, YARA Rules, CVE Database

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend dev)
- Go 1.21+ (for local backend dev)
- Python 3.11+ (for local AI service dev)

### Using Docker Compose
```bash
# Clone the repository
git clone https://github.com/PetreCostin/Mythos-AI-Security-Platform.git
cd Mythos-AI-Security-Platform

# Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# Open browser
open http://localhost:3000
```

### Manual Setup
```bash
# Copy environment file
cp .env.example .env

# Start infrastructure
docker compose up postgres redis -d

# Start backend
cd backend && go run cmd/server/main.go

# Start AI service  
cd ai-service && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8001

# Start frontend
cd frontend && npm install && npm run dev
```

### Default Credentials
- Email: `admin@mythos.ai`
- Password: `Admin@123!`

## 🏛️ Project Structure

```text
Mythos-AI-Security-Platform/
├── frontend/              # React TypeScript application
│   ├── src/
│   │   ├── pages/         # Feature pages
│   │   ├── components/    # Reusable UI components
│   │   ├── services/      # API client services
│   │   ├── store/         # Zustand state management
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript type definitions
│   └── Dockerfile
├── backend/               # Go Gin REST API
│   ├── cmd/server/        # Application entrypoint
│   ├── internal/
│   │   ├── handlers/      # HTTP handlers
│   │   ├── models/        # GORM models
│   │   ├── services/      # Business logic
│   │   ├── middleware/     # HTTP middleware
│   │   └── config/        # Configuration
│   ├── migrations/        # SQL migrations
│   └── Dockerfile
├── ai-service/            # Python FastAPI AI microservice
│   ├── app/
│   │   ├── agents/        # LangGraph AI agents
│   │   ├── tools/         # Security analysis tools
│   │   ├── routes/        # API routes
│   │   └── prompts/       # LLM prompt templates
│   ├── yara_rules/        # YARA detection rules
│   ├── sigma_rules/       # Sigma detection rules
│   └── Dockerfile
├── infrastructure/
│   ├── kubernetes/        # K8s manifests
│   └── nginx/             # Nginx configuration
├── .github/workflows/     # GitHub Actions CI/CD
├── scripts/               # Utility scripts
└── docker-compose.yml
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | - |
| `USE_MOCK_LLM` | Use mock LLM responses (no API key needed) | `true` |
| `JWT_SECRET` | JWT signing secret | - |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |

## 🚢 Kubernetes Deployment

```bash
# Apply all manifests
kubectl apply -f infrastructure/kubernetes/namespace.yaml
kubectl apply -f infrastructure/kubernetes/secrets.yaml  # Update secrets first!
kubectl apply -f infrastructure/kubernetes/postgres.yaml
kubectl apply -f infrastructure/kubernetes/redis.yaml
kubectl apply -f infrastructure/kubernetes/backend.yaml
kubectl apply -f infrastructure/kubernetes/ai-service.yaml
kubectl apply -f infrastructure/kubernetes/frontend.yaml
kubectl apply -f infrastructure/kubernetes/hpa.yaml
```

## 🤖 AI Features

The platform uses LangGraph to build stateful AI agents:

- **SOC Analyst Agent**: Analyzes security alerts and provides threat assessment
- **Threat Hunter Agent**: Proactive threat hunting with MITRE ATT&CK mapping
- **Incident Responder Agent**: Generates PICERL incident response playbooks
- **Malware Analyst Agent**: Classifies malware and extracts IOCs

Set `USE_MOCK_LLM=true` to use the platform without an OpenAI API key.

## 📊 SIEM Integration

The platform supports ingesting events from:
- Splunk
- Elastic SIEM
- Microsoft Sentinel
- QRadar

Use the `/api/siem/ingest` endpoint to forward normalized events.

## 🔐 Security

- JWT authentication with refresh tokens
- Role-based access control (Admin/Analyst/Viewer)
- Rate limiting on all API endpoints
- Input validation and sanitization
- HTTPS enforcement in production

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
