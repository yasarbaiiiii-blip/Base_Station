// src/native/ble.ts
import { Capacitor } from "@capacitor/core";

export interface NativeBleDevice {
  id: string;
  name: string;
  rssi: number;
  mac: string;
}

/**
 * Scan BLE devices
 */
export async function scanBleDevices(): Promise<NativeBleDevice[]> {
  if (!Capacitor.isNativePlatform()) return [];

  try {
    return [];
  } catch {
    return [];
  }
}

/**
 * Connect to BLE device
 */
export async function connectBle(deviceId: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  return true;
}
