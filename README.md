# RefriTec Application

This repository contains both the backend (FastAPI) and frontend (React) components of the RefriTec application, containerized with Docker.

## Running with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Simple Deployment

This application uses a single script and Docker Compose file for deployment in both local and production environments.

#### Local Development

```bash
# Build frontend (only needed after making frontend changes)
./deploy.sh --build

# Start the application
./deploy.sh --start

# Or do both at once
./deploy.sh --build --start
```

#### Production Deployment

When deploying to the production server with limited resources (1GB RAM):

1. Build locally first, then push to Git:
   ```bash
   # Build the frontend locally
   ./deploy.sh --build
   
   # Commit and push the pre-built frontend
   git add .
   git commit -m "Updated frontend build"
   git push
   ```

2. On the production server:
   ```bash
   # Pull latest changes
   git pull
   
   # Start the application
   ./deploy.sh --start
   ```

### Accessing the Application

- Frontend: http://localhost:3000
- API (through frontend proxy): http://localhost:3000/api
- API Documentation: http://localhost:3000/docs

For production:
- Frontend: http://144.22.197.21:3000
- API (through frontend proxy): http://144.22.197.21:3000/api
- API Documentation: http://144.22.197.21:3000/docs

### Stopping the Application

To stop the application, use:

```bash
docker-compose down
```

## Architecture

This application uses a secure architecture where:

1. Only the frontend port (3000) is exposed externally
2. The backend API is not directly accessible from outside the Docker network
3. All API requests are proxied through Nginx, which runs in the frontend container
4. Communication between frontend and backend happens within the Docker network

## Project Structure

- `/back` - FastAPI backend
- `/front` - React frontend
  - `/front/build` - Pre-built frontend files (committed to repository)
- `nginx.conf` - Nginx configuration for API proxying
- `docker-compose.yml` - Docker configuration
- `deploy.sh` - Script to simplify deployment

## Important Notes

- Always build the frontend locally before deploying to the production server
- The same Docker Compose configuration works for both local and production environments
- The application is designed to be simple to deploy and maintain 