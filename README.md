# Multiservice Docker

A containerized multi-service application built with Docker and Docker Compose. The project combines a React frontend, a Node.js API, MongoDB, Redis, and Nginx reverse proxy.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB 8 |
| Cache | Redis 7 |
| Reverse Proxy | Nginx |
| Containerization | Docker, Docker Compose |

## Architecture

The application consists of five runtime services:

- **Nginx** — public entry point and reverse proxy.
- **Frontend** — serves the React application.
- **API** — provides the backend HTTP API.
- **MongoDB** — stores persistent application data.
- **Redis** — provides persistent cache storage.

All services communicate through the Docker Compose network.

Only Nginx exposes a port on the host machine. MongoDB, Redis, the API, and the frontend are accessible internally through the Docker network.

### Service Ports

| Service | Internal Port | Host Port |
|---|---:|---:|
| Nginx | 80 | 8082 |
| Frontend | 80 | Not exposed |
| API | 3000 | Not exposed |
| MongoDB | 27017 | Not exposed |
| Redis | 6379 | Not exposed |

### Request Routing

- `/` — served by the frontend.
- `/api/*` — forwarded by Nginx to the API. The `/api/` prefix is stripped before forwarding.

## Project Structure

```text
multiservice-docker/
├── api/
│   ├── src/
│   │   └── config/
│   │       ├── mongodb.ts
│   │       └── redis.ts
│   ├── Dockerfile
│   ├── Dockerfile.base
│   └── .dockerignore
├── frontend/
│   ├── src/
│   ├── Dockerfile
│   ├── Dockerfile.base
│   └── .dockerignore
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── secrets/
│   ├── mongodb_root_username.txt
│   └── mongodb_root_password.txt
├── docker-compose.yml
├── .gitignore
└── README.md
```

The `secrets/` directory contains local credentials and must never be committed to version control.

## Prerequisites

Install the following tools:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Docker Compose v2

Verify the installation:

```bash
docker --version
docker compose version
```

## Configuration

### Docker Secrets

The API and MongoDB use Docker secrets for MongoDB root credentials.

Create the local secrets directory:

```bash
mkdir -p secrets
```

Create the username file:

```bash
nano secrets/mongodb_root_username.txt
```

Create the password file:

```bash
nano secrets/mongodb_root_password.txt
```

Enter your MongoDB root username and password in the corresponding files.

Restrict access to the files:

```bash
chmod 600 secrets/mongodb_root_username.txt
chmod 600 secrets/mongodb_root_password.txt
```

These files are excluded from Git through `.gitignore`.

Never commit real credentials or include them in Docker images.

## Build and Run

### 1. Build Custom Base Images

The API and frontend use custom Node.js base images.

Build both base images:

```bash
docker compose --profile build build api-base frontend-base
```

These images must be built before building the application images.

### 2. Build Application Images

```bash
docker compose build
```

The API uses a multi-stage Docker build. Its production image contains production dependencies and compiled application files.

The frontend also uses a multi-stage build. The final image serves the compiled static application through Nginx.

### 3. Start the Application

```bash
docker compose up -d
```

### 4. Check Container Status

```bash
docker compose ps
```

All five runtime services should report a healthy status.

### 5. Access the Application

Open the frontend:

```text
http://localhost:8082/
```

Check the API health endpoint:

```text
http://localhost:8082/api/health
```

Expected API response:

```json
{
  "status": "ok",
  "service": "api"
}
```

## Health Checks

Docker health checks are configured for all five runtime services:

- **API** — checks the API health endpoint.
- **Frontend** — checks the frontend HTTP response.
- **Nginx** — checks its dedicated health endpoint.
- **MongoDB** — checks database availability.
- **Redis** — checks Redis availability.

Service dependencies use health conditions to ensure that dependent services start after their required services become healthy.

## Data Persistence

MongoDB and Redis use named Docker volumes:

| Service | Volume | Container Path |
|---|---|---|
| MongoDB | `mongodb_data` | `/data/db` |
| Redis | `redis_data` | `/data` |

Data is preserved when containers are recreated or stopped.

To stop the application without deleting persistent data:

```bash
docker compose down
```

**Warning:** Do not use `docker compose down -v` unless you intentionally want to delete the application's named volumes and all stored database and cache data.

## Logging

All runtime services use Docker's `json-file` logging driver with log rotation:

- Maximum log file size: `10m`
- Maximum number of log files: `3`

View service logs:

```bash
docker compose logs
```

Follow logs in real time:

```bash
docker compose logs -f
```

View logs for a specific service:

```bash
docker compose logs api
```

## Resource Limits

Runtime containers have CPU and memory limits configured through Docker Compose.

| Service | CPU Limit | Memory Limit |
|---|---:|---:|
| API | 1.0 | 512 MB |
| Frontend | 0.25 | 128 MB |
| Nginx | 0.25 | 128 MB |
| MongoDB | 1.5 | 1024 MB |
| Redis | 0.5 | 256 MB |

## Useful Commands

Validate the Compose configuration:

```bash
docker compose config --quiet
```

Rebuild application images:

```bash
docker compose build
```

Restart the services:

```bash
docker compose restart
```

Stop and remove containers and the Compose network:

```bash
docker compose down
```

Check container resource usage:

```bash
docker stats
```

## Security Notes

- MongoDB and Redis are not exposed directly to host ports.
- MongoDB credentials are provided through Docker secrets.
- Secret files are excluded from version control.
- Application services communicate through the internal Docker network.
- Production application images exclude development dependencies and build tooling where applicable.

## Roadmap

Project requirements and learning objectives:

https://roadmap.sh/projects/multiservice-docker
