import React from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { 
  Settings, 
  Bell, 
  Wifi, 
  Database, 
  Info, 
  Trash2,
  ExternalLink,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, gnssStatus } = useGNSS();
  const { i18n } = useTranslation();

  const handleClearCache = () => {
    toast.success('Cache cleared successfully');
  };

  const handleResetSettings = () => {
    toast.success('Settings reset to defaults');
  };

  const handleClearWiFiPasswords = () => {
    toast.success('WiFi passwords cleared');
  };

  const handleClearBLEData = () => {
    toast.success('BLE pairing data cleared');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          App-level configuration and system information
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="size-5 text-blue-500" />
              General Settings
            </CardTitle>
            <CardDescription>Customize app behavior and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Units */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Units</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="distance-unit">Distance</Label>
                  <Select
                    value={settings.units.distance}
                    onValueChange={(value: 'meters' | 'feet') =>
                      updateSettings({
                        units: { ...settings.units, distance: value },
                      })
                    }
                  >
                    <SelectTrigger id="distance-unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meters">Meters</SelectItem>
                      <SelectItem value="feet">Feet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="coordinate-format">Coordinates</Label>
                  <Select
                    value={settings.units.coordinates}
                    onValueChange={(value: 'DD' | 'DMS' | 'UTM') =>
                      updateSettings({
                        units: { ...settings.units, coordinates: value },
                      })
                    }
                  >
                    <SelectTrigger id="coordinate-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD">Decimal Degrees (DD)</SelectItem>
                      <SelectItem value="DMS">Degrees Minutes Seconds (DMS)</SelectItem>
                      <SelectItem value="UTM">Universal Transverse Mercator (UTM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Theme */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Sun className="size-4" />
                Theme
              </h3>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') =>
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="size-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="size-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Settings className="size-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Language */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="size-4" />
                Language
              </h3>
              <Select 
                value={settings.language} 
                onValueChange={(value) => {
                  updateSettings({ language: value });
                  i18n.changeLanguage(value);
                  toast.success(`Language changed to ${value === 'en' ? 'English' : value === 'ta' ? 'Tamil' : 'Hindi'}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                  <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="size-5 text-blue-500" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="notif-survey">Survey Completion</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Notify when survey completes successfully
                </p>
              </div>
              <Switch
                id="notif-survey"
                checked={settings.notifications.surveyCompletion}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, surveyCompletion: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="notif-connection">Connection Loss</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Alert when connection to base station is lost
                </p>
              </div>
              <Switch
                id="notif-connection"
                checked={settings.notifications.connectionLoss}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, connectionLoss: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="notif-accuracy">Low Accuracy Warning</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Warn when position accuracy degrades
                </p>
              </div>
              <Switch
                id="notif-accuracy"
                checked={settings.notifications.lowAccuracy}
                onCheckedChange={(checked) =>
                  updateSettings({
                    notifications: { ...settings.notifications, lowAccuracy: checked },
                  })
                }
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Label htmlFor="notif-sound">Sound</Label>
                <Switch
                  id="notif-sound"
                  checked={settings.notifications.sound}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, sound: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Label htmlFor="notif-vibration">Vibration</Label>
                <Switch
                  id="notif-vibration"
                  checked={settings.notifications.vibration}
                  onCheckedChange={(checked) =>
                    updateSettings({
                      notifications: { ...settings.notifications, vibration: checked },
                    })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="size-5 text-blue-500" />
              Connection Preferences
            </CardTitle>
            <CardDescription>Manage connection behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="connection-method">Preferred Connection Method</Label>
              <Select
                value={settings.connection.preferredMethod}
                onValueChange={(value: 'wifi' | 'ble' | 'auto') =>
                  updateSettings({
                    connection: { ...settings.connection, preferredMethod: value },
                  })
                }
              >
                <SelectTrigger id="connection-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (WiFi → BLE)</SelectItem>
                  <SelectItem value="wifi">Always WiFi</SelectItem>
                  <SelectItem value="ble">Always BLE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="auto-reconnect">Auto-reconnect</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Automatically reconnect on disconnect
                </p>
              </div>
              <Switch
                id="auto-reconnect"
                checked={settings.connection.autoReconnect}
                onCheckedChange={(checked) =>
                  updateSettings({
                    connection: { ...settings.connection, autoReconnect: checked },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
              <Select
                value={settings.connection.timeout.toString()}
                onValueChange={(value) =>
                  updateSettings({
                    connection: { ...settings.connection, timeout: parseInt(value) },
                  })
                }
              >
                <SelectTrigger id="timeout">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="20">20 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">60 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="keep-awake">Keep Screen Awake</Label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Prevent screen from turning off during survey
                </p>
              </div>
              <Switch
                id="keep-awake"
                checked={settings.connection.keepScreenAwake}
                onCheckedChange={(checked) =>
                  updateSettings({
                    connection: { ...settings.connection, keepScreenAwake: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 text-blue-500" />
              Data Management
            </CardTitle>
            <CardDescription>Clear cached data and reset settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Trash2 className="size-4" />
                  Clear App Cache
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear App Cache?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear temporary files and cached data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearCache}>Clear Cache</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Settings className="size-4" />
                  Reset All Settings
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all application settings to their default values. Configuration data will be preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetSettings}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Wifi className="size-4" />
                  Clear Saved WiFi Passwords
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear WiFi Passwords?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all saved WiFi network passwords. You will need to re-enter them on next connection.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearWiFiPasswords}>Clear Passwords</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Wifi className="size-4" />
                  Clear BLE Pairing Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear BLE Pairing Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all Bluetooth pairing information. You will need to re-pair devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearBLEData}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="size-5 text-blue-500" />
              About
            </CardTitle>
            <CardDescription>Version information and support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">App Version</span>
                <Badge variant="outline">1.0.0</Badge>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">Backend Server</span>
                <Badge variant="outline">v2.1.0</Badge>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="text-sm text-slate-600 dark:text-slate-400">ZED-F9P Firmware</span>
                <Badge variant="outline">{gnssStatus.firmwareVersion}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="size-4" />
                Check for Updates
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="size-4" />
                Help Documentation
              </Button>

              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="size-4" />
                Contact Support
              </Button>
            </div>

            <div className="pt-4 text-center text-xs text-slate-600 dark:text-slate-400">
              <p>U-Blox ZED-F9P RTK Base Station</p>
              <p className="mt-1">© 2026 GNSS Solutions. All rights reserved.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
