# Node/TypeScript project configuration
NPM := $(shell which npm)
NODE := $(shell which node)
TSC := $(NPM) exec tsc

RAILWAY_CLI := $(shell command -v railway 2> /dev/null)


.PHONY: install
install:
	npm install
	@echo "Installing Railway CLI..."
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		npm install -g @railway/cli; \
	fi


.PHONY: build
build: clean
	@npm run build


.PHONY: start
start:
	@npm run start


.PHONY: clean
clean:
	@rm -rf dist


.PHONY: deploy
deploy:
	@if [ -z "$(RAILWAY_CLI)" ]; then \
		echo "Railway CLI not found. Please run 'make install' first."; \
		exit 1; \
	fi
	railway up


.PHONY: setup
setup: install build