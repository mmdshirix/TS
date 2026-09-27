# Docker Deployment Guide

This guide will help you deploy the TalkSell application using Docker.

## Important: Build-time vs Runtime Configuration

This application uses a **fake database URL during build** and connects to the **real database at runtime**. This prevents database connection errors during the Docker build process.

- **Build time**: Uses `postgresql://fake:fake@localhost:5432/fake` 
- **Runtime**: Uses your actual `DATABASE_URL` from environment variables

All API routes are configured with `export const dynamic = 'force-dynamic'` to ensure they only execute at runtime, not during build.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)
- Environment variables configured

## Quick Start

### 1. Set Environment Variables

Create a `.env` file in the root directory with all required environment variables:

```bash
# Database - These are used ONLY at runtime
DATABASE_URL=your_database_url
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_prisma_url
# PostgreSQL (Optional - for connection pooling config)

PGHOST=your_host
PGPORT=5432

# API Keys
DEEPSEEK_API_KEY=your_deepseek_key
STACK_SECRET_SERVER_KEY=your_stack_secret

# Public URLs - These are needed at build time
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_STACK_PROJECT_ID=your_stack_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_publishable_key
```

### 2. Build and Run with Docker Compose

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### 3. Build and Run with Docker (without compose)

```bash
# Build the image (only public env vars needed)
docker build \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
  --build-arg NEXT_PUBLIC_STACK_PROJECT_ID="$NEXT_PUBLIC_STACK_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" \
  -t talksell-app .

# Run the container (pass all env vars at runtime)
docker run -d \
  --name talksell \
  -p 3000:3000 \
  --env-file .env \
  talksell-app

# View logs
docker logs -f talksell

# Stop the container
docker stop talksell
docker rm talksell
```

## Production Deployment

### Deploy to a VPS/Server

1. **SSH into your server:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Clone your repository:**
   ```bash
   git clone https://github.com/yourusername/talksell.git
   cd talksell
   ```

3. **Set up environment variables:**
   ```bash
   nano .env
   # Add all your environment variables
   ```

4. **Build and run:**
   ```bash
   docker-compose up -d
   ```

5. **Set up Nginx as reverse proxy (optional):**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Deploy to Cloud Platforms

#### AWS ECS
```bash
# Build and push to ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account-id.dkr.ecr.region.amazonaws.com
docker build \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
  --build-arg NEXT_PUBLIC_STACK_PROJECT_ID="$NEXT_PUBLIC_STACK_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="$NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY" \
  -t talksell-app .
docker tag talksell-app:latest account-id.dkr.ecr.region.amazonaws.com/talksell-app:latest
docker push account-id.dkr.ecr.region.amazonaws.com/talksell-app:latest

# Then set DATABASE_URL and other secrets in ECS task definition environment variables
```

#### Google Cloud Run
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/project-id/talksell-app

# Deploy with environment variables
gcloud run deploy talksell \
  --image gcr.io/project-id/talksell-app \
  --platform managed \
  --set-env-vars DATABASE_URL="$DATABASE_URL",POSTGRES_URL="$POSTGRES_URL"
```

#### DigitalOcean App Platform
- Connect your GitHub repository
- Select Dockerfile as build method
- Add environment variables in the App Platform dashboard (these will be available at runtime)

## Health Check

The application includes a health check endpoint at `/api/health`. You can verify the deployment:

```bash
curl http://localhost:3000/api/health
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Check if port 3000 is available
lsof -i :3000
```

### Database connection issues
- Verify all database environment variables are set correctly in `.env` file
- Ensure your database allows connections from the Docker container IP
- Remember: Database connection happens at **runtime**, not build time

### Build fails
```bash
# Clean build
docker-compose down
docker system prune -a

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

**Note**: The build should succeed even without a real database connection because:
1. A fake DATABASE_URL is used during build
2. All API routes use `export const dynamic = 'force-dynamic'`
3. Database connections only happen inside functions at runtime

### Database connection errors after deployment
- Check that `DATABASE_URL` is set in the runtime environment
- Verify the database is accessible from the container
- Check logs: `docker-compose logs -f`

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## Monitoring

```bash
# View container stats
docker stats talksell

# View logs in real-time
docker-compose logs -f --tail=100
```

## Architecture Notes

This application separates build-time and runtime concerns:

- **Build Stage**: Uses fake database credentials, builds the Next.js app without database access
- **Runtime Stage**: Connects to real database using environment variables passed at container startup
- **API Routes**: All routes with database queries use `getSql()` function (called at runtime) and `export const dynamic = 'force-dynamic'` to prevent build-time execution
