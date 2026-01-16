#!/bin/bash

REMOTE_USER="root"
REMOTE_HOST="103.132.96.118"
REMOTE_DIR="/var/www/next-frontend"
LOCAL_DIR="/Users/mdkaifibnzaman/IdeaProjects/bulk-buy-sell-management"

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

build_frontend() {
    log "Building Next.js frontend..."
    cd "$LOCAL_DIR" || error "Cannot access frontend dir"

    if [ -f "yarn.lock" ]; then
        yarn install || error "Yarn install failed"
        yarn build || error "Build failed"
    else
        npm install || error "NPM install failed"
        npm run build || error "Build failed"
    fi

    success "Frontend build complete"
}

upload_files() {
    log "Uploading frontend files..."
    rsync -avz --delete \
      --exclude node_modules \
      --exclude .git \
      "$LOCAL_DIR/" \
      "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/" || error "Upload failed"

    success "Frontend uploaded"
}

deploy_server() {
    log "Running server-side deploy..."
    ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR && chmod +x server-deploy.sh && ./server-deploy.sh"
}

build_frontend
upload_files
deploy_server

success "Frontend deployed successfully 🚀"

