/**
 * IP Discovery Utility
 * Scans local network for GNSS hardware on port 8000
 */

const PORT = 8000;
const HEALTH_ENDPOINT = '/api/v1/health';

/**
 * Scan a single IP address for GNSS hardware
 */
async function scanSingleIP(ip: string, timeoutMs: number = 1000): Promise<string | null> {
  const url = `http://${ip}:${PORT}${HEALTH_ENDPOINT}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      try {
        const data = await response.json();
        // Check if response looks like valid GNSS hardware
        if (data && typeof data === 'object') {
          console.log(`✅ Found GNSS hardware at ${ip}`);
          return `ws://${ip}:${PORT}/ws/status`;
        }
      } catch {
        // If we get a response, hardware is there
        return `ws://${ip}:${PORT}/ws/status`;
      }
    }
  } catch (error: any) {
    // Connection failed - this IP doesn't have hardware
  }

  return null;
}

/**
 * Deep Sweep: Scan all IPs in subnet 192.168.1.0/24
 * Returns first found hardware URL or null
 */
export async function deepSweepNetwork(): Promise<string | null> {
  console.log('🔍 Starting Deep Sweep of 192.168.1.0/24...');
  
  const ips = Array.from({ length: 253 }, (_, i) => `192.168.1.${i + 2}`);
  
  // Scan all IPs in parallel (5 at a time to avoid overwhelming network)
  const batchSize = 5;
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(ip => scanSingleIP(ip, 800))
    );

    // Return first successful result
    const found = results.find(result => result !== null);
    if (found) {
      console.log(`✅ Deep Sweep complete. Hardware found: ${found}`);
      return found;
    }
  }

  console.log('❌ Deep Sweep complete. No GNSS hardware found.');
  return null;
}

/**
 * Stealth Ping: Quick check if saved IP still has hardware
 * Returns WS URL if successful, null if timeout/failed
 */
export async function stealthPing(wsUrl: string, timeoutMs: number = 3000): Promise<string | null> {
  return new Promise((resolve) => {
    let socket: WebSocket | null = null;
    let handled = false;

    const finish = (result: string | null) => {
      if (handled) return;
      handled = true;
      if (socket) {
        try {
          socket.close();
        } catch {
          // no-op
        }
      }
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      console.log(`⏱️ Stealth Ping timed out (${timeoutMs}ms). Router may have changed IP.`);
      finish(null);
    }, timeoutMs);

    try {
      socket = new WebSocket(wsUrl);
      socket.onopen = () => {
        clearTimeout(timeoutId);
        console.log(`✅ Stealth Ping successful! Saved WebSocket is online.`);
        finish(wsUrl);
      };
      socket.onerror = () => {
        clearTimeout(timeoutId);
        console.log(`❌ Stealth Ping failed: saved WebSocket rejected.`);
        finish(null);
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.log(`❌ Stealth Ping failed: ${String(error)}`);
      finish(null);
    }
  });
}

/**
 * Manual IP connection: Validate and connect to manually entered IP
 */
export async function validateManualIP(ip: string, timeoutMs: number = 2000): Promise<string | null> {
  console.log(`🔗 Validating manual IP: ${ip}`);

  const result = await scanSingleIP(ip, timeoutMs);
  
  if (result) {
    console.log(`✅ Manual IP validated: ${ip}`);
    return result;
  }

  console.log(`❌ Manual IP validation failed: ${ip}`);
  return null;
}
