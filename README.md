# Mythos AI Security Platform

Mythos is an AI-powered cybersecurity platform for threat detection, incident response, threat intelligence, and security automation.

## Architecture

```text
+---------------------+       +----------------------+       +----------------------+
|  Threat Sources     | ----> |  Mythos API (FastAPI)| ----> |  Orchestrator        |
| (logs, agents, SIEM)|       |  /api/v1/* endpoints |       | detection->intel->IR |
+---------------------+       +----------------------+       +----------------------+
                                          |                              |
                                          v                              v
                              +----------------------+       +----------------------+
                              | Threat Intelligence  | <---- | Incident Response    |
                              | feeds + IOC manager  |       | playbooks/actions    |
                              +----------------------+       +----------------------+
                                          |
                                          v
                              +----------------------+
                              | PostgreSQL + Redis   |
                              +----------------------+
```

## Features

- AI anomaly detection (Isolation Forest)
- Rule-based detection engine
- IOC management and feed aggregation stubs (OTX/MISP style)
- Incident response playbooks (YAML)
- Automation orchestrator connecting detection/intel/response
- FastAPI async API endpoints
- SQLAlchemy async DB and Alembic scaffold
- Docker + docker-compose deployment
- CI pipeline with lint, type-check, tests, and Docker build

## Prerequisites

- Python 3.11+
- Docker + Docker Compose (optional)
- PostgreSQL and Redis (for local non-docker deployments)

## Installation

### Docker

```bash
docker compose up --build
```

### Local

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn mythos.api.main:app --reload
```

## Configuration

Environment variables (prefix `MYTHOS_`):

- `ENVIRONMENT`
- `API_PREFIX`
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `AUTH_ENABLED`
- `LOG_LEVEL`

See `.env.example` for defaults.

## API Overview

- `GET /health`
- `POST /api/v1/threats`
- `GET /api/v1/threats`
- `GET /api/v1/incidents`
- `POST /api/v1/intelligence/iocs`
- `GET /api/v1/intelligence/iocs`
- `GET /api/v1/intelligence/feeds/aggregate`
- `POST /api/v1/automation/process`

## Usage Examples

```bash
curl -X POST http://localhost:8000/api/v1/threats   -H "Content-Type: application/json"   -d '{"source":"gateway","description":"failed login spike","indicators":["198.51.100.42"],"score":0.8}'

curl http://localhost:8000/api/v1/incidents

curl -X POST http://localhost:8000/api/v1/intelligence/iocs   -H "Content-Type: application/json"   -d '{"type":"ip","value":"198.51.100.42","source":"analyst","confidence":0.9}'
```

## Development

```bash
make install
make lint
make test
make run
make migrate
```

## Contributing

1. Fork repository and create a feature branch.
2. Run lint/tests locally before submitting changes.
3. Open a pull request with clear rationale and test evidence.

## License

Licensed under Eclipse Public License 2.0. See `LICENSE`.
