import React, { useState } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Wifi, Bluetooth, RefreshCw, Lock, Signal, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { uiLogger } from '../../utils/uiLogger';

export const ConnectionScreen: React.FC = () => {
  const { availableWiFiNetworks, availableBLEDevices, connectToDevice, scanWiFi, scanBLE } = useGNSS();
  const [connectionMode, setConnectionMode] = useState<'wifi' | 'ble' | 'auto'>('auto');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const getSignalBars = (strength: number) => {
    if (strength > -50) return 4;
    if (strength > -60) return 3;
    if (strength > -70) return 2;
    return 1;
  };

  const handleConnect = async (type: 'wifi' | 'ble', identifier: string) => {
    if (type === 'wifi' && !password && availableWiFiNetworks.find(n => n.ssid === identifier)?.secured) {
      uiLogger.log('Connect Failed - No Password', 'ConnectionScreen', { type, identifier });
      toast.error('Please enter the network password');
      return;
    }

    setIsConnecting(true);
    uiLogger.log(`Connecting via ${type.toUpperCase()}`, 'ConnectionScreen', { 
      type, 
      identifier,
      secured: availableWiFiNetworks.find(n => n.ssid === identifier)?.secured 
    });
    
    try {
      await connectToDevice(type, identifier, password);
      uiLogger.log(`Connected Successfully via ${type.toUpperCase()}`, 'ConnectionScreen', { type, identifier });
      toast.success(`Connected via ${type.toUpperCase()}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      uiLogger.log(`Connection Failed`, 'ConnectionScreen', undefined, errorMsg);
      toast.error(`Failed to connect: ${errorMsg}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleScan = async (type: 'wifi' | 'ble') => {
    setIsScanning(true);
    uiLogger.log(`Scanning for ${type.toUpperCase()} networks`, 'ConnectionScreen', { type });
    
    if (type === 'wifi') {
      await scanWiFi();
      uiLogger.log(`WiFi Scan Complete`, 'ConnectionScreen', { networks: availableWiFiNetworks.length });
    } else {
      await scanBLE();
      uiLogger.log(`BLE Scan Complete`, 'ConnectionScreen', { devices: availableBLEDevices.length });
    }
    
    // Simulate scan duration
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            GNSS Base Station
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            U-Blox ZED-F9P RTK Configuration & Monitoring
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Connect to Base Station</CardTitle>
            <CardDescription>
              Choose your preferred connection method to establish communication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={connectionMode} onValueChange={(v) => setConnectionMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="auto" className="gap-2">
                  <RefreshCw className="size-4" />
                  Auto
                </TabsTrigger>
                <TabsTrigger value="wifi" className="gap-2">
                  <Wifi className="size-4" />
                  WiFi
                </TabsTrigger>
                <TabsTrigger value="ble" className="gap-2">
                  <Bluetooth className="size-4" />
                  BLE
                </TabsTrigger>
              </TabsList>

              <TabsContent value="auto" className="space-y-4">
                <div className="text-center py-8">
                  <RefreshCw className="size-16 mx-auto mb-4 text-blue-500 animate-spin" />
                  <h3 className="text-lg font-semibold mb-2">Auto Discovery Mode</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Attempting WiFi connection first, will fallback to BLE after 10 seconds
                  </p>
                  <Button 
                    onClick={() => handleConnect('wifi', availableWiFiNetworks[0]?.ssid)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? 'Connecting...' : 'Start Auto Connect'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="wifi" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base">Available Networks</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScan('wifi')}
                    disabled={isScanning}
                  >
                    <RefreshCw className={`size-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableWiFiNetworks.map((network) => (
                    <div
                      key={network.ssid}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedNetwork === network.ssid
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedNetwork(network.ssid)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wifi className="size-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{network.ssid}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Signal className="size-3 text-slate-500" />
                              <div className="flex gap-0.5">
                                {Array.from({ length: 4 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1 h-3 rounded-sm ${
                                      i < getSignalBars(network.signalStrength)
                                        ? 'bg-green-500'
                                        : 'bg-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500">{network.signalStrength} dBm</span>
                            </div>
                          </div>
                        </div>
                        {network.secured && <Lock className="size-4 text-slate-400" />}
                      </div>
                    </div>
                  ))}
                </div>

                {selectedNetwork && availableWiFiNetworks.find(n => n.ssid === selectedNetwork)?.secured && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter network password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => handleConnect('wifi', selectedNetwork)}
                  disabled={!selectedNetwork || isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect to Network'}
                </Button>
              </TabsContent>

              <TabsContent value="ble" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-base">Available Devices</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScan('ble')}
                    disabled={isScanning}
                  >
                    <RefreshCw className={`size-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
                    Scan
                  </Button>
                </div>

                {isScanning && (
                  <div className="text-center py-4">
                    <Bluetooth className="size-12 mx-auto mb-2 text-blue-500 animate-pulse" />
                    <p className="text-sm text-slate-600">Scanning for BLE devices...</p>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableBLEDevices.map((device) => (
                    <div
                      key={device.id}
                      className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 cursor-pointer transition-all"
                      onClick={() => handleConnect('ble', device.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Bluetooth className="size-5 text-blue-500" />
                          <div>
                            <p className="font-medium">{device.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">MAC: ...{device.mac}</span>
                              <Badge variant="outline" className="text-xs">
                                {device.rssi} dBm
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 h-3 rounded-sm ${
                                i < getSignalBars(device.rssi)
                                  ? 'bg-blue-500'
                                  : 'bg-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>Default connection priority: WiFi → BLE (after 10s timeout)</p>
        </div>
      </div>
    </div>
  );
};
