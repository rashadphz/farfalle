#!/bin/bash

# Dynamic port setup for Docker Compose
# This script finds an available port and updates the configuration accordingly

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yaml"
ENV_FILE="$PROJECT_DIR/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo "[INFO] $1"
}

log_warn() {
    echo "[WARN] $1"
}

log_error() {
    echo "[ERROR] $1"
}



# Display dynamic port information
display_port_info() {
    local backend_port=$1
    local frontend_port=$2
    
    log_info "Dynamic port allocation complete!"
    log_info "Backend will be available at: http://localhost:$backend_port"
    log_info "Frontend will be available at: http://localhost:$frontend_port"
    log_info "Frontend will connect to backend at: http://localhost:$backend_port"
    log_info ""
    log_info "To start the services, run:"
    log_info "  BACKEND_PORT=$backend_port FRONTEND_PORT=$frontend_port docker compose -f docker-compose.dev.yaml up"
    log_info ""
    log_info "Or use the convenience script: ./docker-scripts/start-dev.sh"
}



# Main execution
main() {
    log_info "Starting dynamic port setup..."
    
    # Check if lsof is available
    if ! command -v lsof &> /dev/null; then
        log_error "lsof command not found. Please install it first."
        log_info "On macOS: brew install lsof"
        log_info "On Ubuntu/Debian: sudo apt-get install lsof"
        exit 1
    fi
    
    # Find available backend port
    local backend_port=8000
    local max_attempts=100
    
    log_info "Looking for available backend port starting from 8000..."
    
    for ((i=0; i<max_attempts; i++)); do
        if ! lsof -i :$backend_port > /dev/null 2>&1; then
            log_info "Found available backend port: $backend_port"
            break
        fi
        backend_port=$((backend_port + 1))
    done
    
    if [ $backend_port -ge $((8000 + max_attempts)) ]; then
        log_error "No available backend ports found after $max_attempts attempts"
        exit 1
    fi
    
    # Find available frontend port
    local frontend_port=3000
    log_info "Looking for available frontend port starting from 3000..."
    
    for ((i=0; i<max_attempts; i++)); do
        if ! lsof -i :$frontend_port > /dev/null 2>&1; then
            log_info "Found available frontend port: $frontend_port"
            break
        fi
        frontend_port=$((frontend_port + 1))
    done
    
    if [ $frontend_port -ge $((3000 + max_attempts)) ]; then
        log_error "No available frontend ports found after $max_attempts attempts"
        exit 1
    fi
    
    local available_backend_port=$backend_port
    local available_frontend_port=$frontend_port
    
    # Output ports for external use
    echo "BACKEND_PORT=$available_backend_port"
    echo "FRONTEND_PORT=$available_frontend_port"
    
    # Display port information
    display_port_info $available_backend_port $available_frontend_port
}

# Run main function
main "$@"
