# BorisaoBlois Universos - Development Makefile

.PHONY: help install dev build lint db-up db-down db-logs db-shell prisma-gen prisma-migrate prisma-studio clean

# Variables
DOCKER_COMPOSE = docker compose
PRISMA = npx prisma
NPM = npm

help: ## Muestra este mensaje de ayuda
	@echo 'Uso: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# --- General ---
install: ## Instala todas las dependencias del proyecto
	$(NPM) install

dev: ## Inicia la base de datos y el servidor de desarrollo de Next.js
	$(DOCKER_COMPOSE) up -d db
	$(NPM) run dev

build: ## Compila la aplicación para producción
	$(NPM) run build

lint: ## Ejecuta el linter (ESLint)
	$(NPM) run lint

# --- Docker / Database ---
db-up: ## Inicia el contenedor de la base de datos (PostgreSQL)
	$(DOCKER_COMPOSE) up -d db

db-down: ## Detiene y elimina los contenedores de la base de datos
	$(DOCKER_COMPOSE) down

db-logs: ## Muestra los logs de la base de datos en tiempo real
	$(DOCKER_COMPOSE) logs -f db

db-shell: ## Accede a la terminal de psql dentro del contenedor
	$(DOCKER_COMPOSE) exec db psql -U root -d webboris

# --- Prisma ORM ---
prisma-gen: ## Genera el cliente de Prisma (versión 7 con adaptadores)
	$(PRISMA) generate

prisma-migrate: ## Crea y aplica migraciones de base de datos
	$(PRISMA) migrate dev

prisma-studio: ## Abre la interfaz visual de Prisma Studio
	$(PRISMA) studio

# --- Maintenance ---
clean: ## Limpia los archivos de compilación y node_modules
	rm -rf .next node_modules
	@echo "Limpieza completada."
