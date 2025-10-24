#!/bin/bash

# AKCity v2.0 Health Check Script
# Comprehensive health monitoring for all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="/var/log/akcity-health.log"
ALERT_EMAIL="admin@akcity.com"

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
}

# Check Docker containers
check_containers() {
    log "Checking Docker containers..."
    
    containers=(
        "akcity-mongodb-prod"
        "akcity-redis-prod"
        "akcity-backend-prod"
        "akcity-frontend-prod"
        "akcity-nginx-prod"
    )
    
    for container in "${containers[@]}"; do
        if docker ps | grep -q "$container"; then
            status=$(docker inspect --format='{{.State.Status}}' "$container")
            if [[ "$status" == "running" ]]; then
                success "$container is running"
            else
                error "$container is not running (status: $status)"
            fi
        else
            error "$container is not found"
        fi
    done
}

# Check service endpoints
check_endpoints() {
    log "Checking service endpoints..."
    
    endpoints=(
        "http://localhost:5000/health:Backend API"
        "http://localhost:3000/health:Frontend"
        "http://localhost/health:Nginx"
        "http://localhost:9090:Prometheus"
        "http://localhost:3001:Grafana"
    )
    
    for endpoint_info in "${endpoints[@]}"; do
        IFS=':' read -r url name <<< "$endpoint_info"
        
        if curl -f -s "$url" &> /dev/null; then
            success "$name is responding"
        else
            error "$name is not responding at $url"
        fi
    done
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    # Check MongoDB
    if docker exec akcity-mongodb-prod mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        success "MongoDB is accessible"
    else
        error "MongoDB is not accessible"
    fi
    
    # Check Redis
    if docker exec akcity-redis-prod redis-cli ping &> /dev/null; then
        success "Redis is accessible"
    else
        error "Redis is not accessible"
    fi
}

# Check disk space
check_disk_space() {
    log "Checking disk space..."
    
    # Check root partition
    root_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $root_usage -gt 90 ]]; then
        error "Root partition is ${root_usage}% full"
    elif [[ $root_usage -gt 80 ]]; then
        warning "Root partition is ${root_usage}% full"
    else
        success "Root partition usage: ${root_usage}%"
    fi
    
    # Check Docker volumes
    docker_usage=$(df /var/lib/docker | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $docker_usage -gt 90 ]]; then
        error "Docker volumes are ${docker_usage}% full"
    elif [[ $docker_usage -gt 80 ]]; then
        warning "Docker volumes are ${docker_usage}% full"
    else
        success "Docker volumes usage: ${docker_usage}%"
    fi
}

# Check memory usage
check_memory() {
    log "Checking memory usage..."
    
    memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $memory_usage -gt 90 ]]; then
        error "Memory usage is ${memory_usage}%"
    elif [[ $memory_usage -gt 80 ]]; then
        warning "Memory usage is ${memory_usage}%"
    else
        success "Memory usage: ${memory_usage}%"
    fi
}

# Check SSL certificates
check_ssl() {
    log "Checking SSL certificates..."
    
    cert_file="/etc/nginx/ssl/cert.pem"
    key_file="/etc/nginx/ssl/privkey.pem"
    
    if [[ -f "$cert_file" && -f "$key_file" ]]; then
        # Check certificate expiry
        expiry_date=$(openssl x509 -in "$cert_file" -noout -enddate | cut -d= -f2)
        expiry_timestamp=$(date -d "$expiry_date" +%s)
        current_timestamp=$(date +%s)
        days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
        
        if [[ $days_until_expiry -lt 0 ]]; then
            error "SSL certificate has expired"
        elif [[ $days_until_expiry -lt 30 ]]; then
            warning "SSL certificate expires in $days_until_expiry days"
        else
            success "SSL certificate is valid for $days_until_expiry days"
        fi
    else
        error "SSL certificate files not found"
    fi
}

# Check logs for errors
check_logs() {
    log "Checking application logs for errors..."
    
    # Check backend logs
    if docker logs akcity-backend-prod --tail 100 2>&1 | grep -i error | head -5; then
        warning "Found errors in backend logs"
    else
        success "No recent errors in backend logs"
    fi
    
    # Check nginx logs
    if docker logs akcity-nginx-prod --tail 100 2>&1 | grep -i error | head -5; then
        warning "Found errors in nginx logs"
    else
        success "No recent errors in nginx logs"
    fi
}

# Check database performance
check_database_performance() {
    log "Checking database performance..."
    
    # Check MongoDB connection count
    connections=$(docker exec akcity-mongodb-prod mongosh --eval "db.serverStatus().connections.current" --quiet)
    if [[ $connections -gt 100 ]]; then
        warning "MongoDB has $connections active connections"
    else
        success "MongoDB connections: $connections"
    fi
    
    # Check Redis memory usage
    redis_memory=$(docker exec akcity-redis-prod redis-cli info memory | grep used_memory_human | cut -d: -f2 | tr -d '\r')
    success "Redis memory usage: $redis_memory"
}

# Generate health report
generate_report() {
    log "Generating health report..."
    
    report_file="/tmp/akcity-health-report-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "AKCity v2.0 Health Report"
        echo "Generated: $(date)"
        echo "=================================="
        echo ""
        echo "Docker Containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "System Resources:"
        echo "Memory: $(free -h | awk 'NR==2{print $3"/"$2}')"
        echo "Disk: $(df -h / | awk 'NR==2{print $3"/"$2" ("$5")"}')"
        echo ""
        echo "Service Status:"
        curl -s http://localhost:5000/health || echo "Backend: Not responding"
        curl -s http://localhost:3000/health || echo "Frontend: Not responding"
        curl -s http://localhost/health || echo "Nginx: Not responding"
    } > "$report_file"
    
    success "Health report generated: $report_file"
}

# Send alert (if configured)
send_alert() {
    local message="$1"
    
    if command -v mail &> /dev/null && [[ -n "$ALERT_EMAIL" ]]; then
        echo "$message" | mail -s "AKCity Health Alert" "$ALERT_EMAIL"
        log "Alert sent to $ALERT_EMAIL"
    fi
}

# Main health check function
main() {
    log "Starting AKCity v2.0 health check..."
    
    local failed_checks=0
    
    # Run all checks
    check_containers || ((failed_checks++))
    check_endpoints || ((failed_checks++))
    check_database || ((failed_checks++))
    check_disk_space || ((failed_checks++))
    check_memory || ((failed_checks++))
    check_ssl || ((failed_checks++))
    check_logs || ((failed_checks++))
    check_database_performance || ((failed_checks++))
    
    # Generate report
    generate_report
    
    # Summary
    if [[ $failed_checks -eq 0 ]]; then
        success "All health checks passed!"
        exit 0
    else
        error "$failed_checks health checks failed"
        send_alert "AKCity health check failed with $failed_checks errors. Check logs for details."
        exit 1
    fi
}

# Run main function
main "$@"
