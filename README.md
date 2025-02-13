## ECS-FinHAcks 
![ARCH](docs/ECS-Finhack.png)
A Node.js Express API application with Prometheus metrics integration, Swagger documentation, and health monitoring endpoints.

## Features

- Express.js REST API
- Prometheus metrics integration
- Swagger API documentation
- Health check endpoints
- AWS RDS database integration
- Docker containerization

## Prerequisites

- Node.js 20.x
- Docker (optional)
- AWS RDS database instance
- AWS credentials configured for RDS Data API access

## Environment Variables

- AWS_REGION: AWS region (e.g., us-east-1)
- DB_HOST: RDS database endpoint
- DB_PORT: RDS database port
- DB_USERNAME: RDS database username
- DB_PASSWORD: RDS database password
- DB_NAME: RDS database name

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
node index.js
```

## API Endpoints

- `GET /` - Welcome message
- `GET /metrics` - Prometheus metrics
- `GET /ping` - Health check endpoint
- `GET /error` - Error simulation endpoint
- `GET /db-check` - Database connection check
- `GET /health` - Application health status

## API Documentation

Swagger UI documentation is available at:
```
http://localhost:8080/api-docs
```
### Prometheus Metrics

Prometheus metrics are exposed at:
```
http://localhost:8080/metrics
```

### Health Checks

The application includes multiple health check endpoints:
- Container health: `/container`
- Application health: `/health`
- Simple ping: `/ping`
