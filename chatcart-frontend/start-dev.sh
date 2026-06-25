#!/usr/bin/env bash
# ============================================================
# ChatCart — One-command development startup
# Usage: bash start-dev.sh
# ============================================================
set -e

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'

echo -e "${GREEN}"
echo "  ██████╗██╗  ██╗ █████╗ ████████╗ ██████╗ █████╗ ██████╗ ████████╗"
echo "  ██╔════╝██║  ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██╔══██╗╚══██╔══╝"
echo "  ██║     ███████║███████║   ██║   ██║     ███████║██████╔╝   ██║"
echo "  ██║     ██╔══██║██╔══██║   ██║   ██║     ██╔══██║██╔══██╗   ██║"
echo "  ╚██████╗██║  ██║██║  ██║   ██║   ╚██████╗██║  ██║██║  ██║   ██║"
echo "   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝"
echo -e "${NC}"
echo "  Buy. Sell. Rent. Book. Hire. — All through WhatsApp 🌍"
echo ""

# ── Check prerequisites ────────────────────────────────────────────────────
check_cmd() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}✗ $1 not found. Please install it first.${NC}"
    echo "  See docs/INSTALLATION.md for instructions."
    exit 1
  fi
  echo -e "${GREEN}✓ $1$(NC)"
}

echo "Checking prerequisites..."
check_cmd node
check_cmd npm
check_cmd psql
check_cmd redis-cli
echo ""

# ── Check Node version ─────────────────────────────────────────────────────
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required (found v$NODE_VER). Install: nvm install 20${NC}"
  exit 1
fi

# ── Check Redis ────────────────────────────────────────────────────────────
if ! redis-cli ping &> /dev/null; then
  echo -e "${YELLOW}⚠ Redis not running. Starting...${NC}"
  redis-server --daemonize yes 2>/dev/null || echo -e "${YELLOW}  Could not auto-start Redis. Please start it manually.${NC}"
fi

# ── Check PostgreSQL ───────────────────────────────────────────────────────
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}⚠ PostgreSQL not running. Please start it manually.${NC}"
  echo "  Ubuntu:  sudo systemctl start postgresql"
  echo "  macOS:   brew services start postgresql@16"
fi

# ── Frontend setup ─────────────────────────────────────────────────────────
echo "Setting up frontend..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${YELLOW}  Created .env from .env.example — edit it with your values.${NC}"
fi
if [ ! -d "node_modules" ]; then
  echo "  Installing frontend dependencies..."
  npm install
fi

# ── Backend setup ──────────────────────────────────────────────────────────
echo "Setting up backend..."
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo -e "${YELLOW}  Created backend/.env — edit it with your DB credentials.${NC}"
fi
if [ ! -d "backend/node_modules" ]; then
  echo "  Installing backend dependencies..."
  npm install --prefix backend
fi

# ── Database setup ─────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Database setup:${NC}"
read -p "  Run DB schema + seeds now? (y/N): " RUN_DB
if [[ "$RUN_DB" =~ ^[Yy]$ ]]; then
  source backend/.env 2>/dev/null || true
  DB="${DB_NAME:-chatcart_db}"
  echo "  Creating database '$DB' if it doesn't exist..."
  createdb "$DB" 2>/dev/null || echo "  (database already exists)"
  echo "  Loading schema..."
  psql "$DB" < database/schema.sql
  echo "  Loading seed data..."
  psql "$DB" < database/seeds.sql
  echo -e "${GREEN}  ✓ Database ready${NC}"
fi

# ── Launch ─────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}Launching ChatCart...${NC}"
echo ""
echo "  Frontend → http://localhost:5173"
echo "  Backend  → http://localhost:3001/v1"
echo "  Swagger  → http://localhost:3001/api"
echo ""
echo "  To stop: Ctrl+C"
echo ""

# Run backend and frontend in parallel
(cd backend && npm run start:dev 2>&1 | sed 's/^/[API] /') &
sleep 3
(npm run dev 2>&1 | sed 's/^/[WEB] /') &

wait
