/**
 * ============================================
 * Live Terminal Logger for UI Actions
 * ============================================
 * Streams all UI actions to terminal in real-time
 * Logs are sent via HTTP POST to a Node.js server
 */

// Configuration
const LOGGER_SERVER = "http://localhost:3001";
const LOG_BUFFER_SIZE = 100;

interface UILogEntry {
  timestamp: string;
  action: string;
  component: string;
  data?: unknown;
  duration?: number;
  error?: string;
}

class LiveTerminalLogger {
  private logBuffer: UILogEntry[] = [];
  private serverConnected = false;

  constructor() {
    this.initializeServer();
  }

  /**
   * Initialize logging server
   */
  private async initializeServer() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);
      
      const response = await fetch(`${LOGGER_SERVER}/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (response.ok) {
        this.serverConnected = true;
      }
    } catch (error) {
      // Terminal logger server not running (optional) - silently ignore
    }
  }

  /**
   * Log an action
   */
  log(
    action: string,
    component: string,
    data?: unknown,
    error?: string,
    duration?: number
  ) {
    const entry: UILogEntry = {
      timestamp: new Date().toISOString(),
      action,
      component,
      data,
      error,
      duration,
    };

    this.logBuffer.push(entry);

    // Print to console
    this.printToConsole(entry);

    // Send to server if available
    if (this.serverConnected) {
      this.sendToServer(entry);
    }

    // Keep buffer size manageable
    if (this.logBuffer.length > LOG_BUFFER_SIZE) {
      this.logBuffer.shift();
    }
  }

  /**
   * Print action to console
   */
  private printToConsole(entry: UILogEntry) {
    const icon = entry.error ? "❌" : "✨";
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();

    if (entry.error) {
      console.error(
        `${icon} [${timestamp}] {${entry.component}} ${entry.action}: ${entry.error}`
      );
    } else {
      console.log(
        `${icon} [${timestamp}] {${entry.component}} ${entry.action}`
      );
    }

    if (entry.duration) {
      // Duration logged
    }
    if (entry.data) {
      // Data logged
    }
  }

  /**
   * Send log to server
   */
  private async sendToServer(entry: UILogEntry) {
    try {
      await fetch(`${LOGGER_SERVER}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Silently fail - server might have restarted
    }
  }

  /**
   * Get all logs
   */
  getLogs(): UILogEntry[] {
    return [...this.logBuffer];
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logBuffer = [];
  }
}

// Singleton instance
export const uiLogger = new LiveTerminalLogger();

// Make globally available in browser
if (typeof window !== "undefined") {
  (window as any).uiLogger = uiLogger;
}
