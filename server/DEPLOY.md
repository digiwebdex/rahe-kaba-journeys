// VPS Deployment Guide - Rahe Kaba ERP
// ======================================

## Quick Start

### 1. Setup PostgreSQL on VPS

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql << 'SQL'
CREATE USER rahekaba WITH PASSWORD 'your_strong_password';
CREATE DATABASE rahekaba OWNER rahekaba;
GRANT ALL PRIVILEGES ON DATABASE rahekaba TO rahekaba;
SQL

# Run schema
cd /var/www/rahe-kaba-journeys-72ccca69/server
sudo -u postgres psql -d rahekaba -f schema.sql
```

### 2. Setup Node.js Backend

```bash
cd /var/www/rahe-kaba-journeys-72ccca69/server

# Create .env from example
cp .env.example .env
nano .env  # Edit with your actual values

# Install dependencies
npm install

# Create uploads directory
mkdir -p uploads

# Test it works
node index.js
```

### 3. Update Frontend Build

```bash
cd /var/www/rahe-kaba-journeys-72ccca69

# Add API URL to .env
echo 'VITE_API_URL=/api' >> .env

# Rebuild frontend
npm run build
```

### 4. Update Nginx Config

```bash
sudo tee /etc/nginx/sites-available/rahekaba << 'NGINX'
server {
    listen 80;
    server_name rahekabatravels.com www.rahekabatravels.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name rahekabatravels.com www.rahekabatravels.com;

    ssl_certificate /etc/letsencrypt/live/rahekabatravels.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rahekabatravels.com/privkey.pem;

    client_max_body_size 10M;

    # API proxy to Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads/ {
        alias /var/www/rahe-kaba-journeys-72ccca69/server/uploads/;
    }

    # Frontend (static files)
    location / {
        root /var/www/rahe-kaba-journeys-72ccca69/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX

sudo nginx -t && sudo systemctl restart nginx
```

### 5. Keep Backend Running with PM2

```bash
sudo npm install -g pm2

cd /var/www/rahe-kaba-journeys-72ccca69/server
pm2 start index.js --name "rahekaba-api"
pm2 save
pm2 startup  # Follow the instructions to auto-start on reboot
```

### 6. Data Migration

Export data from Lovable Cloud and import to your PostgreSQL:
- Use the site-backup feature in Admin Settings to export all data as JSON
- Then write import scripts or use pg_dump/pg_restore

### Default Login
- Email: admin@rahekaba.com
- Password: Admin@123456 (CHANGE THIS IMMEDIATELY)

## Architecture

```
Browser → Nginx (443)
            ├── /api/* → Node.js (3001) → PostgreSQL
            ├── /uploads/* → Static files
            └── /* → dist/index.html (React SPA)
```
