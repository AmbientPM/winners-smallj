#!/bin/bash

# ===========================================
# 🚀 NWO Silver Ounce - Remote Deploy Script
# ===========================================
# Запускай с локального ПК для деплоя на удалённый сервер
# Настрой deploy.config перед запуском!
# Теперь с поддержкой Nginx + SSL!

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/deploy.config"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Banner
echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    🚀 NWO Silver Ounce - Remote Deploy Script      ║${NC}"
echo -e "${BLUE}║         with Nginx + SSL Support                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"
echo ""

# Check config file
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Config file not found: $CONFIG_FILE${NC}"
    echo -e "${YELLOW}Please create deploy.config from deploy.config.example${NC}"
    exit 1
fi

# Load config
echo -e "${YELLOW}📋 Loading config...${NC}"
source "$CONFIG_FILE"

# Validate config
if [ "$SERVER_HOST" == "your-server-ip" ] || [ -z "$SERVER_HOST" ]; then
    echo -e "${RED}❌ Please configure SERVER_HOST in deploy.config${NC}"
    exit 1
fi

if [ "$DOMAIN" == "your-domain.com" ] || [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}⚠️  Domain not configured. Will use IP address only (no SSL).${NC}"
    ENABLE_SSL="false"
fi

echo -e "${CYAN}📡 Server: ${SERVER_USER}@${SERVER_HOST}:${SERVER_PORT}${NC}"
echo -e "${CYAN}📁 Remote dir: ${REMOTE_DIR}${NC}"
echo -e "${CYAN}🌐 Domain: ${DOMAIN}${NC}"
echo -e "${CYAN}🔒 SSL: ${ENABLE_SSL}${NC}"
echo ""

# SSH command builder
if [ -n "$SERVER_PASSWORD" ]; then
    # Check if sshpass is installed
    if ! command -v sshpass &> /dev/null; then
        echo -e "${RED}❌ sshpass is not installed. Install it:${NC}"
        echo -e "${YELLOW}   macOS: brew install hudochenkov/sshpass/sshpass${NC}"
        echo -e "${YELLOW}   Linux: apt install sshpass${NC}"
        echo -e "${YELLOW}   Or use SSH key instead (recommended)${NC}"
        exit 1
    fi
    SSH_CMD="sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no -p $SERVER_PORT"
    SCP_CMD="sshpass -p '$SERVER_PASSWORD' scp -o StrictHostKeyChecking=no -P $SERVER_PORT"
else
    SSH_CMD="ssh -p $SERVER_PORT"
    SCP_CMD="scp -P $SERVER_PORT"
fi

SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"

# Function to run remote command
remote_exec() {
    eval "$SSH_CMD $SSH_TARGET \"$1\""
}

# ===========================================
# Step 1: Test connection
# ===========================================
echo -e "${YELLOW}🔌 Testing SSH connection...${NC}"
if ! remote_exec "echo 'Connection successful'" &>/dev/null; then
    echo -e "${RED}❌ Cannot connect to server. Check your credentials.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Connection successful!${NC}"
echo ""

# ===========================================
# Step 2: Install Docker if needed
# ===========================================
echo -e "${YELLOW}🐳 Checking Docker on server...${NC}"
remote_exec "
    if ! command -v docker &> /dev/null; then
        echo 'Installing Docker...'
        curl -fsSL https://get.docker.com | sh
        systemctl enable docker
        systemctl start docker
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo 'Installing Docker Compose...'
        curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    fi
    
    docker --version
    docker-compose --version
"
echo -e "${GREEN}✅ Docker ready!${NC}"
echo ""

# ===========================================
# Step 3: Create remote directory and upload files
# ===========================================
echo -e "${YELLOW}📤 Uploading project files...${NC}"

# Create remote directories
remote_exec "mkdir -p $REMOTE_DIR/nginx $REMOTE_DIR/certbot/conf $REMOTE_DIR/certbot/www $REMOTE_DIR/client/out"

# Files to upload
FILES_TO_UPLOAD=(
    "Dockerfile"
    "docker-compose.yml"
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "tsconfig.build.json"
    "nest-cli.json"
)

# Upload main files
for file in "${FILES_TO_UPLOAD[@]}"; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        echo -e "   📄 Uploading $file..."
        eval "$SCP_CMD \"$SCRIPT_DIR/$file\" \"$SSH_TARGET:$REMOTE_DIR/\""
    fi
done

# Upload directories
echo -e "   📁 Uploading src/..."
eval "$SCP_CMD -r \"$SCRIPT_DIR/src\" \"$SSH_TARGET:$REMOTE_DIR/\""

echo -e "   📁 Uploading prisma/..."
eval "$SCP_CMD -r \"$SCRIPT_DIR/prisma\" \"$SSH_TARGET:$REMOTE_DIR/\""

# Upload nginx config
echo -e "   📁 Uploading nginx config..."
if [ "$ENABLE_SSL" == "true" ]; then
    eval "$SCP_CMD \"$SCRIPT_DIR/nginx/nginx.conf\" \"$SSH_TARGET:$REMOTE_DIR/nginx/nginx.conf\""
else
    eval "$SCP_CMD \"$SCRIPT_DIR/nginx/nginx-nossl.conf\" \"$SSH_TARGET:$REMOTE_DIR/nginx/nginx.conf\""
fi

# Upload client/out if exists
if [ -d "$SCRIPT_DIR/../client/out" ]; then
    echo -e "   📁 Uploading client/out/..."
    eval "$SCP_CMD -r \"$SCRIPT_DIR/../client/out/\"* \"$SSH_TARGET:$REMOTE_DIR/client/out/\""
else
    echo -e "${YELLOW}   ⚠️  client/out not found. Run 'npm run build' in client first.${NC}"
fi

echo -e "${GREEN}✅ Files uploaded!${NC}"
echo ""

# ===========================================
# Step 4: Create .env file on server
# ===========================================
echo -e "${YELLOW}📝 Creating .env on server...${NC}"
remote_exec "cat > $REMOTE_DIR/.env << 'ENVEOF'
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?schema=public
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
DB_PORT=${DB_PORT}
PORT=${APP_PORT}
BOT_TOKEN=${BOT_TOKEN}
ADMIN_IDS=${ADMIN_IDS}
APP_URL=${APP_URL}
TIMEZONE=${TIMEZONE}
IS_DEV=${IS_DEV}
TESTNET=${TESTNET}
STELLAR_NETWORK=${STELLAR_NETWORK}
DOMAIN=${DOMAIN}
ENVEOF"
echo -e "${GREEN}✅ .env created!${NC}"
echo ""

# ===========================================
# Step 5: SSL Certificate Setup (if enabled)
# ===========================================
if [ "$ENABLE_SSL" == "true" ]; then
    echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
    
    # Check if certificate already exists
    CERT_EXISTS=$(remote_exec "[ -d $REMOTE_DIR/certbot/conf/live/$DOMAIN ] && echo 'yes' || echo 'no'" 2>/dev/null || echo "no")
    
    if [ "$CERT_EXISTS" != "yes" ]; then
        echo -e "${CYAN}   📜 Obtaining new SSL certificate...${NC}"
        
        # First start with no-ssl config to get certificate
        remote_exec "
            cd $REMOTE_DIR
            
            # Create temporary nginx config for certificate verification
            cat > nginx/nginx.conf << 'NGINXTEMP'
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
NGINXTEMP
            
            # Start postgres, server and nginx for certificate verification
            docker-compose up -d postgres server nginx
            sleep 10
            
            # Get certificate
            docker run --rm \\
                -v $REMOTE_DIR/certbot/conf:/etc/letsencrypt \\
                -v $REMOTE_DIR/certbot/www:/var/www/certbot \\
                certbot/certbot certonly --webroot \\
                --webroot-path=/var/www/certbot \\
                --email $SSL_EMAIL \\
                --agree-tos \\
                --no-eff-email \\
                -d $DOMAIN
        "
        
        # Upload SSL nginx config
        echo -e "${CYAN}   📄 Uploading SSL nginx config...${NC}"
        eval "$SCP_CMD \"$SCRIPT_DIR/nginx/nginx.conf\" \"$SSH_TARGET:$REMOTE_DIR/nginx/nginx.conf\""
        
        echo -e "${GREEN}   ✅ SSL certificate obtained!${NC}"
    else
        echo -e "${GREEN}   ✅ SSL certificate already exists!${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipping SSL setup (disabled in config)${NC}"
fi
echo ""

# ===========================================
# Step 6: Build and start
# ===========================================
echo -e "${YELLOW}🔨 Building and starting containers on server...${NC}"
remote_exec "
    cd $REMOTE_DIR
    
    echo '🛑 Stopping existing containers...'
    docker-compose down 2>/dev/null || true
    
    echo '🔨 Building...'
    docker-compose up -d --build
    
    echo '⏳ Waiting for services...'
    sleep 15
    
    echo '📦 Running migrations...'
    docker-compose exec -T server npx prisma db push 2>/dev/null || echo 'Migration skipped'
    
    echo '🌱 Seeding database...'
    docker-compose exec -T server npx prisma db seed 2>/dev/null || echo 'Seed skipped'
    
    echo ''
    echo '📊 Container status:'
    docker-compose ps
"
echo -e "${GREEN}✅ Containers started!${NC}"
echo ""

# ===========================================
# Final Output
# ===========================================
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                       ✅ DEPLOY COMPLETE!                            ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"

if [ "$ENABLE_SSL" == "true" ]; then
    echo -e "${GREEN}║  🌐 Application URL:                                                 ║${NC}"
    echo -e "${GREEN}║     ${MAGENTA}https://${DOMAIN}${GREEN}                                              ${NC}"
else
    echo -e "${GREEN}║  🌐 Application URL:                                                 ║${NC}"
    echo -e "${GREEN}║     ${MAGENTA}http://${SERVER_HOST}${GREEN}                                                ${NC}"
fi

echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${GREEN}║  🔌 API Endpoint:                                                    ║${NC}"

if [ "$ENABLE_SSL" == "true" ]; then
    echo -e "${GREEN}║     ${CYAN}https://${DOMAIN}/api/${GREEN}                                         ${NC}"
else
    echo -e "${GREEN}║     ${CYAN}http://${SERVER_HOST}/api/${GREEN}                                           ${NC}"
fi

echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${GREEN}║  🗄️  Database Connection:                                            ║${NC}"
echo -e "${GREEN}║     postgresql://${DB_USER}:****@${SERVER_HOST}:${DB_PORT}/${DB_NAME}              ${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  📝 Useful Commands:                                                 ║${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${YELLOW}║  View logs:                                                          ║${NC}"
echo -e "${CYAN}║     ssh ${SSH_TARGET} 'cd ${REMOTE_DIR} && docker-compose logs -f'   ${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${YELLOW}║  Restart services:                                                   ║${NC}"
echo -e "${CYAN}║     ssh ${SSH_TARGET} 'cd ${REMOTE_DIR} && docker-compose restart'   ${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"
echo -e "${YELLOW}║  Stop services:                                                      ║${NC}"
echo -e "${CYAN}║     ssh ${SSH_TARGET} 'cd ${REMOTE_DIR} && docker-compose down'      ${NC}"
echo -e "${GREEN}║                                                                      ║${NC}"

if [ "$ENABLE_SSL" == "true" ]; then
    echo -e "${YELLOW}║  Renew SSL certificate:                                             ║${NC}"
    echo -e "${CYAN}║     ssh ${SSH_TARGET} 'cd ${REMOTE_DIR} && docker-compose exec certbot certbot renew'${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
fi

echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"

# ===========================================
# Post-deploy checks
# ===========================================
echo ""
echo -e "${YELLOW}🔍 Running post-deploy checks...${NC}"

# Check if services are running
SERVICES_OK=$(remote_exec "cd $REMOTE_DIR && docker-compose ps --services --filter 'status=running' | wc -l" 2>/dev/null || echo "0")
if [ "$SERVICES_OK" -ge 3 ]; then
    echo -e "${GREEN}✅ All services are running!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may still be starting. Check logs with:${NC}"
    echo -e "${CYAN}   ssh ${SSH_TARGET} 'cd ${REMOTE_DIR} && docker-compose logs'${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment finished! Your app should be live now.${NC}"
