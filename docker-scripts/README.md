# Docker Scripts

This directory contains utility scripts for managing Docker development environment with dynamic port allocation.

## Scripts

### `find-available-port.sh`
Simple utility script that finds an available port starting from 8000.

**Usage:**
```bash
./find-available-port.sh [start_port]
```

**Example:**
```bash
./find-available-port.sh 8000
# Output: 8001 (if 8000 is busy)
```

### `dynamic-port-setup.sh`
Comprehensive script that:
1. Finds an available port starting from 8000
2. Updates the `.env` file with the dynamic port
3. Creates a `docker-compose.override.yaml` file for dynamic port mapping

**Usage:**
```bash
./dynamic-port-setup.sh
```

**What it does:**
- Sets `BACKEND_PORT` in `.env`
- Updates `NEXT_PUBLIC_API_URL` in `.env`
- Creates `docker-compose.override.yaml` with dynamic port mapping
- Ensures frontend connects to the correct backend port

### `start-dev.sh`
Convenience script that:
1. Runs the dynamic port setup
2. Starts the Docker development environment

**Usage:**
```bash
./start-dev.sh
```

**What it does:**
- Automatically finds an available port
- Updates configuration files
- Starts services with `docker-compose up --build`

## How It Works

The dynamic port system works by:

1. **Port Detection**: Uses `lsof` to check if ports are available
2. **Configuration Update**: Updates `.env` file with the available port
3. **Docker Override**: Creates a `docker-compose.override.yaml` that maps the host port to container port 8000
4. **Service Startup**: Starts services using both the base compose file and the override

## Example Workflow

```bash
# Start development environment with automatic port allocation
./start-dev.sh

# Or manually set up ports first
./dynamic-port-setup.sh
docker-compose -f docker-compose.dev.yaml -f docker-compose.override.yaml up
```

## Port Allocation

- **Backend**: Maps from available host port (8000, 8001, 8002, etc.) to container port 8000
- **Frontend**: Automatically configured to connect to the backend at the allocated port
- **Other Services**: Remain unchanged (SearXNG on 8080, PostgreSQL on 5432)

## Troubleshooting

### Port Already in Use
The script automatically finds the next available port. If you see port conflicts, the script will handle them.

### lsof Not Found
Install `lsof`:
- **macOS**: `brew install lsof`
- **Ubuntu/Debian**: `sudo apt-get install lsof`
- **CentOS/RHEL**: `sudo yum install lsof`

### Configuration Issues
- Check that `.env` file exists and has correct values
- Verify `docker-compose.override.yaml` was created
- Ensure Docker is running before executing scripts

## Files Created/Modified

- `.env` - Environment variables with dynamic port
- `docker-compose.override.yaml` - Dynamic port mapping (auto-generated)
- Both files are gitignored to prevent conflicts
