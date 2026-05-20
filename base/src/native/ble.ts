// src/native/ble.ts
import { Capacitor } from "@capacitor/core";
import { BleClient, ScanResult } from "@capacitor-community/bluetooth-le";

export interface NativeBleDevice {
  id: string;
  name: string;
  rssi: number;
  mac: string;
}

let bleInitialized = false;
let lastConnectedDeviceId: string | null = null;

async function ensureBleInitialized() {
  if (!Capacitor.isNativePlatform()) return;
  if (bleInitialized) return;

  await BleClient.initialize();
  bleInitialized = true;
}

/**
 * Scan BLE devices
 */
export async function scanBleDevices(): Promise<NativeBleDevice[]> {
  if (!Capacitor.isNativePlatform()) return [];

  try {
    await ensureBleInitialized();

    const seen = new Map<string, NativeBleDevice>();

    await BleClient.requestLEScan({}, (result: ScanResult) => {
      const id = result.device.deviceId;
      const rssi = typeof result.rssi === "number" ? result.rssi : -999;
      const name = result.localName || result.device.name || "Unknown BLE Device";

      seen.set(id, {
        id,
        name,
        rssi,
        mac: id,
      });
    });

    await new Promise((resolve) => setTimeout(resolve, 3500));
    await BleClient.stopLEScan();

    return Array.from(seen.values()).sort((a, b) => b.rssi - a.rssi);
  } catch {
    try {
      await BleClient.stopLEScan();
    } catch {
      // no-op
    }
    return [];
  }
}

/**
 * Connect to BLE device
 */
export async function connectBle(deviceId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  await ensureBleInitialized();

  if (lastConnectedDeviceId && lastConnectedDeviceId !== deviceId) {
    try {
      await BleClient.disconnect(lastConnectedDeviceId);
    } catch {
      // Ignore stale disconnect failures
    }
  }

  await BleClient.connect(deviceId);
  lastConnectedDeviceId = deviceId;
  return true;
}
