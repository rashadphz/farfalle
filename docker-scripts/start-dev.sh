#!/bin/bash

# Start development environment with dynamic port allocation
# This script ensures ports are available and starts the services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if dynamic port setup script exists
if [ ! -f "$SCRIPT_DIR/dynamic-port-setup.sh" ]; then
    echo "Error: dynamic-port-setup.sh not found in $SCRIPT_DIR"
    exit 1
fi

# Check if docker compose is available
if ! docker compose version &> /dev/null; then
    echo "Error: docker compose command not found"
    echo "Please ensure Docker Desktop is running"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "Error: Docker is not running"
    echo "Please start Docker first"
    exit 1
fi

log_info "Starting development environment with dynamic port allocation..."

# Run dynamic port setup
log_info "Running dynamic port setup..."
"$SCRIPT_DIR/dynamic-port-setup.sh"



# Stop any existing containers first
log_info "Stopping any existing containers..."
cd "$PROJECT_DIR"
docker compose -f docker-compose.dev.yaml down 2>/dev/null || true

# Get the ports from the dynamic setup
log_info "Getting dynamic port allocation..."
eval $(./docker-scripts/dynamic-port-setup.sh | grep -E "^(BACKEND_PORT|FRONTEND_PORT)=")

if [ -z "$BACKEND_PORT" ] || [ -z "$FRONTEND_PORT" ]; then
    log_error "Failed to get port information from dynamic setup"
    exit 1
fi

log_info "Using BACKEND_PORT=$BACKEND_PORT and FRONTEND_PORT=$FRONTEND_PORT"

# Start the services with environment variables
log_info "Starting Docker services..."
BACKEND_PORT=$BACKEND_PORT FRONTEND_PORT=$FRONTEND_PORT docker compose -f docker-compose.dev.yaml up --build

log_info "Development environment started successfully!"
log_info "Check the output above for the actual port being used."
