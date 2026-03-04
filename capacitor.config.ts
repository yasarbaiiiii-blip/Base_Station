import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rtk.app",
  appName: "Base",
  webDir: "dist",

  server: {
    cleartext: true,
    androidScheme: "http"
  }
};

export default config;
