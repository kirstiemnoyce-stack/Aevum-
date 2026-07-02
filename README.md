# Aevum 🚀

A powerful application for managing time and tasks with PostgreSQL database integration.

## Getting Started

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- npm or yarn
- PostgreSQL 12+ (for local development) OR Docker & Docker Compose

### Installation

#### Option 1: Run Locally with Local PostgreSQL

**Prerequisites:**
- PostgreSQL installed and running on your machine
- Create a database named `aevum`

```bash
# 1. Clone the repository
git clone https://github.com/kirstiemnoyce-stack/Aevum-.git
cd Aevum-

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Update .env with your PostgreSQL credentials
nano .env
# Change:
# DB_USER=your-postgres-user
# DB_PASSWORD=your-postgres-password
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=aevum

# 5. Create the database (if not already created)
createdb aevum

# 6. Run the app
npm start

# 7. App should be running at http://localhost:3000
```

#### Option 2: Run with Docker Compose (Easiest!)

```bash
# 1. Clone the repository
git clone https://github.com/kirstiemnoyce-stack/Aevum-.git
cd Aevum-

# 2. Install dependencies
npm install

# 3. Start both app and database
docker-compose up -d

# 4. View logs
docker-compose logs -f app

# 5. App should be running at http://localhost:3000

# 6. To stop everything
docker-compose down

# 7. To remove database volumes and restart fresh
docker-compose down -v
docker-compose up -d
```

### Development Mode

```bash
# Install dev dependencies (for auto-reload)
npm install

# Run with auto-reload
npm run dev

# App will restart when you save files
```

## Database Schema

### Tasks Table
```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Tasks Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks` | Get all tasks |
| `GET` | `/api/tasks/:id` | Get specific task |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

### Users Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | Get all users |
| `POST` | `/api/users` | Create new user |

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Welcome message |
| `GET` | `/health` | Health check |

## Example API Requests

### 1. Get Welcome Message
```bash
curl http://localhost:3000
```

**Response:**
```json
{
  "message": "Welcome to Aevum! 🚀",
  "version": "1.0.0",
  "description": "A powerful application for managing time and tasks",
  "database": "PostgreSQL",
  "endpoints": {
    "tasks": "/api/tasks",
    "users": "/api/users",
    "health": "/health"
  }
}
```

### 2. Create a Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn PostgreSQL","description":"Set up database for Aevum"}'
```

**Response:**
```json
{
  "id": 1,
  "title": "Learn PostgreSQL",
  "description": "Set up database for Aevum",
  "completed": false,
  "created_at": "2024-01-15T10:30:45.123Z",
  "updated_at": "2024-01-15T10:30:45.123Z"
}
```

### 3. Get All Tasks
```bash
curl http://localhost:3000/api/tasks
```

**Response:**
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Learn PostgreSQL",
      "description": "Set up database for Aevum",
      "completed": false,
      "created_at": "2024-01-15T10:30:45.123Z",
      "updated_at": "2024-01-15T10:30:45.123Z"
    }
  ],
  "count": 1
}
```

### 4. Get Specific Task
```bash
curl http://localhost:3000/api/tasks/1
```

**Response:**
```json
{
  "id": 1,
  "title": "Learn PostgreSQL",
  "description": "Set up database for Aevum",
  "completed": false,
  "created_at": "2024-01-15T10:30:45.123Z",
  "updated_at": "2024-01-15T10:30:45.123Z"
}
```

### 5. Update a Task
```bash
curl -X PUT http://localhost:3000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn PostgreSQL","description":"Mastered database setup","completed":true}'
```

**Response:**
```json
{
  "id": 1,
  "title": "Learn PostgreSQL",
  "description": "Mastered database setup",
  "completed": true,
  "created_at": "2024-01-15T10:30:45.123Z",
  "updated_at": "2024-01-15T10:35:22.456Z"
}
```

### 6. Delete a Task
```bash
curl -X DELETE http://localhost:3000/api/tasks/1
```

**Response:**
```json
{
  "message": "Task deleted successfully",
  "task": {
    "id": 1,
    "title": "Learn PostgreSQL",
    "description": "Mastered database setup",
    "completed": true,
    "created_at": "2024-01-15T10:30:45.123Z",
    "updated_at": "2024-01-15T10:35:22.456Z"
  }
}
```

### 7. Create a User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Kirstie","email":"kirstie@aevum.app"}'
```

**Response:**
```json
{
  "id": 1,
  "name": "Kirstie",
  "email": "kirstie@aevum.app",
  "created_at": "2024-01-15T10:30:45.123Z"
}
```

### 8. Get All Users
```bash
curl http://localhost:3000/api/users
```

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Kirstie",
      "email": "kirstie@aevum.app",
      "created_at": "2024-01-15T10:30:45.123Z"
    }
  ],
  "count": 1
}
```

### 9. Health Check
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "database": "connected"
}
```

## Project Structure

```
Aevum-/
├── .github/
│   └── workflows/
│       └── build.yml           # GitHub Actions CI/CD
├── src/
│   ├── index.js                # Main application file
│   └── db.js                   # PostgreSQL connection
├── .dockerignore               # Files to exclude from Docker
├── .env                        # Environment variables (local)
├── .env.example                # Example environment variables
├── .gitignore                  # Files to exclude from Git
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Docker Compose with PostgreSQL
├── package.json                # Dependencies and scripts
├── package-lock.json           # Locked dependency versions
└── README.md                   # This file
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Database Configuration
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aevum
```

**Variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASSWORD` | `password` | PostgreSQL password |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `aevum` | PostgreSQL database name |

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=5000 npm start
```

### PostgreSQL Connection Error

**Local development:**
```bash
# Check if PostgreSQL is running
psql -U postgres -d postgres

# Create database if missing
createdb aevum

# Check your .env credentials
cat .env
```

**Docker:**
```bash
# Check database container logs
docker-compose logs db

# Restart containers
docker-compose down
docker-compose up -d --build
```

### Docker Connection Issues
```bash
# Remove all containers and volumes
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# View detailed logs
docker-compose logs -f
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@aevum.app

---

**Made with ❤️ by Kirstie**
