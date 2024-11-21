# Node/TypeScript project configuration
NPM := $(shell which npm)
NODE := $(shell which node)
TSC := $(NPM) exec tsc

# Directories
SRC_DIR := src
DIST_DIR := dist

.PHONY: all clean install dev build test lint

# Default target
all: clean install build

# Install dependencies
install:
	$(NPM) install

# Run development server
dev:
	$(NPM) run dev

# Build the project
build:
	$(NPM) run build

# Run tests
test:
	$(NPM) test

# Clean build artifacts
clean:
	rm -rf $(DIST_DIR)
	rm -rf node_modules
	rm -f package-lock.json

# Lint the code
lint:
	$(NPM) run lint

# Type check
type-check:
	$(TSC) --noEmit

# Start production server
start:
	$(NPM) start 