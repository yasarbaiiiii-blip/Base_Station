
import "./i18n"; 
import { createRoot } from "react-dom/client";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import App from "./app/App.tsx";
import "./styles/index.css";

async function setupStatusBar() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch (error) {
    console.warn("StatusBar setup failed:", error);
  }
}

setupStatusBar();

createRoot(document.getElementById("root")!).render(<App />);
  
