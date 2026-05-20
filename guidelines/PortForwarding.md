# Port Forwarding Guide (Testing Only)

## Simple explanation (for everyone)
Right now the app connects to the Raspberry Pi using a **local Wi-Fi IP** like `192.168.x.x`.
That works only when the phone/laptop and the Raspberry Pi are on the **same Wi-Fi**.

This guide is for **router NAT port-forwarding only** (WAN → Pi LAN). It does **not** cover
“hotspot internet sharing” (IP forwarding/NAT on the Pi).

### Before vs After (how it works)

**Before (same Wi-Fi only)**
- App -> connects to Pi using **private** address: `ws://192.168.1.50:8000/ws/status`
- Router keeps private addresses inside the Wi-Fi, so outside devices cannot reach `192.168.x.x`.

**After (with port forwarding)**
- App (from anywhere) -> connects to your router's **public** address: `ws://PUBLIC_IP:8000/ws/status`
- Router -> **forwards** that traffic to the Pi inside the Wi-Fi: `192.168.1.50:8000`
- Pi -> sends the WebSocket data back the same way (Pi -> router -> app)

Think of the router as a "gate":
- Without port forwarding, the gate blocks outside traffic to the Pi.
- With port forwarding, the gate allows a specific port to reach the Pi.

**Port forwarding** means: you change the Wi-Fi router settings so that when someone on the internet hits:

`your-public-ip:PORT`

...the router forwards that traffic to the Raspberry Pi inside the Wi-Fi:

`raspberry-local-ip:PORT`

So the app can connect from outside the Wi-Fi (mobile data, another network).

Important:
- Port forwarding is **not cloud**.
- This is **OK for testing**, but usually **not recommended for production** (security + support issues).

---

## When port forwarding works (and when it won't)

Port forwarding usually works on:
- Home/office internet with a real public IP.

Port forwarding often fails on:
- **CGNAT** internet (common on some ISPs): you don't get a real public IP.
- Corporate networks with strict firewalls.
- Networks where inbound ports are blocked.

If it doesn't work, you'll need a **tunnel/relay** approach instead (cloud/tunnel).

---

## What you need before starting

### Information to collect
- Raspberry Pi **local IP** (example `192.168.1.50`)
- Raspberry Pi backend **port** (example `8000`)
- WebSocket **path** used by your build:
  - Plain WS status feed: `/ws/status`
  - Socket.IO (if used): `/ws`
- Router admin access (username/password)
- Your public IP (or DDNS domain)

### Tools
- A phone with mobile data (to test from outside Wi-Fi)
- (Optional but recommended) a DDNS name (so you don't depend on a changing public IP)

---

## Detailed step-by-step (port forwarding)

### Step 1) Make the Raspberry Pi local IP stable
If the Pi IP keeps changing, forwarding will break.

Do one of these:
1) **Router DHCP reservation** (recommended):
   - Router settings -> DHCP/Reservations
   - Reserve an IP for the Pi's MAC address (example `192.168.1.50`)
2) **Static IP on Raspberry Pi**:
   - Set a static IP in the Pi OS network config (only do this if your team is comfortable managing it)

Verification:
- From a device on the same Wi-Fi, confirm the Pi always has the same IP after reboot.

### Step 2) Confirm the WebSocket works on the same Wi-Fi (baseline)
Before exposing anything, confirm it works locally.

Examples (choose the one that matches your setup):
- If it's the backend port `8000`: `ws://192.168.1.50:8000/ws/status`
- HTTP health check (recommended first): `http://192.168.1.50:8000/api/v1/health`

If the app can't connect locally, fix that first.

### Step 2.5) Confirm the Pi is actually listening (Pi-side check)
On the Raspberry Pi, verify the service is listening on the expected port and reachable from LAN:
- Check listening port: `ss -ltnp | grep :8000`
- Confirm it binds to LAN (good): `0.0.0.0:8000` or the Pi's LAN IP
- If you use a firewall on the Pi (UFW), allow the port: `sudo ufw allow 8000/tcp`

If you are using the GNSS FastAPI backend in this repo, make sure it binds to `0.0.0.0`
(`FASTAPI_HOST=0.0.0.0`). If it binds to `127.0.0.1`, port forwarding will not work.

### Step 3) Create the port forwarding rule in the router
In the router admin UI, find: **Port Forwarding / Virtual Server / NAT**.

Create a rule like:
- Protocol: **TCP**
- External (WAN) Port: `8000`  (what the outside world uses)
- Internal (LAN) IP: `192.168.1.50` (your Pi)
- Internal Port: `8000` (your Pi backend port)

Notes:
- Some routers ask for a port range; use `8000-8000`.
- If your ISP blocks `8000`, use a different external port (example `18000`) but still forward to `8000` internally.
- If you forward a different external port, your outside URL changes:
  - `ws://PUBLIC_IP:18000/ws/status` (router forwards to `:8000` on the Pi)

### Step 4) Get a stable "public address" (public IP or DDNS)
You need something the app can reach from anywhere.

Option A (quick): use your **public IP**
- Find it in router status or "what is my IP"
- Example: `103.xx.xx.xx`

Option B (recommended): **DDNS** (domain name)
- Example: `mybase.ddns.net`
- DDNS helps when your public IP changes.

CGNAT sanity check (common failure):
- If your router's "WAN/Internet IP" is in `10.x.x.x`, `100.64.0.0/10`, `172.16.x.x-172.31.x.x`, or `192.168.x.x`, you are likely behind CGNAT and port forwarding will not work without ISP support.

### Step 5) Test from outside the Wi-Fi (this is the real test)
1) Turn **off Wi-Fi** on your phone (use mobile data).
2) In the app, try the public address:
  - `ws://PUBLIC_IP:8000/ws/status`
  - or `ws://mybase.ddns.net:8000/ws/status`

Tip: some routers do **not** support “NAT loopback / hairpin NAT” (testing the public IP while
still on the same Wi‑Fi). Always test with Wi‑Fi off.

If it fails:
- Re-check Pi IP + router forwarding rule
- Confirm router public IP is *really* public (CGNAT check)
- Try a different external port
- Check firewall rules on Pi

---

## Strong recommendations (even for testing)

### 1) Add authentication
If you open a port to the internet, anyone can try to connect.
At minimum:
- Require a token (header or query string)
- Reject unknown clients

For this project, you can set an `API_TOKEN` env var on the Pi and then:
- HTTP API: send `X-API-Token: <token>` (or `?token=<token>` for quick tests)
- Plain WS status: `ws://PUBLIC_IP:8000/ws/status?token=<token>`
- Socket.IO: `ws://PUBLIC_IP:8000/ws?token=<token>` (client must send token)

### 2) Prefer `wss://` (TLS) instead of `ws://`
Many networks block random ports, and plain `ws://` is insecure.
The common pattern is:
- Expose `443` to the internet (HTTPS/WSS)
- Terminate TLS with **Caddy** or **Nginx**
- Proxy WebSocket traffic to your internal service on `8000`

Testing-friendly setup (conceptual):
- Router forwards WAN `443` -> Pi `443`
- Reverse proxy on Pi accepts `wss://yourdomain/...` and proxies to `http://localhost:8000`

If your app build uses Socket.IO, proxy `/ws` as a WebSocket-capable path too.

### 3) Log and rate-limit
Basic logs help debug connection issues quickly.
Rate-limit to reduce abuse.

---

## Responsibilities ("jobs") by team

### Backend / Raspberry Pi team
- Confirm backend port and WS path (example `8000` + `/ws/status`)
- Ensure the WS server binds correctly (either `0.0.0.0` for LAN access, or via reverse proxy)
- Add a simple authentication mechanism for testing (token)
- (Recommended) Add TLS using a reverse proxy (Caddy/Nginx) so the app can use `wss://`
- Provide a single "connection string" to frontend, like:
  - Local testing: `ws://192.168.1.50:8000/ws/status`
  - Outside testing: `wss://mybase.ddns.net/ws?token=XXXX`

### Frontend / App team
- Add/configure a single place to set the WS URL (environment/config)
- Support both `ws://` and `wss://`
- Add UI for:
  - entering a URL/domain
  - entering an optional token
- Improve reconnect behavior and show clear error messages (timeout vs auth vs DNS)
- Keep "LAN scanning" as optional (helpful for on-site setups), but don't depend on it

---

## Production note (why we avoid port forwarding later)
For real customers, port forwarding is painful because:
- Every router is different to configure
- Some ISPs block inbound access or use CGNAT
- It increases security risk (public exposure)

For production, the usual upgrade is:
- Cloud relay/tunnel: Pi connects outward, app connects to a public URL, no router setup.
