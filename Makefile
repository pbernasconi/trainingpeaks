# Node/TypeScript project configuration
NPM := $(shell which npm)
NODE := $(shell which node)
TSC := $(NPM) exec tsc

# Directories
SRC_DIR := src
DIST_DIR := dist

# Variables
RAILWAY_CLI := $(shell command -v railway 2> /dev/null)

# Default target
all: install build

.PHONY: install
install:
	@echo "Installing dependencies..."
	npm install
	@echo "Installing Railway CLI..."
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		npm install -g @railway/cli; \
	fi

.PHONY: build
build:
	@echo "Building application..."
	npm run build

.PHONY: dev
dev:
	@echo "Starting development server..."
	npm run dev

.PHONY: clean
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules

.PHONY: deploy
deploy:
	@echo "Deploying to Railway..."
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		echo "Railway CLI not found. Please run 'make install' first."; \
		exit 1; \
	fi
	railway up

.PHONY: logs
logs:
	@echo "Fetching Railway logs..."
	railway logs

.PHONY: setup
setup: install build deploy
	@echo "Setup complete!"

.PHONY: check-env
check-env:
	@echo "Checking environment variables..."
	@test -n "$$ANTHROPIC_API_KEY" || (echo "ANTHROPIC_API_KEY is not set" && exit 1)