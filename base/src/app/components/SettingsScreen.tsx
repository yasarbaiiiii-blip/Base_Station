import React from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import {
  Settings,
  Bell,
  Info,
  ExternalLink,
  Moon,
  Sun,
  Globe,
  Monitor,
  RefreshCcw,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, gnssStatus } = useGNSS();
  const { i18n } = useTranslation();

  const handleAction = (msg: string) => {
    toast.success(msg, {
      icon: <Zap className="size-4 text-primary" />,
    });
  };

  const inputLabel = 'text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 block';
  const itemContainer =
    'flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30 transition-colors hover:bg-muted/40';

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-full animate-in fade-in duration-500 pb-6 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">App Settings</h1>
          <p className="text-sm font-normal text-muted-foreground mt-1">
            Global application preferences and hardware link configuration
          </p>
        </div>
        <Badge
          variant="outline"
          className="hidden sm:flex px-3 py-1 border-primary/25 text-primary font-medium bg-primary/10"
        >
          v1.0.4-Stable
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
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
              <div className="space-y-3">
                <Label className={inputLabel}>Measurement Units</Label>
                <div className="flex p-1 bg-muted/40 rounded-lg border border-border">
                  {(['meters', 'feet'] as const).map((unit) => (
                    <button
                      key={unit}
                      onClick={() => updateSettings({ units: { ...settings.units, distance: unit } })}
                      className={`flex-1 py-1.5 text-[11px] font-semibold uppercase rounded-md transition-all ${
                        settings.units.distance === unit
                          ? 'bg-card text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {unit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className={inputLabel}>Visual Theme</Label>
                <div className="flex p-1 bg-muted/40 rounded-lg border border-border">
                  {[
                    { id: 'light', icon: Sun },
                    { id: 'dark', icon: Moon },
                    { id: 'system', icon: Monitor },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as any })}
                      className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[11px] font-semibold uppercase rounded-md transition-all ${
                        settings.theme === t.id
                          ? 'bg-card text-primary shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
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
                  <SelectTrigger className="h-10 bg-background border border-border font-medium text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="DD" className="font-medium text-sm">Decimal Degrees (DD)</SelectItem>
                    <SelectItem value="DMS" className="font-medium text-sm">Degrees Minutes Seconds (DMS)</SelectItem>
                    <SelectItem value="UTM" className="font-medium text-sm">Universal Transverse Mercator (UTM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={inputLabel}>System Language</Label>
                <Select
                  value={settings.language}
                  onValueChange={(v) => {
                    updateSettings({ language: v });
                    i18n.changeLanguage(v);
                    handleAction('Language synchronized');
                  }}
                >
                  <SelectTrigger className="h-10 bg-background border border-border font-medium text-sm">
                    <div className="flex items-center gap-2">
                      <Globe className="size-4 text-primary" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="en" className="font-medium text-sm">English (Global)</SelectItem>
                    <SelectItem value="ta" className="font-medium text-sm">Tamil</SelectItem>
                    <SelectItem value="hi" className="font-medium text-sm">Hindi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border rounded-xl shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Bell className="size-4 text-primary" />
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
                <Label className="text-sm font-medium text-foreground">{item.label}</Label>
                <Switch
                  checked={(settings.notifications as any)[item.id]}
                  onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, [item.id]: v } })}
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground">AUDIO</span>
                <Switch checked={settings.notifications.sound} onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, sound: v } })} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground">HAPTIC</span>
                <Switch checked={settings.notifications.vibration} onCheckedChange={(v) => updateSettings({ notifications: { ...settings.notifications, vibration: v } })} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-muted/30 border border-border">
                  <Globe className="size-8 text-primary opacity-80" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-foreground uppercase tracking-tight">GNSS Base Control</h4>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Industrial Precision Suite</p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Hardware Build</span>
                <span className="text-xs font-mono font-bold text-primary">{gnssStatus.firmwareVersion || 'v1.32.B-PRO'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg">
                <ExternalLink className="size-3 mr-2" /> Docs
              </Button>
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg">
                <RefreshCcw className="size-3 mr-2" /> Build
              </Button>
              <Button variant="outline" className="text-[10px] h-9 font-bold uppercase tracking-wider rounded-lg">
                <Info className="size-3 mr-2" /> Help
              </Button>
            </div>

            <p className="text-center text-[10px] font-medium text-muted-foreground pt-2 border-t border-border">
              © 2026 GNSS Solutions Ltd. All rights reserved.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
