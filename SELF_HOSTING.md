# Self-Hosting Guide — Janam Kundali Calculator

This app runs as a single Node.js process (Express) that serves both the
API and the React frontend. No paid subscriptions required.

---

## Option A — Docker (recommended, works everywhere)

### Requirements
- A VPS, cloud VM, or any Linux machine with Docker installed
- OR a free-tier host: Railway, Render, Fly.io

### 1. Copy files to your server

Upload this entire project folder to your server (via FileZilla / scp / Git).

### 2. Build and run

```bash
# Build the Docker image (takes ~2 minutes the first time)
docker compose up --build -d

# Check it started correctly
docker compose logs -f
```

Open `http://your-server-ip:3000` in a browser — the calculator should appear.

### 3. Update / redeploy

```bash
git pull          # if using git
docker compose up --build -d
```

---

## Option B — Direct Node.js (no Docker)

### Requirements
- Node.js 22+
- pnpm 9+ (`npm install -g pnpm@9`)

### Steps

```bash
# 1. Install dependencies
pnpm install --frozen-lockfile

# 2. Build the API server
pnpm --filter @workspace/api-server run build

# 3. Build the React frontend
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/kundali run build

# 4. Copy built frontend into the server's dist folder
cp -r artifacts/kundali/dist/public artifacts/api-server/dist/public

# 5. Start
PORT=3000 node --enable-source-maps artifacts/api-server/dist/index.mjs
```

The app will be live at `http://localhost:3000`.

### Keep it running (Linux VPS)

```bash
# Install pm2
npm install -g pm2

# Start with pm2
pm2 start "PORT=3000 node --enable-source-maps artifacts/api-server/dist/index.mjs" \
  --name kundali

# Auto-start on reboot
pm2 save
pm2 startup
```

---

## Option C — Free cloud hosting (no server needed)

### Railway (easiest free option)

1. Push this project to a GitHub repository
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select your repo
4. Set environment variable: `PORT=3000`
5. Railway auto-detects the Dockerfile and builds it
6. Your app gets a free `*.up.railway.app` URL

### Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, choose **Docker** as environment
4. Set `PORT=3000`
5. Free tier gives you a `*.onrender.com` URL (sleeps after 15 min inactivity)

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch (follow prompts — free tier is sufficient)
fly launch
fly deploy
```

---

## Adding a Custom Domain + HTTPS

Once your app is running on port 3000, point a domain to it using either:

- **Cloudflare Tunnel** (free, no open ports needed):
  ```bash
  cloudflared tunnel --url http://localhost:3000
  ```
- **Caddy** (automatic HTTPS):
  ```
  yourdomain.com {
    reverse_proxy localhost:3000
  }
  ```
- **Nginx + Certbot**: standard reverse proxy setup

---

## WordPress Plugin — update the URL

After deploying, go to **WordPress Admin → Settings → Janam Kundali**
and replace the old Replit URL with your new server URL.

---

## Environment variables

| Variable       | Required | Default | Description                        |
|----------------|----------|---------|------------------------------------|
| `PORT`         | Yes      | —       | Port the server listens on         |
| `NODE_ENV`     | No       | dev     | Set to `production` for live sites |
| `DATABASE_URL` | No       | —       | PostgreSQL URL (future use)        |

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `PORT not set` error | Set `PORT=3000` in your environment |
| White screen / 404 | Make sure the frontend was built and `dist/public` exists |
| Docker build fails | Run `docker compose build --no-cache` to force a fresh build |
| Can't access from browser | Check your firewall / security group allows port 3000 |
