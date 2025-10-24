#!/bin/bash

# SSL Certificate Generation Script for AKCity v2.0
# Generates self-signed certificates for development or production

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="panel.akcity.net"
SSL_DIR="/etc/nginx/ssl"
CERT_FILE="$SSL_DIR/cert.pem"
KEY_FILE="$SSL_DIR/privkey.pem"
FULLCHAIN_FILE="$SSL_DIR/fullchain.pem"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root"
    fi
}

# Create SSL directory
create_ssl_dir() {
    log "Creating SSL directory..."
    mkdir -p "$SSL_DIR"
    chmod 700 "$SSL_DIR"
    success "SSL directory created"
}

# Generate self-signed certificate
generate_self_signed() {
    log "Generating self-signed certificate for $DOMAIN..."
    
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout "$KEY_FILE" \
        -out "$CERT_FILE" \
        -subj "/C=TR/ST=Istanbul/L=Istanbul/O=AKCity/OU=IT/CN=$DOMAIN" \
        -addext "subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN,DNS:localhost,IP:127.0.0.1"
    
    # Create fullchain (same as cert for self-signed)
    cp "$CERT_FILE" "$FULLCHAIN_FILE"
    
    # Set proper permissions
    chmod 600 "$KEY_FILE"
    chmod 644 "$CERT_FILE"
    chmod 644 "$FULLCHAIN_FILE"
    
    success "Self-signed certificate generated"
}

# Generate Let's Encrypt certificate (production)
generate_letsencrypt() {
    log "Generating Let's Encrypt certificate for $DOMAIN..."
    
    # Install certbot if not installed
    if ! command -v certbot &> /dev/null; then
        log "Installing certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Stop nginx temporarily
    systemctl stop nginx
    
    # Generate certificate
    certbot certonly --standalone \
        --email admin@akcity.com \
        --agree-tos \
        --no-eff-email \
        --domains "$DOMAIN"
    
    # Copy certificates to nginx directory
    cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" "$FULLCHAIN_FILE"
    cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" "$KEY_FILE"
    cp "/etc/letsencrypt/live/$DOMAIN/cert.pem" "$CERT_FILE"
    
    # Set proper permissions
    chmod 600 "$KEY_FILE"
    chmod 644 "$CERT_FILE"
    chmod 644 "$FULLCHAIN_FILE"
    
    # Start nginx
    systemctl start nginx
    
    success "Let's Encrypt certificate generated"
}

# Setup auto-renewal
setup_auto_renewal() {
    log "Setting up auto-renewal..."
    
    # Create renewal script
    cat > /etc/cron.daily/certbot-renew << EOF
#!/bin/bash
certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
    
    chmod +x /etc/cron.daily/certbot-renew
    
    success "Auto-renewal setup completed"
}

# Verify certificate
verify_certificate() {
    log "Verifying certificate..."
    
    if [[ -f "$CERT_FILE" && -f "$KEY_FILE" ]]; then
        # Check certificate details
        openssl x509 -in "$CERT_FILE" -text -noout | grep -E "(Subject:|DNS:|Not After)"
        success "Certificate verification completed"
    else
        error "Certificate files not found"
    fi
}

# Main function
main() {
    log "Starting SSL certificate generation for $DOMAIN..."
    
    check_root
    create_ssl_dir
    
    case "${1:-self-signed}" in
        "self-signed")
            generate_self_signed
            ;;
        "letsencrypt")
            generate_letsencrypt
            setup_auto_renewal
            ;;
        *)
            error "Invalid option. Use 'self-signed' or 'letsencrypt'"
            ;;
    esac
    
    verify_certificate
    
    success "SSL certificate generation completed!"
    log "Certificate: $CERT_FILE"
    log "Private Key: $KEY_FILE"
    log "Full Chain: $FULLCHAIN_FILE"
}

# Run main function
main "$@"
