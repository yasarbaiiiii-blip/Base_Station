// import React from 'react';
// import { useGNSS } from '../../context/GNSSContext';
// import { useTranslation } from 'react-i18next';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Label } from './ui/label';
// import { Switch } from './ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
// import { Separator } from './ui/separator';
// import { Badge } from './ui/badge';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
// import { 
//   Settings, 
//   Bell, 
//   Wifi, 
//   Database, 
//   Info, 
//   Trash2,
//   ExternalLink,
//   Moon,
//   Sun,
//   Globe
// } from 'lucide-react';
// import { toast } from 'sonner';

// export const SettingsScreen: React.FC = () => {
//   const { settings, updateSettings, gnssStatus } = useGNSS();
//   const { i18n } = useTranslation();

//   const handleClearCache = () => {
//     toast.success('Cache cleared successfully');
//   };

//   const handleResetSettings = () => {
//     toast.success('Settings reset to defaults');
//   };

//   const handleClearWiFiPasswords = () => {
//     toast.success('WiFi passwords cleared');
//   };

//   const handleClearBLEData = () => {
//     toast.success('BLE pairing data cleared');
//   };

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold mb-2">Settings</h1>
//         <p className="text-slate-600 dark:text-slate-400">
//           App-level configuration and system information
//         </p>
//       </div>

//       <div className="space-y-6">
//         {/* General Settings */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Settings className="size-5 text-blue-500" />
//               General Settings
//             </CardTitle>
//             <CardDescription>Customize app behavior and appearance</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             {/* Units */}
//             <div className="space-y-4">
//               <h3 className="font-semibold text-sm">Units</h3>
//               <div className="grid md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="distance-unit">Distance</Label>
//                   <Select
//                     value={settings.units.distance}
//                     onValueChange={(value: 'meters' | 'feet') =>
//                       updateSettings({
//                         units: { ...settings.units, distance: value },
//                       })
//                     }
//                   >
//                     <SelectTrigger id="distance-unit">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="meters">Meters</SelectItem>
//                       <SelectItem value="feet">Feet</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="coordinate-format">Coordinates</Label>
//                   <Select
//                     value={settings.units.coordinates}
//                     onValueChange={(value: 'DD' | 'DMS' | 'UTM') =>
//                       updateSettings({
//                         units: { ...settings.units, coordinates: value },
//                       })
//                     }
//                   >
//                     <SelectTrigger id="coordinate-format">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="DD">Decimal Degrees (DD)</SelectItem>
//                       <SelectItem value="DMS">Degrees Minutes Seconds (DMS)</SelectItem>
//                       <SelectItem value="UTM">Universal Transverse Mercator (UTM)</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>
//             </div>

//             <Separator />

//             {/* Theme */}
//             <div className="space-y-3">
//               <h3 className="font-semibold text-sm flex items-center gap-2">
//                 <Sun className="size-4" />
//                 Theme
//               </h3>
//               <Select
//                 value={settings.theme}
//                 onValueChange={(value: 'light' | 'dark' | 'system') =>
//                   updateSettings({ theme: value })
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="light">
//                     <div className="flex items-center gap-2">
//                       <Sun className="size-4" />
//                       Light
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="dark">
//                     <div className="flex items-center gap-2">
//                       <Moon className="size-4" />
//                       Dark
//                     </div>
//                   </SelectItem>
//                   <SelectItem value="system">
//                     <div className="flex items-center gap-2">
//                       <Settings className="size-4" />
//                       System
//                     </div>
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <Separator />

//             {/* Language */}
//             <div className="space-y-3">
//               <h3 className="font-semibold text-sm flex items-center gap-2">
//                 <Globe className="size-4" />
//                 Language
//               </h3>
//               <Select 
//                 value={settings.language} 
//                 onValueChange={(value) => {
//                   updateSettings({ language: value });
//                   i18n.changeLanguage(value);
//                   toast.success(`Language changed to ${value === 'en' ? 'English' : value === 'ta' ? 'Tamil' : 'Hindi'}`);
//                 }}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="en">English</SelectItem>
//                   <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
//                   <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Notifications */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Bell className="size-5 text-blue-500" />
//               Notifications
//             </CardTitle>
//             <CardDescription>Configure alert preferences</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <div>
//                 <Label htmlFor="notif-survey">Survey Completion</Label>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//                   Notify when survey completes successfully
//                 </p>
//               </div>
//               <Switch
//                 id="notif-survey"
//                 checked={settings.notifications.surveyCompletion}
//                 onCheckedChange={(checked) =>
//                   updateSettings({
//                     notifications: { ...settings.notifications, surveyCompletion: checked },
//                   })
//                 }
//               />
//             </div>

//             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <div>
//                 <Label htmlFor="notif-connection">Connection Loss</Label>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//                   Alert when connection to base station is lost
//                 </p>
//               </div>
//               <Switch
//                 id="notif-connection"
//                 checked={settings.notifications.connectionLoss}
//                 onCheckedChange={(checked) =>
//                   updateSettings({
//                     notifications: { ...settings.notifications, connectionLoss: checked },
//                   })
//                 }
//               />
//             </div>

//             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <div>
//                 <Label htmlFor="notif-accuracy">Low Accuracy Warning</Label>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//                   Warn when position accuracy degrades
//                 </p>
//               </div>
//               <Switch
//                 id="notif-accuracy"
//                 checked={settings.notifications.lowAccuracy}
//                 onCheckedChange={(checked) =>
//                   updateSettings({
//                     notifications: { ...settings.notifications, lowAccuracy: checked },
//                   })
//                 }
//               />
//             </div>

//             <Separator />

//             <div className="grid grid-cols-2 gap-4">
//               <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//                 <Label htmlFor="notif-sound">Sound</Label>
//                 <Switch
//                   id="notif-sound"
//                   checked={settings.notifications.sound}
//                   onCheckedChange={(checked) =>
//                     updateSettings({
//                       notifications: { ...settings.notifications, sound: checked },
//                     })
//                   }
//                 />
//               </div>

//               <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//                 <Label htmlFor="notif-vibration">Vibration</Label>
//                 <Switch
//                   id="notif-vibration"
//                   checked={settings.notifications.vibration}
//                   onCheckedChange={(checked) =>
//                     updateSettings({
//                       notifications: { ...settings.notifications, vibration: checked },
//                     })
//                   }
//                 />
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Connection Preferences */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Wifi className="size-5 text-blue-500" />
//               Connection Preferences
//             </CardTitle>
//             <CardDescription>Manage connection behavior</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="connection-method">Preferred Connection Method</Label>
//               <Select
//                 value={settings.connection.preferredMethod}
//                 onValueChange={(value: 'wifi' | 'ble' | 'auto') =>
//                   updateSettings({
//                     connection: { ...settings.connection, preferredMethod: value },
//                   })
//                 }
//               >
//                 <SelectTrigger id="connection-method">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="auto">Auto (WiFi → BLE)</SelectItem>
//                   <SelectItem value="wifi">Always WiFi</SelectItem>
//                   <SelectItem value="ble">Always BLE</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <div>
//                 <Label htmlFor="auto-reconnect">Auto-reconnect</Label>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//                   Automatically reconnect on disconnect
//                 </p>
//               </div>
//               <Switch
//                 id="auto-reconnect"
//                 checked={settings.connection.autoReconnect}
//                 onCheckedChange={(checked) =>
//                   updateSettings({
//                     connection: { ...settings.connection, autoReconnect: checked },
//                   })
//                 }
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="timeout">Connection Timeout (seconds)</Label>
//               <Select
//                 value={settings.connection.timeout.toString()}
//                 onValueChange={(value) =>
//                   updateSettings({
//                     connection: { ...settings.connection, timeout: parseInt(value) },
//                   })
//                 }
//               >
//                 <SelectTrigger id="timeout">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="10">10 seconds</SelectItem>
//                   <SelectItem value="20">20 seconds</SelectItem>
//                   <SelectItem value="30">30 seconds</SelectItem>
//                   <SelectItem value="60">60 seconds</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <div>
//                 <Label htmlFor="keep-awake">Keep Screen Awake</Label>
//                 <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
//                   Prevent screen from turning off during survey
//                 </p>
//               </div>
//               <Switch
//                 id="keep-awake"
//                 checked={settings.connection.keepScreenAwake}
//                 onCheckedChange={(checked) =>
//                   updateSettings({
//                     connection: { ...settings.connection, keepScreenAwake: checked },
//                   })
//                 }
//               />
//             </div>
//           </CardContent>
//         </Card>

//         {/* Data Management */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Database className="size-5 text-blue-500" />
//               Data Management
//             </CardTitle>
//             <CardDescription>Clear cached data and reset settings</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button variant="outline" className="w-full gap-2">
//                   <Trash2 className="size-4" />
//                   Clear App Cache
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Clear App Cache?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This will clear temporary files and cached data. This action cannot be undone.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={handleClearCache}>Clear Cache</AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button variant="outline" className="w-full gap-2">
//                   <Settings className="size-4" />
//                   Reset All Settings
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Reset All Settings?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This will reset all application settings to their default values. Configuration data will be preserved.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={handleResetSettings}>Reset</AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button variant="outline" className="w-full gap-2">
//                   <Wifi className="size-4" />
//                   Clear Saved WiFi Passwords
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Clear WiFi Passwords?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This will remove all saved WiFi network passwords. You will need to re-enter them on next connection.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={handleClearWiFiPasswords}>Clear Passwords</AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>

//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                 <Button variant="outline" className="w-full gap-2">
//                   <Wifi className="size-4" />
//                   Clear BLE Pairing Data
//                 </Button>
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Clear BLE Pairing Data?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This will remove all Bluetooth pairing information. You will need to re-pair devices.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={handleClearBLEData}>Clear Data</AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//           </CardContent>
//         </Card>

//         {/* About Section */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Info className="size-5 text-blue-500" />
//               About
//             </CardTitle>
//             <CardDescription>Version information and support</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-3">
//               <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//                 <span className="text-sm text-slate-600 dark:text-slate-400">App Version</span>
//                 <Badge variant="outline">1.0.0</Badge>
//               </div>

//               <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//                 <span className="text-sm text-slate-600 dark:text-slate-400">Backend Server</span>
//                 <Badge variant="outline">v2.1.0</Badge>
//               </div>

//               <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//                 <span className="text-sm text-slate-600 dark:text-slate-400">ZED-F9P Firmware</span>
//                 <Badge variant="outline">{gnssStatus.firmwareVersion}</Badge>
//               </div>
//             </div>

//             <Separator />

//             <div className="space-y-2">
//               <Button variant="outline" className="w-full gap-2">
//                 <ExternalLink className="size-4" />
//                 Check for Updates
//               </Button>

//               <Button variant="outline" className="w-full gap-2">
//                 <ExternalLink className="size-4" />
//                 Help Documentation
//               </Button>

//               <Button variant="outline" className="w-full gap-2">
//                 <ExternalLink className="size-4" />
//                 Contact Support
//               </Button>
//             </div>

//             <div className="pt-4 text-center text-xs text-slate-600 dark:text-slate-400">
//               <p>U-Blox ZED-F9P RTK Base Station</p>
//               <p className="mt-1">© 2026 GNSS Solutions. All rights reserved.</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };






























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
  Globe,
  Monitor,
  RefreshCcw,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, gnssStatus } = useGNSS();
  const { i18n } = useTranslation();

  const handleAction = (msg: string) => {
    toast.success(msg, {
      icon: <Zap className="size-4 text-blue-500" />,
    });
  };

  // UI Variable classes for consistency
  const inputLabel = "text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block";
  const itemContainer = "flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 transition-colors hover:border-slate-300 dark:hover:border-slate-700";

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen animate-in fade-in duration-500 pb-24">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">App Settings</h1>
          <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">
            Global application preferences and hardware link configuration
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:flex px-3 py-1 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/10">
          v1.0.4-Stable
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* ── SECTION: CORE PREFERENCES ── */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white shadow-md shadow-blue-500/20">
                <Settings className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">General Preferences</CardTitle>
                <CardDescription className="text-xs font-normal">Configure units and visual interface</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Unit Toggle */}
              <div className="space-y-3">
                <Label className={inputLabel}>Measurement Units</Label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                  {(['meters', 'feet'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => updateSettings({ units: { ...settings.units, distance: unit } })}
                      className={`flex-1 py-1.5 text-[11px] font-semibold uppercase rounded-md transition-all ${
                        settings.units.distance === unit 
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                        : 'text-slate-500'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Toggle */}
              <div className="space-y-3">
                <Label className={inputLabel}>Visual Theme</Label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
                  {[
                    { id: 'light', icon: Sun },
                    { id: 'dark', icon: Moon },
                    { id: 'system', icon: Monitor }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as any })}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold uppercase rounded-md transition-all ${
                        settings.theme === t.id 
                          ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                          : 'text-slate-500'
                      }`}
                    >
                      <t.icon className="size-3.5" />
                      {t.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className={inputLabel}>Coordinate Format</Label>
                <Select value={settings.units.coordinates} onValueChange={(v: any) => updateSettings({ units: { ...settings.units, coordinates: v } })}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 border-slate-800">
                    <SelectItem value="DD" className="font-medium text-sm">Decimal Degrees (DD)</SelectItem>
                    <SelectItem value="DMS" className="font-medium text-sm">Degrees Minutes Seconds (DMS)</SelectItem>
                    <SelectItem value="UTM" className="font-medium text-sm">Universal Transverse Mercator (UTM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={inputLabel}>System Language</Label>
                <Select value={settings.language} onValueChange={(v) => {
                  updateSettings({ language: v });
                  i18n.changeLanguage(v);
                  handleAction(`Language synchronized`);
                }}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-blue-500" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-900 border-slate-800">
                    <SelectItem value="en" className="font-medium text-sm">English (Global)</SelectItem>
                    <SelectItem value="ta" className="font-medium text-sm">தமிழ் (Tamil)</SelectItem>
                    <SelectItem value="hi" className="font-medium text-sm">हिन्दी (Hindi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── SECTION: ALERTS & NOTIFICATIONS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Bell className="size-4 text-emerald-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">Alert Configuration</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { id: 'surveyCompletion', label: 'Survey Success' },
                { id: 'connectionLoss', label: 'Connection Alerts' },
                { id: 'lowAccuracy', label: 'Precision Warning' },
              ].map((item) => (
                <div key={item.id} className={itemContainer}>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</Label>
                  <Switch 
                    checked={(settings.notifications as any)[item.id]} 
                    onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, [item.id]: v } })} 
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60">
                   <span className="text-[10px] font-bold text-slate-500">AUDIO</span>
                   <Switch checked={settings.notifications.sound} onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, sound: v } })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60">
                   <span className="text-[10px] font-bold text-slate-500">HAPTIC</span>
                   <Switch checked={settings.notifications.vibration} onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, vibration: v } })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Wifi className="size-4 text-blue-500" />
                <CardTitle className="text-sm font-semibold uppercase tracking-wider">Radio Connection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-1.5">
                 <Label className={inputLabel}>Link Priority</Label>
                 <Select value={settings.connection.preferredMethod} onValueChange={(v: any) => updateSettings({ connection: { ...settings.connection, preferredMethod: v } })}>
                   <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-medium text-sm"><SelectValue /></SelectTrigger>
                   <SelectContent className="dark:bg-slate-900 border-slate-800">
                     <SelectItem value="auto">Smart Switching</SelectItem>
                     <SelectItem value="wifi">Force Wi-Fi</SelectItem>
                     <SelectItem value="ble">Force Bluetooth</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className={itemContainer}>
                 <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">Auto-Reconnect</Label>
                 <Switch checked={settings.connection.autoReconnect} onCheckedChange={(v) => updateSettings({ connection: { ...settings.connection, autoReconnect: v } })} />
               </div>
               <div className={itemContainer}>
                 <Label className="text-sm font-medium text-slate-700 dark:text-slate-200">Keep Awake</Label>
                 <Switch checked={settings.connection.keepScreenAwake} onCheckedChange={(v) => updateSettings({ connection: { ...settings.connection, keepScreenAwake: v } })} />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* ── SECTION: DATA & MAINTENANCE ── */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <CardHeader className="bg-red-50/30 dark:bg-red-950/10 border-b border-red-100 dark:border-red-900/20">
            <div className="flex items-center gap-3">
              <ShieldAlert className="size-4 text-red-500" />
              <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">Maintenance Bay</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 grid sm:grid-cols-2 gap-4">
             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="outline" className="h-11 justify-start gap-3 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all font-medium rounded-lg text-sm">
                   <Trash2 className="size-4 text-slate-400" /> Purge App Cache
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                 <AlertDialogHeader>
                   <AlertDialogTitle className="dark:text-slate-50">Clear temporary data?</AlertDialogTitle>
                   <AlertDialogDescription className="dark:text-slate-400 text-xs">This action removes cached survey snapshots and logs. The base station configuration is unaffected.</AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel className="dark:bg-slate-950 dark:text-slate-300 border-none">Cancel</AlertDialogCancel>
                   <AlertDialogAction onClick={() => handleAction('Cache purged')} className="bg-red-600 hover:bg-red-700 text-sm font-bold">Wipe Data</AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>

             <AlertDialog>
               <AlertDialogTrigger asChild>
                 <Button variant="outline" className="h-11 justify-start gap-3 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 transition-all font-medium rounded-lg text-sm">
                   <RefreshCcw className="size-4 text-slate-400" /> Factory Reset App
                 </Button>
               </AlertDialogTrigger>
               <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                 <AlertDialogHeader>
                   <AlertDialogTitle className="dark:text-slate-50 text-base">Reset all settings?</AlertDialogTitle>
                   <AlertDialogDescription className="dark:text-slate-400 text-xs">This returns all Units, Themes, and Notifications to their original state.</AlertDialogDescription>
                 </AlertDialogHeader>
                 <AlertDialogFooter>
                   <AlertDialogCancel className="dark:bg-slate-950 dark:text-slate-300 border-none">Cancel</AlertDialogCancel>
                   <AlertDialogAction onClick={() => handleAction('App reset complete')} className="bg-red-600 hover:bg-red-700 text-sm font-bold">Reset</AlertDialogAction>
                 </AlertDialogFooter>
               </AlertDialogContent>
             </AlertDialog>
          </CardContent>
        </Card>

        {/* ── ABOUT FOOTER ── */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <Globe className="size-8 text-blue-500 opacity-80" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-50 uppercase tracking-tighter">GNSS Base Control</h4>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Industrial Precision Suite</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hardware Build</span>
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{gnssStatus.firmwareVersion || 'v1.32.B-PRO'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg"><ExternalLink className="size-3 mr-2" /> Docs</Button>
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg"><RefreshCcw className="size-3 mr-2" /> Build</Button>
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg"><Info className="size-3 mr-2" /> Help</Button>
            </div>

            <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              © 2026 GNSS Solutions Ltd. All rights reserved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};