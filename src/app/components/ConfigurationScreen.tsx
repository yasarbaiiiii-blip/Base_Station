import React, { useState, useEffect } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Save, RotateCcw, Settings, Wifi, Radio, Server, Send, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { uiLogger } from '../../utils/uiLogger';
import { api } from '../../api/gnssApi';

export const ConfigurationScreen: React.FC = () => {
  const { configuration, updateConfiguration, survey, streams, startNTRIP, stopNTRIP } = useGNSS();
  const [config, setConfig] = useState(configuration);
  const [activeMsgType, setActiveMsgType] = useState<'MSM4' | 'MSM7'>('MSM4');
  const [rtcmActiveMessages, setRtcmActiveMessages] = useState<string[]>([]);
  const [rtcmLoading, setRtcmLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({
    wifi: false,
    ntrip: false,
  });

  // Fetch RTCM status on mount — sync MSM type and ticked messages from backend
  useEffect(() => {
    api.getRTCM()
      .then((status) => {
        if (status.msm_type === 'MSM4' || status.msm_type === 'MSM7') {
          setActiveMsgType(status.msm_type);
        }
        const activeIds = Object.keys(status.message_counts ?? {}).filter(
          (id) => (status.message_counts[id] ?? 0) > 0
        );
        setRtcmActiveMessages(activeIds);
      })
      .catch((e) => console.warn('RTCM status fetch failed:', e))
      .finally(() => setRtcmLoading(false));

    // Fetch autoflow config — sync auto mode toggle from backend
    api.getAutoFlowConfig()
      .then((cfg) => {
        if (typeof cfg.enabled === 'boolean') {
          setConfig(prev => ({
            ...prev,
            baseStation: { ...prev.baseStation, autoMode: cfg.enabled },
          }));
        }
      })
      .catch((e) => console.warn('Autoflow config fetch failed:', e));
  }, []);

  const handleMsmTypeChange = async (type: 'MSM4' | 'MSM7') => {
    setActiveMsgType(type);
    try {
      await api.configureRTCM(type);
      toast.success(`Switched to ${type}`);
    } catch (e) {
      toast.error(`Failed to configure RTCM: ${e}`);
    }
  };

  const handleSave = () => {
    uiLogger.log('Save Configuration clicked', 'ConfigurationScreen', config);
    updateConfiguration(config);
    uiLogger.log('Configuration saved', 'ConfigurationScreen');
    toast.success('Configuration saved successfully');
  };

  const handleReset = () => {
    uiLogger.log('Reset Configuration clicked', 'ConfigurationScreen');
    setConfig(configuration);
    toast.info('Configuration reset to defaults');
  };

  const handleStartStopNTRIP = async () => {
    if (streams.ntrip.active) {
      // Stop NTRIP
      try {
        uiLogger.log('Stop NTRIP Connection clicked', 'ConfigurationScreen');
        await stopNTRIP();
        toast.success('NTRIP connection stopped');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        uiLogger.log('Stop NTRIP Failed', 'ConfigurationScreen', undefined, errorMsg);
        toast.error(`Failed to stop NTRIP: ${errorMsg}`);
      }
    } else {
      // Start NTRIP
      try {
        uiLogger.log('Start NTRIP Connection clicked', 'ConfigurationScreen', {
          server: config.streams.ntrip.server,
          port: config.streams.ntrip.port,
          mountpoint: config.streams.ntrip.mountpoint,
        });

        await startNTRIP(
          config.streams.ntrip.server,
          config.streams.ntrip.port,
          config.streams.ntrip.mountpoint,
          config.streams.ntrip.password,
          config.streams.ntrip.username
        );

        toast.success('NTRIP connection started');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        uiLogger.log('Start NTRIP Failed', 'ConfigurationScreen', undefined, errorMsg);
        toast.error(`Failed to start NTRIP: ${errorMsg}`);
      }
    }
  };

  const loadCurrentSurvey = () => {
    uiLogger.log('Load Current Survey clicked', 'ConfigurationScreen', {
      coordinates: survey.position,
    });
    setConfig({
      ...config,
      baseStation: {
        ...config.baseStation,
        fixedMode: {
          enabled: true,
          coordinates: survey.position,
        },
      },
    });
    toast.success('Loaded coordinates from current survey');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Configuration</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Configure base station operational parameters
        </p>
      </div>

      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={['base-station', 'ntrip-sender']} className="w-full space-y-4">
          {/* Base Station Settings */}
          <AccordionItem value="base-station" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Base Station Settings</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Survey-in and position configuration
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-6">
              {/* Survey-In Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Survey-In Configuration</h3>

                <div className="space-y-3">
                  {/* Duration Control */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="survey-duration" className="text-sm font-semibold">Duration</Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {Math.floor(config.baseStation.surveyDuration / 60)}m {config.baseStation.surveyDuration % 60}s
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          id="survey-duration"
                          min={30}
                          max={600}
                          step={10}
                          value={[config.baseStation.surveyDuration]}
                          onValueChange={([value]) =>
                            setConfig({
                              ...config,
                              baseStation: { ...config.baseStation, surveyDuration: value },
                            })
                          }
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>30s</span>
                          <span>5m</span>
                          <span>10m</span>
                        </div>
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min={30}
                          max={600}
                          value={config.baseStation.surveyDuration}
                          onChange={(e) => {
                            const v = Math.min(600, Math.max(30, parseInt(e.target.value) || 30));
                            setConfig({
                              ...config,
                              baseStation: { ...config.baseStation, surveyDuration: v },
                            });
                          }}
                          className="h-9 text-center font-mono text-sm"
                        />
                        <div className="text-[10px] text-slate-400 text-center mt-0.5">sec</div>
                      </div>
                    </div>
                  </div>

                  {/* Accuracy Threshold Control */}
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <Label htmlFor="accuracy-threshold" className="text-sm font-semibold">Accuracy Threshold</Label>
                      <Badge variant="outline" className="font-mono text-xs">
                        {config.baseStation.accuracyThreshold} cm ({(config.baseStation.accuracyThreshold / 100).toFixed(2)} m)
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          id="accuracy-threshold"
                          min={1}
                          max={300}
                          step={1}
                          value={[config.baseStation.accuracyThreshold]}
                          onValueChange={([value]) =>
                            setConfig({
                              ...config,
                              baseStation: { ...config.baseStation, accuracyThreshold: value },
                            })
                          }
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                          <span>1cm</span>
                          <span>1.5m</span>
                          <span>3m</span>
                        </div>
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min={1}
                          max={300}
                          value={config.baseStation.accuracyThreshold}
                          onChange={(e) => {
                            const v = Math.min(300, Math.max(1, parseInt(e.target.value) || 1));
                            setConfig({
                              ...config,
                              baseStation: { ...config.baseStation, accuracyThreshold: v },
                            });
                          }}
                          className="h-9 text-center font-mono text-sm"
                        />
                        <div className="text-[10px] text-slate-400 text-center mt-0.5">cm</div>
                      </div>
                    </div>
                  </div>


                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div>
                      <Label htmlFor="auto-mode">Automatic Start on Boot</Label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Starts Survey automatically, stop survey <br /> when target accuracy is reached
                      </p>
                    </div>
                    <Switch
                      id="auto-mode"
                      checked={config.baseStation.autoMode}
                      onCheckedChange={async (checked) => {
                        setConfig({
                          ...config,
                          baseStation: { ...config.baseStation, autoMode: checked },
                        });
                        try {
                          if (checked) {
                            await api.enableAutoFlow({
                              msm_type: 'MSM4',
                              min_duration_sec: config.baseStation.surveyDuration,
                              accuracy_limit_m: config.baseStation.accuracyThreshold / 100,
                              ntrip_host: config.streams.ntrip.server,
                              ntrip_port: config.streams.ntrip.port,
                              ntrip_mountpoint: config.streams.ntrip.mountpoint,
                              ntrip_password: config.streams.ntrip.password,
                              ntrip_username: config.streams.ntrip.username,
                            });
                            toast.success('Auto mode enabled');
                          } else {
                            await api.disableAutoFlow();
                            toast.success('Auto mode disabled');
                          }
                        } catch (e) {
                          // Rollback on failure
                          setConfig(prev => ({
                            ...prev,
                            baseStation: { ...prev.baseStation, autoMode: !checked },
                          }));
                          toast.error(`Failed to ${checked ? 'enable' : 'disable'} auto mode: ${e}`);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Fixed Position Mode */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Fixed Position Mode</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Use known coordinates instead of survey-in
                    </p>
                  </div>
                  <Switch
                    checked={config.baseStation.fixedMode.enabled}
                    onCheckedChange={(checked) =>
                      setConfig({
                        ...config,
                        baseStation: {
                          ...config.baseStation,
                          fixedMode: { ...config.baseStation.fixedMode, enabled: checked },
                        },
                      })
                    }
                  />
                </div>

                {config.baseStation.fixedMode.enabled && (
                  <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div>
                      <Label htmlFor="fixed-lat">Latitude (8 decimals)</Label>
                      <Input
                        id="fixed-lat"
                        type="number"
                        step="0.00000001"
                        value={config.baseStation.fixedMode.coordinates.latitude}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            baseStation: {
                              ...config.baseStation,
                              fixedMode: {
                                ...config.baseStation.fixedMode,
                                coordinates: {
                                  ...config.baseStation.fixedMode.coordinates,
                                  latitude: parseFloat(e.target.value) || 0,
                                },
                              },
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fixed-lon">Longitude (8 decimals)</Label>
                      <Input
                        id="fixed-lon"
                        type="number"
                        step="0.00000001"
                        value={config.baseStation.fixedMode.coordinates.longitude}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            baseStation: {
                              ...config.baseStation,
                              fixedMode: {
                                ...config.baseStation.fixedMode,
                                coordinates: {
                                  ...config.baseStation.fixedMode.coordinates,
                                  longitude: parseFloat(e.target.value) || 0,
                                },
                              },
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fixed-alt">Altitude (meters)</Label>
                      <Input
                        id="fixed-alt"
                        type="number"
                        step="0.001"
                        value={config.baseStation.fixedMode.coordinates.altitude}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            baseStation: {
                              ...config.baseStation,
                              fixedMode: {
                                ...config.baseStation.fixedMode,
                                coordinates: {
                                  ...config.baseStation.fixedMode.coordinates,
                                  altitude: parseFloat(e.target.value) || 0,
                                },
                              },
                            },
                          })
                        }
                        className="font-mono"
                      />
                    </div>

                    <Button variant="outline" className="w-full" onClick={loadCurrentSurvey}>
                      Load from Current Survey
                    </Button>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* NTRIP Sender Settings */}
          <AccordionItem value="ntrip-sender" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Send className="size-5 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold">NTRIP Sender Settings</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Cast corrections to NTRIP caster
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ntrip-sender-server">Server Address</Label>
                  <Input
                    id="ntrip-sender-server"
                    value={config.streams.ntrip.server}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          ntrip: { ...config.streams.ntrip, server: e.target.value },
                        },
                      })
                    }
                    placeholder=""
                  />
                </div>

                <div>
                  <Label htmlFor="ntrip-sender-port">Port</Label>
                  <Input
                    id="ntrip-sender-port"
                    type="number"
                    value={config.streams.ntrip.port}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          ntrip: { ...config.streams.ntrip, port: parseInt(e.target.value) || 2101 },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ntrip-sender-mountpoint">Mountpoint Name</Label>
                <Input
                  id="ntrip-sender-mountpoint"
                  value={config.streams.ntrip.mountpoint}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      streams: {
                        ...config.streams,
                        ntrip: { ...config.streams.ntrip, mountpoint: e.target.value },
                      },
                    })
                  }
                  placeholder=""
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ntrip-sender-username">Username</Label>
                  <Input
                    id="ntrip-sender-username"
                    value={config.streams.ntrip.username || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          ntrip: { ...config.streams.ntrip, username: e.target.value },
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="ntrip-sender-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="ntrip-sender-password"
                      type={showPasswords.ntrip ? 'text' : 'password'}
                      value={config.streams.ntrip.password}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          streams: {
                            ...config.streams,
                            ntrip: { ...config.streams.ntrip, password: e.target.value },
                          },
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, ntrip: !showPasswords.ntrip })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.ntrip ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* NTRIP Status Display */}
                {streams.ntrip.enabled && (
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2">
                    <h4 className="font-semibold text-sm">NTRIP Status</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>
                        <Badge variant={streams.ntrip.active ? "default" : "secondary"} className="ml-2">
                          {streams.ntrip.active ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Host:</span>
                        <span className="ml-2 font-mono">{config.streams.ntrip.server}:{config.streams.ntrip.port}</span>
                      </div>
                      <div>
                        <span className="font-medium">Mountpoint:</span>
                        <span className="ml-2 font-mono">{streams.ntrip.mountpoint || config.streams.ntrip.mountpoint}</span>
                      </div>
                      <div>
                        <span className="font-medium">Data Sent:</span>
                        <span className="ml-2">{(streams.ntrip.dataSent / 1024).toFixed(2)} KB</span>
                      </div>
                      <div>
                        <span className="font-medium">Uptime:</span>
                        <span className="ml-2">{Math.floor(streams.ntrip.uptime / 60)}m {streams.ntrip.uptime % 60}s</span>
                      </div>
                      <div>
                        <span className="font-medium">Data Rate:</span>
                        <span className="ml-2">{(streams.ntrip.throughput / 1024).toFixed(2)} KB/s</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Connection Control Button */}
                <Button
                  variant={streams.ntrip.active ? "destructive" : "default"}
                  className="w-full"
                  onClick={handleStartStopNTRIP}
                  disabled={!config.streams.ntrip.server || !config.streams.ntrip.mountpoint || !config.streams.ntrip.password}
                >
                  {streams.ntrip.active ? "Stop Connection" : "Start Connection"}
                </Button>

                {!config.streams.ntrip.server && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Server address is required
                  </p>
                )}
                {!config.streams.ntrip.mountpoint && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Mountpoint is required
                  </p>
                )}
                {!config.streams.ntrip.password && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Password is required
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* NTRIP Receiver Settings */}
          <AccordionItem value="ntrip-receiver" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Radio className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">NTRIP Receiver Settings</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Receive corrections from NTRIP caster
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  ℹ️ NTRIP Receiver functionality coming soon. Currently, the base station sends RTK corrections via NTRIP Sender.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ntrip-receiver-server">Server Address</Label>
                  <Input
                    id="ntrip-receiver-server"
                    disabled
                    value={config.streams.ntrip.server}
                    placeholder="caster.emlid.com"
                  />
                </div>

                <div>
                  <Label htmlFor="ntrip-receiver-port">Port</Label>
                  <Input
                    id="ntrip-receiver-port"
                    type="number"
                    disabled
                    value={config.streams.ntrip.port}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ntrip-receiver-mountpoint">Mountpoint Name</Label>
                <Input
                  id="ntrip-receiver-mountpoint"
                  disabled
                  value={config.streams.ntrip.mountpoint}
                  placeholder="EMLID_RECV"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Serial Output */}
          <AccordionItem value="serial" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Radio className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">Serial Output</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Serial port configuration
                  </div>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-4 space-y-4">
              {/* Baud Rate Selection */}
              <div>
                <Label htmlFor="serial-baud">Baud Rate</Label>
                <Select
                  value={config.streams.serial.baudRate.toString()}
                  onValueChange={(value) =>
                    setConfig({
                      ...config,
                      streams: {
                        ...config.streams,
                        serial: { ...config.streams.serial, baudRate: parseInt(value) },
                      },
                    })
                  }
                >
                  <SelectTrigger id="serial-baud" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9600">9600</SelectItem>
                    <SelectItem value="19200">19200</SelectItem>
                    <SelectItem value="38400">38400</SelectItem>
                    <SelectItem value="57600">57600</SelectItem>
                    <SelectItem value="115200">115200</SelectItem>
                    <SelectItem value="230400">230400</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* RTCM3 Messages Configuration */}
              <div>
                <Label>RTCM3 Messages</Label>

                {/* MSM4 / MSM7 Toggle */}
                <div className="flex gap-2 mt-3 mb-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                  <button
                    onClick={() => handleMsmTypeChange('MSM4')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeMsgType === 'MSM4'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    MSM4
                  </button>
                  <button
                    onClick={() => handleMsmTypeChange('MSM7')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeMsgType === 'MSM7'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    MSM7
                  </button>
                </div>

                {/* Dynamic Message List — ticked = backend is actively streaming that message */}
                {rtcmLoading ? (
                  <div className="text-sm text-slate-500 dark:text-slate-400 py-2">Loading RTCM status…</div>
                ) : (
                  <div className="space-y-3">
                    {(activeMsgType === 'MSM4'
                      ? [
                        { id: '1005', name: '1005 (Station Position)' },
                        { id: '1074', name: '1074 (GPS MSM4)' },
                        { id: '1084', name: '1084 (GLONASS MSM4)' },
                        { id: '1094', name: '1094 (Galileo MSM4)' },
                        { id: '1124', name: '1124 (BeiDou MSM4)' },
                        { id: '1230', name: '1230 (GLONASS Biases)' },
                      ]
                      : [
                        { id: '1005', name: '1005 (Station Position)' },
                        { id: '1077', name: '1077 (GPS MSM7)' },
                        { id: '1087', name: '1087 (GLONASS MSM7)' },
                        { id: '1097', name: '1097 (Galileo MSM7)' },
                        { id: '1127', name: '1127 (BeiDou MSM7)' },
                        { id: '1230', name: '1230 (GLONASS Biases)' },
                      ]
                    ).map((msg) => {
                      const isActive = rtcmActiveMessages.includes(msg.id);
                      return (
                        <div key={msg.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isActive
                          ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-transparent'
                          }`}>
                          <input
                            type="checkbox"
                            id={`msg-${msg.id}`}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={isActive}
                            readOnly
                          />
                          <label htmlFor={`msg-${msg.id}`} className="flex-1 text-sm font-medium select-none">
                            {msg.name}
                          </label>
                          {isActive && (
                            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-2 py-0.5 rounded-full">
                              streaming
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* TCP Server */}
          <AccordionItem value="tcp" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Server className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">TCP Server</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    TCP socket server settings
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tcp-port">Port Number</Label>
                  <Input
                    id="tcp-port"
                    type="number"
                    value={config.streams.tcp.port}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          tcp: { ...config.streams.tcp, port: parseInt(e.target.value) || 9000 },
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="tcp-max-clients">Max Clients</Label>
                  <Input
                    id="tcp-max-clients"
                    type="number"
                    min="1"
                    max="10"
                    value={config.streams.tcp.maxClients}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          tcp: { ...config.streams.tcp, maxClients: parseInt(e.target.value) || 5 },
                        },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Label htmlFor="tcp-auth">Require Authentication</Label>
                <Switch
                  id="tcp-auth"
                  checked={config.streams.tcp.authEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      streams: {
                        ...config.streams,
                        tcp: { ...config.streams.tcp, authEnabled: checked },
                      },
                    })
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* UDP Broadcast */}
          <AccordionItem value="udp" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Send className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">UDP Broadcast</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    UDP broadcast configuration
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="udp-port">Port Number</Label>
                  <Input
                    id="udp-port"
                    type="number"
                    value={config.streams.udp.port}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          udp: { ...config.streams.udp, port: parseInt(e.target.value) || 9001 },
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="udp-address">Broadcast Address</Label>
                  <Input
                    id="udp-address"
                    value={config.streams.udp.broadcastAddress}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        streams: {
                          ...config.streams,
                          udp: { ...config.streams.udp, broadcastAddress: e.target.value },
                        },
                      })
                    }
                    placeholder="255.255.255.255"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                <Label htmlFor="udp-multicast">Enable Multicast</Label>
                <Switch
                  id="udp-multicast"
                  checked={config.streams.udp.multicast}
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      streams: {
                        ...config.streams,
                        udp: { ...config.streams.udp, multicast: checked },
                      },
                    })
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* System Settings */}
          <AccordionItem value="system" className="border rounded-lg px-6">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Settings className="size-5 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold">System Settings</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    WiFi and display configuration
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">WiFi Hotspot</h3>
                <div>
                  <Label htmlFor="wifi-ssid">SSID Name</Label>
                  <Input
                    id="wifi-ssid"
                    value={config.system.wifiSsid}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        system: { ...config.system, wifiSsid: e.target.value },
                      })
                    }
                    placeholder="GNSS_BASE_XXXX"
                  />
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    8-32 alphanumeric characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="wifi-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="wifi-password"
                      type={showPasswords.wifi ? 'text' : 'password'}
                      value={config.system.wifiPassword}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          system: { ...config.system, wifiPassword: e.target.value },
                        })
                      }
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, wifi: !showPasswords.wifi })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswords.wifi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="font-semibold text-sm">LED Display</h3>
                <div>
                  <Label htmlFor="led-mode">Display Mode</Label>
                  <Select
                    value={config.system.ledMode}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        system: { ...config.system, ledMode: value },
                      })
                    }
                  >
                    <SelectTrigger id="led-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="always-on">Always On</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="led-brightness">Brightness</Label>
                    <span className="text-sm font-mono">{config.system.ledBrightness}%</span>
                  </div>
                  <Slider
                    id="led-brightness"
                    min={0}
                    max={100}
                    step={10}
                    value={[config.system.ledBrightness]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        system: { ...config.system, ledBrightness: value },
                      })
                    }
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Button onClick={handleSave} className="flex-1 gap-2">
                <Save className="size-4" />
                Save Configuration
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <RotateCcw className="size-4" />
                    Reset to Defaults
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Configuration?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will reset all settings to their default values. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
