# BAZE - Forms Application

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Git

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd BAZE
   git checkout DevOps
   ```

2. **Create environment file:**
   Create a `.env` file in the root directory with the following content:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://postgres:postgres@db:5432/forms

   # JWT Configuration
   SECRET_KEY=your-secret-key-here-change-this-in-production
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=2880

   # Cloudinary Configuration (optional - for image uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Start the application:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:13008
   - Backend API: http://localhost:18088
   - Health Check: http://localhost:18088/health

### Features
- ✅ User authentication & authorization
- ✅ Form builder with multiple question types
- ✅ Form sharing and collaboration
- ✅ Excel export functionality
- ✅ Health monitoring
- ✅ Database persistence
- ✅ CORS support

### Services
- **Frontend**: React app with Nginx (port 13008)
- **Backend**: FastAPI application (port 18088)
- **Database**: PostgreSQL with persistent volumes
- **Health Monitor**: Network connectivity monitoring

### Architecture
- **Docker Compose**: Multi-container setup
- **Health Checks**: All services monitored
- **Volume Persistence**: Database data persists across restarts
- **Network**: Internal Docker network with external access

### Troubleshooting

#### Common Issues:

**1. Environment Variables Not Found:**
```
The "SECRET_KEY" variable is not set. Defaulting to a blank string.
```
**Solution:** Ensure `.env` file exists in the root directory (same level as `docker-compose.yml`)

**2. .env File Not Found:**
```
env file C:\path\project.env not found
```
**Solutions:**
- Create `.env` file in root directory (not subdirectory)
- File must be named exactly `.env` (not `project.env` or similar)
- Use: `docker-compose --env-file .env up -d` if needed

**3. Port Conflicts:**
- Ensure ports 13008 and 18088 are available
- Stop other services using these ports

**4. Docker Issues:**
- Ensure Docker is running
- Try: `docker-compose down && docker-compose up -d --force-recreate`
- Check container logs: `docker-compose logs [service-name]`

**5. Database Connection Issues:**
- Wait for database to be healthy: `docker-compose ps`
- Check DATABASE_URL in .env file
