# Node/TypeScript project configuration
NPM := $(shell which npm)
NODE := $(shell which node)
TSC := $(NPM) exec tsc

# Directories
SRC_DIR := src
DIST_DIR := dist

.PHONY: install build dev clean deploy logs setup

# Variables
RAILWAY_CLI := $(shell command -v railway 2> /dev/null)

# Default target
all: install build

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Installing Railway CLI..."
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		npm install -g @railway/cli; \
	fi

# Build the application
build:
	@echo "Building application..."
	npm run build

# Run in development mode
dev:
	@echo "Starting development server..."
	npm run dev

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules

# Deploy to Railway
deploy:
	@echo "Deploying to Railway..."
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		echo "Railway CLI not found. Please run 'make install' first."; \
		exit 1; \
	fi
	railway up

# View Railway logs
logs:
	@echo "Fetching Railway logs..."
	railway logs

# Initial setup (install, build, and deploy)
setup: install build deploy
	@echo "Setup complete!"

# Check environment variables
check-env:
	@echo "Checking environment variables..."
	@test -n "$$ANTHROPIC_API_KEY" || (echo "ANTHROPIC_API_KEY is not set" && exit 1)

# Help
help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies and Railway CLI"
	@echo "  make build      - Build the application"
	@echo "  make dev        - Run in development mode"
	@echo "  make clean      - Clean build artifacts"
	@echo "  make deploy     - Deploy to Railway"
	@echo "  make logs       - View Railway logs"
	@echo "  make setup      - Complete initial setup"
	@echo "  make check-env  - Check environment variables"
	@echo "  make help       - Show this help message" 