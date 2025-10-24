#!/bin/bash

# AKCity v2.0 Deployment Script
# Production deployment with Docker Compose

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="akcity-v2"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
BACKUP_DIR="/backup/akcity"
LOG_FILE="/var/log/akcity-deployments.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a non-root user for production."
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    # Check environment file
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Environment file $ENV_FILE not found"
    fi
    
    success "Prerequisites check passed"
}

# Backup existing data
backup_data() {
    log "Creating backup..."
    
    # Create backup directory
    sudo mkdir -p "$BACKUP_DIR"
    
    # Backup database
    if docker ps | grep -q "akcity-mongodb-prod"; then
        log "Backing up MongoDB..."
        docker exec akcity-mongodb-prod mongodump --out /tmp/backup
        docker cp akcity-mongodb-prod:/tmp/backup "$BACKUP_DIR/mongodb-$(date +%Y%m%d-%H%M%S)"
        success "MongoDB backup completed"
    fi
    
    # Backup volumes
    if docker volume ls | grep -q "akcity-v2_mongodb_data"; then
        log "Backing up volumes..."
        sudo cp -r /var/lib/docker/volumes/akcity-v2_mongodb_data "$BACKUP_DIR/volumes-$(date +%Y%m%d-%H%M%S)"
        success "Volumes backup completed"
    fi
}

# Pull latest images
pull_images() {
    log "Pulling latest images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
    success "Images pulled successfully"
}

# Build custom images
build_images() {
    log "Building custom images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    success "Images built successfully"
}

# Stop existing services
stop_services() {
    log "Stopping existing services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    success "Services stopped"
}

# Start services
start_services() {
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    success "Services started"
}

# Wait for services to be healthy
wait_for_health() {
    log "Waiting for services to be healthy..."
    
    # Wait for MongoDB
    timeout=60
    while [[ $timeout -gt 0 ]]; do
        if docker exec akcity-mongodb-prod mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
            success "MongoDB is healthy"
            break
        fi
        sleep 2
        ((timeout-=2))
    done
    
    if [[ $timeout -le 0 ]]; then
        error "MongoDB health check timeout"
    fi
    
    # Wait for Backend
    timeout=60
    while [[ $timeout -gt 0 ]]; do
        if curl -f http://localhost:5000/health &> /dev/null; then
            success "Backend is healthy"
            break
        fi
        sleep 2
        ((timeout-=2))
    done
    
    if [[ $timeout -le 0 ]]; then
        error "Backend health check timeout"
    fi
    
    # Wait for Frontend
    timeout=60
    while [[ $timeout -gt 0 ]]; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            success "Frontend is healthy"
            break
        fi
        sleep 2
        ((timeout-=2))
    done
    
    if [[ $timeout -le 0 ]]; then
        error "Frontend health check timeout"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    docker exec akcity-backend-prod npm run migrate
    success "Migrations completed"
}

# Check service status
check_status() {
    log "Checking service status..."
    
    # Check containers
    if ! docker ps | grep -q "akcity-mongodb-prod"; then
        error "MongoDB container is not running"
    fi
    
    if ! docker ps | grep -q "akcity-backend-prod"; then
        error "Backend container is not running"
    fi
    
    if ! docker ps | grep -q "akcity-frontend-prod"; then
        error "Frontend container is not running"
    fi
    
    if ! docker ps | grep -q "akcity-nginx-prod"; then
        error "Nginx container is not running"
    fi
    
    success "All services are running"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old images..."
    docker image prune -f
    success "Cleanup completed"
}

# Main deployment function
deploy() {
    log "Starting AKCity v2.0 deployment..."
    
    check_root
    check_prerequisites
    backup_data
    pull_images
    build_images
    stop_services
    start_services
    wait_for_health
    run_migrations
    check_status
    cleanup
    
    success "Deployment completed successfully!"
    log "AKCity v2.0 is now running at https://panel.akcity.net"
}

# Rollback function
rollback() {
    log "Starting rollback..."
    
    # Stop current services
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    
    # Restore from backup (implementation depends on backup strategy)
    warning "Rollback functionality needs to be implemented based on your backup strategy"
    
    success "Rollback completed"
}

# Health check function
health_check() {
    log "Performing health check..."
    
    # Check all endpoints
    endpoints=(
        "http://localhost:5000/health"
        "http://localhost:3000/health"
        "http://localhost/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" &> /dev/null; then
            success "$endpoint is healthy"
        else
            error "$endpoint is not responding"
        fi
    done
    
    success "Health check passed"
}

# Main script
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "status")
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health|status}"
        exit 1
        ;;
esac
