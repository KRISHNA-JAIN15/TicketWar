# 🎫 TicketWar - Flash Sale Ticket Booking Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green?style=for-the-badge&logo=mongodb)
![Redis](https://img.shields.io/badge/Redis-7.0-red?style=for-the-badge&logo=redis)
![Kafka](https://img.shields.io/badge/Apache_Kafka-3.7-orange?style=for-the-badge&logo=apache-kafka)
![Nginx](https://img.shields.io/badge/Nginx-Alpine-green?style=for-the-badge&logo=nginx)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?style=for-the-badge&logo=docker)

**A high-performance, scalable ticket booking platform designed to handle flash sales with thousands of concurrent users competing for limited seats.**

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Deployment](#-aws-deployment-guide)

</div>


<img width="1919" height="914" alt="Screenshot 2025-12-27 115014" src="https://github.com/user-attachments/assets/4f267029-5cf4-4763-962d-fce8e81cb373" />
<img width="1919" height="915" alt="Screenshot 2025-12-27 114959" src="https://github.com/user-attachments/assets/eb11e769-2f3b-4c79-802d-4195f74c8f63" />


---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Features](#-features)
3. [Architecture](#-architecture)
4. [Tech Stack](#-tech-stack)
5. [How It Works](#-how-it-works)
   - [Redis Usage](#-redis---distributed-seat-locking)
   - [Kafka Usage](#-kafka---event-streaming)
   - [Nginx Usage](#-nginx---load-balancing)
6. [Installation](#-installation)
7. [Development Setup](#-development-setup)
8. [Docker Setup](#-docker-setup)
9. [AWS Deployment Guide](#-aws-deployment-guide)
10. [Environment Variables](#-environment-variables)
11. [API Endpoints](#-api-endpoints)
12. [Database Schema](#-database-schema)
13. [Troubleshooting](#-troubleshooting)

---

## 🎯 Overview

**TicketWar** is a production-ready ticket booking system specifically designed for high-demand flash sale scenarios. When Taylor Swift tickets go on sale and millions of fans rush to buy them simultaneously, traditional systems crash. TicketWar solves this problem using:

- **Distributed Locking** with Redis to prevent overselling
- **Event Streaming** with Kafka for async processing
- **Load Balancing** with Nginx to distribute traffic
- **Horizontal Scaling** with Docker containers

### The Problem We Solve

In flash sales:
- Thousands of users click "Buy" at the exact same moment
- Traditional databases can't handle the race conditions
- Seats get oversold (same seat sold to multiple people)
- Servers crash under load

### Our Solution

- **Redis SETNX** provides atomic seat locking (milliseconds)
- **10-minute lock timers** give users time to complete payment
- **Kafka** handles event processing asynchronously
- **Nginx** distributes load across multiple app instances
- **MongoDB** stores persistent data (users, events, tickets)

---

## ✨ Features

### User Features
- 🎫 **Interactive Seat Selection** - Visual stadium map with real-time seat availability
- ⏱️ **10-Minute Booking Timer** - Reserved time to complete payment
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🔐 **Secure Authentication** - NextAuth.js with credentials provider
- 🎟️ **Digital Tickets** - View and download tickets as images
- 🔍 **Event Discovery** - Search and filter events by venue

### Admin Features
- 📊 **Dashboard** - View all events, stats, and manage tickets
- ➕ **Event Management** - Create, edit, delete events
- 👥 **User Management** - Admin role-based access control

### Technical Features
- 🔒 **Distributed Seat Locking** - Redis-based atomic operations
- 📨 **Event Streaming** - Kafka for async processing
- ⚖️ **Load Balancing** - Nginx with least-connections algorithm
- 🐳 **Containerized** - Docker Compose for easy deployment
- 📈 **Horizontally Scalable** - Add more app instances as needed

---

## 🏗 Architecture

```
                                    ┌─────────────────────────────────────────────────────────┐
                                    │                      INTERNET                            │
                                    └────────────────────────┬────────────────────────────────┘
                                                             │
                                                             ▼
                                    ┌─────────────────────────────────────────────────────────┐
                                    │                  AWS Application Load Balancer           │
                                    │                     (or Nginx on EC2)                    │
                                    └────────────────────────┬────────────────────────────────┘
                                                             │
                         ┌───────────────────────────────────┼───────────────────────────────────┐
                         │                                   │                                   │
                         ▼                                   ▼                                   ▼
              ┌─────────────────────┐          ┌─────────────────────┐          ┌─────────────────────┐
              │   Next.js App #1    │          │   Next.js App #2    │          │   Next.js App #3    │
              │    (Container)      │          │    (Container)      │          │    (Container)      │
              │     Port 3000       │          │     Port 3000       │          │     Port 3000       │
              └──────────┬──────────┘          └──────────┬──────────┘          └──────────┬──────────┘
                         │                                │                                │
                         └───────────────────────────────┬┴───────────────────────────────┘
                                                         │
                    ┌────────────────────────────────────┼────────────────────────────────────┐
                    │                                    │                                    │
                    ▼                                    ▼                                    ▼
         ┌─────────────────────┐           ┌─────────────────────┐           ┌─────────────────────┐
         │       Redis         │           │    Apache Kafka     │           │      MongoDB        │
         │   (Upstash Cloud)   │           │    (Docker/MSK)     │           │  (Atlas Cloud)      │
         │                     │           │                     │           │                     │
         │  • Seat Locking     │           │  • Event Streaming  │           │  • User Data        │
         │  • Session Cache    │           │  • Async Processing │           │  • Event Data       │
         │  • Rate Limiting    │           │  • Audit Logs       │           │  • Ticket Data      │
         └─────────────────────┘           └─────────────────────┘           └─────────────────────┘
```

### Request Flow

```
User clicks "Lock Seat"
         │
         ▼
    ┌─────────┐
    │  Nginx  │──────► Load balances to App instance
    └────┬────┘
         │
         ▼
    ┌─────────────┐
    │  Next.js    │
    │  API Route  │
    └──────┬──────┘
           │
           ├──────────────────────────────────────────────────────┐
           │                                                      │
           ▼                                                      ▼
    ┌─────────────┐                                      ┌─────────────┐
    │    Redis    │◄─── SETNX (Atomic Lock)              │    Kafka    │
    │             │                                      │             │
    │  Returns:   │                                      │  Publishes: │
    │  1 = Locked │                                      │  seat_locked│
    │  0 = Failed │                                      │  event      │
    └─────────────┘                                      └─────────────┘
           │
           ▼
    User has 10 minutes to complete payment
           │
           ▼
    Payment Success ──────► MongoDB (Store Ticket)
                           Kafka (ticket_sold event)
                           Redis (Mark seat SOLD)
```

---

## 🛠 Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4 | Server-side rendering, UI components |
| **Backend** | Next.js API Routes | RESTful API endpoints |
| **Database** | MongoDB Atlas | Persistent storage for users, events, tickets |
| **Cache/Locking** | Redis (Upstash) | Distributed seat locking, session cache |
| **Message Queue** | Apache Kafka | Event streaming, async processing |
| **Load Balancer** | Nginx | Traffic distribution, SSL termination |
| **Auth** | NextAuth.js v5 | Authentication with JWT strategy |
| **Containerization** | Docker, Docker Compose | Application packaging |
| **Cloud** | AWS (EC2, ECS, ALB, MSK) | Production hosting |

---

## 🔧 How It Works

### 🔴 Redis - Distributed Seat Locking

Redis is the **heart** of our flash sale system. It prevents the classic "double-booking" problem using atomic operations.

#### The Problem Without Redis
```
User A clicks "Buy Seat A1" ──┐
                              ├──► Both requests hit different servers
User B clicks "Buy Seat A1" ──┘    Both check DB: "Seat available!"
                                   Both insert ticket ──► OVERSOLD! 💥
```

#### The Solution With Redis SETNX
```typescript
// lib/redis.ts - Atomic seat locking

export async function lockSeat(
  eventId: string,
  seatId: string,
  userId: string
): Promise<{ success: boolean; message: string }> {
  const client = getRedisClient();
  const lockKey = `event:${eventId}:seat:${seatId}:lock`;

  // SETNX = SET if Not eXists (atomic operation)
  // Only ONE request can succeed, all others fail immediately
  const lockAcquired = await client.setnx(lockKey, userId);

  if (lockAcquired === 1) {
    // This user got the lock! Set 10-minute expiry
    await client.expire(lockKey, 600); // 600 seconds = 10 minutes
    return { success: true, message: 'Seat locked!' };
  } else {
    // Someone else already has this seat
    return { success: false, message: 'Seat already locked' };
  }
}
```

#### Redis Key Structure
```
event:{eventId}:seat:{seatId}:lock    → userId (who holds the lock)
event:{eventId}:seat:{seatId}:status  → "available" | "locked" | "sold"
event:{eventId}:seat:{seatId}:user    → userId (for sold seats)
```

#### Why Redis?
- **Speed**: Operations complete in < 1ms
- **Atomicity**: SETNX is guaranteed atomic
- **TTL**: Locks auto-expire if user abandons
- **Distributed**: Works across multiple app servers

#### Redis Configuration (Upstash)
```env
REDIS_URL=rediss://default:your-password@your-endpoint.upstash.io:6379
```

We use **Upstash** (serverless Redis) because:
- No infrastructure to manage
- Pay-per-request pricing
- Global replication available
- TLS encryption included

---

### 📨 Kafka - Event Streaming

Kafka handles **asynchronous event processing**. Instead of doing everything synchronously (which is slow), we publish events to Kafka and process them later.

#### Events We Publish

```typescript
// lib/kafka.ts - Event types

export const TOPICS = {
  TICKET_SOLD: 'ticket_sold',       // When payment succeeds
  SEAT_LOCKED: 'seat_locked',       // When user selects a seat
  SEAT_RELEASED: 'seat_released',   // When lock expires or user cancels
  PAYMENT_PROCESSED: 'payment_processed', // Payment gateway response
};

// Example: Publishing a ticket_sold event
export async function publishTicketSold(event: TicketSoldEvent): Promise<void> {
  const producer = await getProducer();
  await producer.send({
    topic: TOPICS.TICKET_SOLD,
    messages: [{
      key: `${event.eventId}-${event.seatId}`,
      value: JSON.stringify({
        eventId: event.eventId,
        seatId: event.seatId,
        userId: event.userId,
        price: event.price,
        timestamp: Date.now(),
      }),
    }],
  });
}
```

#### Why Kafka?

1. **Decoupling**: Payment API returns fast, Kafka handles the rest
2. **Reliability**: Messages persist even if consumers are down
3. **Scalability**: Partitions allow parallel processing
4. **Audit Trail**: Complete history of all events

#### Kafka Flow Diagram
```
User completes payment
         │
         ▼
┌─────────────────┐
│  Payment API    │────► Returns 200 OK immediately (fast!)
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────────────────────┐
│  Kafka Producer │────►│  Topic: ticket_sold                 │
└─────────────────┘     │  Partition 0: [msg1, msg2, msg3...] │
                        │  Partition 1: [msg4, msg5, msg6...] │
                        │  Partition 2: [msg7, msg8, msg9...] │
                        └──────────────────┬──────────────────┘
                                           │
         ┌─────────────────────────────────┼─────────────────────────────────┐
         │                                 │                                 │
         ▼                                 ▼                                 ▼
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│ Consumer: Email │             │ Consumer: Stats │             │ Consumer: Audit │
│ Send receipt    │             │ Update counters │             │ Log transaction │
└─────────────────┘             └─────────────────┘             └─────────────────┘
```

#### Kafka Configuration
```yaml
# docker-compose.yml
kafka:
  image: apache/kafka:3.7.0
  environment:
    - KAFKA_NODE_ID=1
    - KAFKA_PROCESS_ROLES=broker,controller  # KRaft mode (no Zookeeper!)
    - KAFKA_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093,EXTERNAL://:9094
    - KAFKA_AUTO_CREATE_TOPICS_ENABLE=true
    - KAFKA_NUM_PARTITIONS=3  # Parallel processing
```

---

### ⚖️ Nginx - Load Balancing

Nginx distributes incoming traffic across multiple Next.js app instances, ensuring no single server gets overwhelmed.

#### Load Balancing Strategy

```nginx
# nginx/nginx.conf

upstream ticketwar_backend {
    least_conn;  # Send to server with fewest active connections
    
    server app1:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app2:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app3:3000 weight=1 max_fails=3 fail_timeout=30s;
    
    keepalive 32;  # Persistent connections
}
```

#### Why `least_conn`?

- **Round Robin** (default): Distributes evenly, but ignores server load
- **Least Connections**: Sends to the server handling fewest requests
- **IP Hash**: Same user always goes to same server (sticky sessions)

We use `least_conn` because:
- Flash sales have uneven request patterns
- Some requests take longer (payment vs. page load)
- Prevents any single server from being overwhelmed

#### Rate Limiting

```nginx
# Prevent abuse and DDoS
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/s;

location /api/ {
    limit_req zone=api_limit burst=50 nodelay;
    # Max 100 requests/second per IP, with burst allowance of 50
}
```

#### SSL/TLS Termination

```nginx
server {
    listen 443 ssl http2;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Proxy to backend (unencrypted internally)
    location / {
        proxy_pass http://ticketwar_backend;
    }
}
```

#### Nginx Features We Use

| Feature | Purpose |
|---------|---------|
| Load Balancing | Distribute traffic across app instances |
| Rate Limiting | Prevent abuse, protect servers |
| Gzip Compression | Reduce response sizes |
| SSL Termination | Handle HTTPS, backend uses HTTP |
| Health Checks | Remove unhealthy servers |
| Static Caching | Cache static files (JS, CSS, images) |
| WebSocket Support | Real-time seat updates |

---

## 📦 Installation

### Prerequisites

- **Node.js** 20+ 
- **Docker** & Docker Compose
- **Git**
- **MongoDB Atlas** account (free tier works)
- **Upstash Redis** account (free tier works)

### Clone Repository

```bash
git clone https://github.com/yourusername/ticketwar.git
cd ticketwar
```

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ticketwar

# Redis (Upstash)
REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# NextAuth
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# Kafka (for Docker deployment)
KAFKA_BROKERS=localhost:9094
KAFKA_ENABLED=false  # Set to true when running with Docker
```

---

## 💻 Development Setup

### Option 1: Local Development (Without Docker)

```bash
# Start Next.js dev server
npm run dev

# Access at http://localhost:3000
```

This runs with:
- ✅ MongoDB Atlas (cloud)
- ✅ Upstash Redis (cloud)
- ❌ Kafka disabled (mocked)
- ❌ Nginx not used

### Option 2: Development with Docker (Kafka + Nginx)

```bash
# Start Kafka and Nginx containers
docker-compose -f docker-compose.dev.yml up -d

# Wait for Kafka to be healthy
docker-compose -f docker-compose.dev.yml ps

# Update .env.local
KAFKA_ENABLED=true
KAFKA_BROKERS=localhost:9094

# Start Next.js
npm run dev
```

Access points:
- **App**: http://localhost:3000
- **Nginx**: http://localhost:80
- **Kafka UI**: http://localhost:8080

### Seed the Database

```bash
# Create admin user and sample events
curl http://localhost:3000/api/admin/seed
```

Admin credentials:
- Email: `admin@ticketwar.com`
- Password: `admin123`

---

## 🐳 Docker Setup

### Understanding Our Docker Setup

#### Dockerfile (Multi-stage Build)

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Security: Run as non-root user
RUN addgroup --system nodejs
RUN adduser --system nextjs

# Copy only production files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

**Why Multi-stage?**
- Build stage: 1.5GB (includes devDependencies)
- Production stage: ~150MB (minimal)

#### Docker Compose Services

```yaml
# docker-compose.yml

services:
  # Kafka Message Broker
  kafka:
    image: bitnami/kafka:latest
    ports:
      - "9092:9092"   # Internal
      - "9094:9094"   # External (host access)
    environment:
      - KAFKA_CFG_PROCESS_ROLES=controller,broker  # KRaft mode
      - KAFKA_CFG_AUTO_CREATE_TOPICS_ENABLE=true
      - KAFKA_CFG_NUM_PARTITIONS=3

  # Kafka Monitoring UI
  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8080:8080"

  # Nginx Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro

  # App Instance 1
  app1:
    build: .
    environment:
      - REDIS_URL=${REDIS_URL}
      - KAFKA_BROKERS=kafka:9092
      - KAFKA_ENABLED=true

  # App Instance 2
  app2:
    build: .
    # ... same config

  # App Instance 3
  app3:
    build: .
    # ... same config
```

### Running Full Stack with Docker

```bash
# Build and start all services
docker-compose up -d --build

# Check status
docker-compose ps

# View logs
docker-compose logs -f app1

# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

## ☁️ AWS Deployment Guide

This section provides a **complete, step-by-step guide** to deploying TicketWar on AWS.

### Architecture on AWS

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                     AWS Cloud                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                              VPC (10.0.0.0/16)                           │   │
│  │                                                                          │   │
│  │   ┌─────────────────────┐       ┌─────────────────────┐                 │   │
│  │   │  Public Subnet A    │       │  Public Subnet B    │                 │   │
│  │   │   10.0.1.0/24       │       │   10.0.2.0/24       │                 │   │
│  │   │                     │       │                     │                 │   │
│  │   │  ┌──────────────┐   │       │  ┌──────────────┐   │                 │   │
│  │   │  │  NAT Gateway │   │       │  │  NAT Gateway │   │                 │   │
│  │   │  └──────────────┘   │       │  └──────────────┘   │                 │   │
│  │   └─────────────────────┘       └─────────────────────┘                 │   │
│  │              │                            │                              │   │
│  │              ▼                            ▼                              │   │
│  │   ┌──────────────────────────────────────────────────────────────────┐  │   │
│  │   │                Application Load Balancer (ALB)                    │  │   │
│  │   │                    (HTTPS termination)                            │  │   │
│  │   └────────────────────────────┬─────────────────────────────────────┘  │   │
│  │                                │                                         │   │
│  │   ┌────────────────────────────┼────────────────────────────────────┐   │   │
│  │   │  Private Subnet A          │         Private Subnet B           │   │   │
│  │   │   10.0.10.0/24             │          10.0.20.0/24              │   │   │
│  │   │                            │                                    │   │   │
│  │   │  ┌─────────────────────────┼───────────────────────────────┐   │   │   │
│  │   │  │            ECS Cluster (Fargate)                        │   │   │   │
│  │   │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │   │   │
│  │   │  │  │  Task1  │  │  Task2  │  │  Task3  │  │  Task4  │    │   │   │   │
│  │   │  │  │ Next.js │  │ Next.js │  │ Next.js │  │ Next.js │    │   │   │   │
│  │   │  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │   │   │
│  │   │  └─────────────────────────────────────────────────────────┘   │   │   │
│  │   │                            │                                    │   │   │
│  │   └────────────────────────────┼────────────────────────────────────┘   │   │
│  │                                │                                         │   │
│  └────────────────────────────────┼─────────────────────────────────────────┘   │
│                                   │                                              │
│       ┌───────────────────────────┼───────────────────────────────┐             │
│       │                           │                               │             │
│       ▼                           ▼                               ▼             │
│  ┌──────────┐              ┌─────────────┐              ┌─────────────┐         │
│  │ MongoDB  │              │  Amazon MSK │              │  ElastiCache│         │
│  │  Atlas   │              │   (Kafka)   │              │   (Redis)   │         │
│  │ (External)│             │             │              │             │         │
│  └──────────┘              └─────────────┘              └─────────────┘         │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Option A: ECS Fargate (Recommended - Serverless Containers)

#### Step 1: Prerequisites

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter: AWS Access Key ID, Secret Access Key, Region (us-east-1)

# Install ECS CLI (optional but helpful)
sudo curl -Lo /usr/local/bin/ecs-cli https://amazon-ecs-cli.s3.amazonaws.com/ecs-cli-linux-amd64-latest
sudo chmod +x /usr/local/bin/ecs-cli
```

#### Step 2: Create ECR Repository

```bash
# Create repository for Docker images
aws ecr create-repository \
    --repository-name ticketwar \
    --region us-east-1

# Get login command
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push image
docker build -t ticketwar .
docker tag ticketwar:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ticketwar:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ticketwar:latest
```

#### Step 3: Create VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --query 'Vpc.VpcId' --output text
# Returns: vpc-xxxxxxxxx

# Enable DNS hostnames
aws ec2 modify-vpc-attribute --vpc-id vpc-xxxxxxxxx --enable-dns-hostnames

# Create Internet Gateway
aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text
aws ec2 attach-internet-gateway --vpc-id vpc-xxxxxxxxx --internet-gateway-id igw-xxxxxxxxx

# Create Subnets (2 AZs for high availability)
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxxxxxxxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b
```

#### Step 4: Create ECS Cluster

```bash
# Create cluster
aws ecs create-cluster --cluster-name ticketwar-cluster --capacity-providers FARGATE

# Create task definition (save as task-definition.json)
```

**task-definition.json:**
```json
{
  "family": "ticketwar",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::YOUR_ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "ticketwar",
      "image": "YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/ticketwar:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "KAFKA_ENABLED", "value": "true"}
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:ticketwar/mongodb"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:ticketwar/redis"
        },
        {
          "name": "NEXTAUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:YOUR_ACCOUNT:secret:ticketwar/auth"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/ticketwar",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

```bash
# Register task definition
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

#### Step 5: Create Application Load Balancer

```bash
# Create security group for ALB
aws ec2 create-security-group \
    --group-name ticketwar-alb-sg \
    --description "ALB security group" \
    --vpc-id vpc-xxxxxxxxx

# Allow inbound HTTP/HTTPS
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

# Create ALB
aws elbv2 create-load-balancer \
    --name ticketwar-alb \
    --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
    --security-groups sg-xxxxxxxxx \
    --scheme internet-facing \
    --type application

# Create target group
aws elbv2 create-target-group \
    --name ticketwar-targets \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-xxxxxxxxx \
    --target-type ip \
    --health-check-path /api/health
```

#### Step 6: Create ECS Service

```bash
# Create service
aws ecs create-service \
    --cluster ticketwar-cluster \
    --service-name ticketwar-service \
    --task-definition ticketwar \
    --desired-count 3 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=ticketwar,containerPort=3000"
```

#### Step 7: Set Up Auto Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
    --service-namespace ecs \
    --resource-id service/ticketwar-cluster/ticketwar-service \
    --scalable-dimension ecs:service:DesiredCount \
    --min-capacity 2 \
    --max-capacity 10

# Create scaling policy (scale on CPU)
aws application-autoscaling put-scaling-policy \
    --service-namespace ecs \
    --resource-id service/ticketwar-cluster/ticketwar-service \
    --scalable-dimension ecs:service:DesiredCount \
    --policy-name cpu-scaling \
    --policy-type TargetTrackingScaling \
    --target-tracking-scaling-policy-configuration '{
        "TargetValue": 70.0,
        "PredefinedMetricSpecification": {
            "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
        },
        "ScaleOutCooldown": 60,
        "ScaleInCooldown": 120
    }'
```

### Option B: EC2 with Docker Compose (More Control, Lower Cost)

#### Step 1: Launch EC2 Instance

```bash
# Launch t3.medium instance with Amazon Linux 2023
aws ec2 run-instances \
    --image-id ami-0c7217cdde317cfec \
    --instance-type t3.medium \
    --key-name your-key-pair \
    --security-groups ticketwar-sg \
    --user-data file://user-data.sh
```

**user-data.sh:**
```bash
#!/bin/bash
# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Git
yum install -y git

# Clone repository
cd /home/ec2-user
git clone https://github.com/yourusername/ticketwar.git
cd ticketwar

# Create .env file
cat > .env << EOF
MONGODB_URI=your-mongodb-uri
REDIS_URL=your-redis-url
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-domain.com
KAFKA_ENABLED=true
EOF

# Start services
docker-compose up -d --build
```

#### Step 2: Configure Security Group

```bash
# Create security group
aws ec2 create-security-group \
    --group-name ticketwar-sg \
    --description "TicketWar security group"

# Allow SSH
aws ec2 authorize-security-group-ingress \
    --group-name ticketwar-sg \
    --protocol tcp --port 22 --cidr YOUR_IP/32

# Allow HTTP
aws ec2 authorize-security-group-ingress \
    --group-name ticketwar-sg \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

# Allow HTTPS
aws ec2 authorize-security-group-ingress \
    --group-name ticketwar-sg \
    --protocol tcp --port 443 --cidr 0.0.0.0/0
```

#### Step 3: Set Up SSL with Certbot

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Certbot
sudo yum install -y certbot

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certs to nginx directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /home/ec2-user/ticketwar/nginx/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /home/ec2-user/ticketwar/nginx/ssl/

# Restart nginx
docker-compose restart nginx
```

### Setting Up Amazon MSK (Managed Kafka)

If you need managed Kafka instead of running in Docker:

```bash
# Create MSK cluster
aws kafka create-cluster \
    --cluster-name ticketwar-kafka \
    --broker-node-group-info '{
        "InstanceType": "kafka.t3.small",
        "ClientSubnets": ["subnet-xxx", "subnet-yyy"],
        "SecurityGroups": ["sg-xxx"],
        "StorageInfo": {
            "EbsStorageInfo": {
                "VolumeSize": 100
            }
        }
    }' \
    --kafka-version "3.5.1" \
    --number-of-broker-nodes 2

# Get bootstrap servers
aws kafka get-bootstrap-brokers --cluster-arn arn:aws:kafka:...
```

### Setting Up ElastiCache (Managed Redis)

Alternative to Upstash for production:

```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id ticketwar-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --security-group-ids sg-xxx \
    --cache-subnet-group-name your-subnet-group
```

### Domain and SSL Setup

#### Route 53 Configuration

```bash
# Create hosted zone
aws route53 create-hosted-zone --name your-domain.com --caller-reference $(date +%s)

# Create A record pointing to ALB
aws route53 change-resource-record-sets \
    --hosted-zone-id ZXXXXXXXXXXXXX \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "your-domain.com",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "ALB_HOSTED_ZONE_ID",
                    "DNSName": "ticketwar-alb-xxxxx.us-east-1.elb.amazonaws.com",
                    "EvaluateTargetHealth": true
                }
            }
        }]
    }'
```

#### ACM Certificate

```bash
# Request certificate
aws acm request-certificate \
    --domain-name your-domain.com \
    --validation-method DNS \
    --subject-alternative-names www.your-domain.com

# Add certificate to ALB listener
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:... \
    --protocol HTTPS \
    --port 443 \
    --certificates CertificateArn=arn:aws:acm:... \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

---

## 📊 Cost Estimation (AWS)

### Development/Small Scale

| Service | Specification | Monthly Cost |
|---------|---------------|--------------|
| EC2 | t3.medium (1 instance) | ~$30 |
| MongoDB Atlas | M0 Free Tier | $0 |
| Upstash Redis | Free Tier | $0 |
| Route 53 | 1 hosted zone | ~$0.50 |
| **Total** | | **~$30/month** |

### Production Scale

| Service | Specification | Monthly Cost |
|---------|---------------|--------------|
| ECS Fargate | 4 tasks (0.5 vCPU, 1GB) | ~$60 |
| ALB | 1 load balancer | ~$20 |
| Amazon MSK | 2 brokers (kafka.t3.small) | ~$100 |
| ElastiCache | cache.t3.micro | ~$15 |
| MongoDB Atlas | M10 | ~$60 |
| Route 53 | Hosted zone + queries | ~$1 |
| CloudWatch | Logs & metrics | ~$10 |
| **Total** | | **~$266/month** |

### Flash Sale Peak (Auto-scaled)

| Service | Specification | Hourly Cost |
|---------|---------------|-------------|
| ECS Fargate | 20 tasks (scales up) | ~$2/hour |
| Additional ALB capacity | Burst handling | ~$0.50/hour |
| **Peak Total** | | **~$2.50/hour** |

---

## 🔐 Environment Variables

### Required Variables

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticketwar

# Redis
REDIS_URL=rediss://default:password@endpoint.upstash.io:6379

# Authentication
NEXTAUTH_SECRET=minimum-32-character-random-string-here
NEXTAUTH_URL=https://your-domain.com

# Kafka (Production)
KAFKA_BROKERS=kafka-broker1:9092,kafka-broker2:9092
KAFKA_ENABLED=true
KAFKA_SSL=true
```

### AWS Secrets Manager (Production)

```bash
# Create secrets
aws secretsmanager create-secret \
    --name ticketwar/mongodb \
    --secret-string "mongodb+srv://..."

aws secretsmanager create-secret \
    --name ticketwar/redis \
    --secret-string "rediss://..."

aws secretsmanager create-secret \
    --name ticketwar/auth \
    --secret-string "your-nextauth-secret"
```

---

## 🛣 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | Sign in with credentials |
| POST | `/api/auth/signup` | Create new account |
| POST | `/api/auth/signout` | Sign out |
| GET | `/api/auth/session` | Get current session |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/[slug]` | Get event details |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/[id]` | Update event (admin) |
| DELETE | `/api/events/[id]` | Delete event (admin) |

### Seats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seats/status?eventId=xxx` | Get all seat statuses |
| POST | `/api/seats/lock` | Lock a seat |

### Tickets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tickets` | Get user's tickets |
| POST | `/api/tickets` | Purchase ticket |

### Payment

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment` | Process payment |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/seed` | Seed database |
| GET | `/api/admin/reset-tickets` | Reset tickets collection |

---

## 🗄 Database Schema

### User

```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  name: string,
  role: 'user' | 'admin',
  createdAt: Date,
  updatedAt: Date
}
```

### Event

```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  artist: string,
  venue: string,
  date: string,
  time: string,
  description: string,
  image: string,
  color: string,
  totalSeats: number,
  seatsLeft: number,
  priceFrom: number,
  isActive: boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Ticket

```typescript
{
  _id: ObjectId,
  ticketId: string (UUID),
  userId: string,
  eventId: string,
  eventSlug: string,
  eventName: string,
  eventVenue: string,
  eventDate: string,
  eventTime: string,
  seatId: string,
  section: string,
  row: string,
  seatNumber: number,
  price: number,
  serviceFee: number,
  totalPaid: number,
  paymentId: string,
  status: 'confirmed' | 'cancelled' | 'used',
  purchasedAt: Date
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Kafka Connection Failed

```bash
# Check if Kafka is running
docker-compose ps kafka

# View Kafka logs
docker-compose logs kafka

# Test connection
docker exec -it ticketwar-kafka kafka-topics.sh --list --bootstrap-server localhost:9092
```

#### Redis Connection Failed

```bash
# Test Redis connection
redis-cli -u "rediss://default:password@endpoint.upstash.io:6379" ping

# Should return: PONG
```

#### MongoDB Connection Failed

```bash
# Test with mongosh
mongosh "mongodb+srv://cluster.mongodb.net/ticketwar" --username your-user

# Check IP whitelist in Atlas
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Seat Lock Not Working

```bash
# Check Redis keys
redis-cli -u "your-redis-url" keys "event:*:seat:*"

# Clear all locks
redis-cli -u "your-redis-url" keys "event:*:seat:*:lock" | xargs redis-cli -u "your-redis-url" del
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev)
- [Redis Commands](https://redis.io/commands)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for handling millions of ticket requests**

[⬆ Back to Top](#-ticketwar---flash-sale-ticket-booking-platform)

</div>
