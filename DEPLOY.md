# Deploying Subway Dashboard to Homelab

## 1. Copy to Pi

From your Mac (via Samba share or scp):
```bash
# Option A: Via Samba (if ~/homelab is shared)
cp -r /Users/maxl/Desktop/⚡️/subway_project /Volumes/homelab/subway-dashboard

# Option B: Via SCP
scp -r /Users/maxl/Desktop/⚡️/subway_project pi@192.168.1.254:~/homelab/subway-dashboard
```

## 2. Build & Run on Pi

SSH into your Pi:
```bash
ssh pi@192.168.1.254
cd ~/homelab/subway-dashboard

# Build and start
docker compose up -d --build

# Check logs
docker logs -f subway-dashboard
```

The dashboard will be available at: `http://192.168.1.254:5001`

## 3. Configure Nginx Proxy Manager

1. Go to `http://192.168.1.254:81` (NPM dashboard)
2. Click **Proxy Hosts** → **Add Proxy Host**
3. Fill in:
   - **Domain Names:** `subway.yourdomain.com` (or whatever subdomain)
   - **Scheme:** `http`
   - **Forward Hostname/IP:** `subway-dashboard` (container name)
   - **Forward Port:** `5001`
4. **SSL Tab:**
   - Request new SSL certificate
   - Force SSL: ✅
   - HTTP/2 Support: ✅

## 4. Add to Dashy

Edit your Dashy config (usually `~/homelab/dashy/conf.yml`):

```yaml
- name: Subway Dashboard
  description: Real-time NYC subway arrivals
  url: https://subway.yourdomain.com  # or http://192.168.1.254:5001 for local
  icon: fas fa-subway
  # Or use: icon: hl-mta
```

Restart Dashy:
```bash
docker compose restart dashy
```

## 5. Verify

- Local: http://192.168.1.254:5001
- Public: https://subway.yourdomain.com (after NPM setup)
- Dashy: Should show in your dashboard with clickable link

## Updating

```bash
cd ~/homelab/subway-dashboard
git pull  # if using git
docker compose up -d --build
```
