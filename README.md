# TicketWar 🎟️⚔️

A high-performance Flash-Sale Ticket Booking System designed to handle 100,000+ concurrent users.

## Architecture

- **Redis (Upstash)**: Atomic seat locking with SETNX operations
- **Kafka (Docker)**: Event streaming for ticket sales, seat locks, payments
- **Nginx (Docker)**: Load balancing across multiple Next.js instances
- **Next.js**: Server-side rendered React frontend

## Quick Start

### 1. Start Infrastructure (Kafka + Nginx)

```bash
# Start Kafka and Kafka UI for development
docker-compose -f docker-compose.dev.yml up -d

# View Kafka UI at http://localhost:8080
```

### 2. Run Development Server

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### 3. Access via Nginx (optional)

With docker-compose.dev.yml running, access via Nginx at [http://localhost:80](http://localhost:80)

## Production Deployment

```bash
# Build and start all services (3 load-balanced app instances)
docker-compose up -d --build

# Access the app at http://localhost:80
```

## Environment Variables

Create `.env.local` with:

```env
# Redis (Upstash)
REDIS_URL="your-upstash-redis-url"

# Kafka (Docker)
KAFKA_BROKERS=localhost:9094
KAFKA_ENABLED=true
```

## Docker Services

| Service     | Port  | Description                    |
|-------------|-------|--------------------------------|
| kafka       | 9094  | Kafka broker (external access) |
| kafka-ui    | 8080  | Kafka monitoring UI            |
| nginx       | 80    | Load balancer                  |
| app1/2/3    | -     | Next.js instances (internal)   |

## Features

- ⚡ **Real-time seat locking** with Redis atomic operations
- 📊 **Event streaming** via Kafka for analytics
- 🔄 **Load balancing** with Nginx least-connections
- ⏱️ **10-minute booking timer** with auto-release
- 🎨 **Interactive stadium seat map**
