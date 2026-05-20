import React, { useState, useEffect } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  RotateCw, Cpu, 
  ChevronRight, Orbit, Lightbulb, Radar, 
  SearchCode, Terminal, Waves, ShieldCheck, Edit2, Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { getWsUrl } from '../../api/gnssApiDynamic';
import { deepSweepNetwork } from '../../utils/ipDiscovery';
import { getCurrentWifiInfo } from '../../native/wifi';

export const ConnectionScreen: React.FC = () => {
  const { connectToDevice, enterOfflinePreview, logs } = useGNSS();
  const [connectionMode, setConnectionMode] = useState<'wifi' | 'auto'>('wifi');
  
  // WebSocket Scanner States
  const [availableSockets, setAvailableSockets] = useState<{id: string, name: string, ip: string, url: string}[]>([]);
  const [selectedSocket, setSelectedSocket] = useState<string>('');
  const [customIp, setCustomIp] = useState<string>(''); 
  const [currentWifiName, setCurrentWifiName] = useState<string>('');
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<'idle' | 'deep'>('idle');

  useEffect(() => {
    if (connectionMode === 'wifi') {
       scanLocalSockets();
    }
  }, [connectionMode]);

  // ⭐ NEW SMART PARSER: Accurately extracts the correct Port and Path from your API setup
  const getWsConfig = () => {
    let port = '8000'; // Default to 8000 since we know your backend uses it
    let path = '/ws/status';
    try { 
      const currentWsUrl = getWsUrl();
      if (!currentWsUrl) {
        return { port, path };
      }

      const parsed = new URL(currentWsUrl);
      port = parsed.port || '8000';
      path = parsed.pathname !== '/' ? parsed.pathname : '';
    } catch(e) {}
    return { port, path };
  };

  const scanLocalSockets = async () => {
    setIsScanning(true);
    setScanPhase('deep');
    setSelectedSocket('');
    setAvailableSockets([]);
    
    const wifiInfo = await getCurrentWifiInfo();
    setCurrentWifiName(wifiInfo?.ssid ?? '');

    const { port, path } = getWsConfig();
    const foundWs = await deepSweepNetwork(wifiInfo?.ip);

    if (foundWs) {
      const parsed = new URL(foundWs);
      const host = parsed.hostname;
      const foundPort = parsed.port || port;
      const foundPath = parsed.pathname || path;
      setAvailableSockets([{
        id: 'gnss-node-0',
        name: 'GNSS Hardware Node',
        ip: `${host}:${foundPort}`,
        url: `ws://${host}:${foundPort}${foundPath}`
      }]);
    }
    
    setScanPhase('idle');
    setIsScanning(false);
  };

  const handleConnect = async (type: 'wifi' | 'auto', identifier: string, wsUrl?: string) => {
    if (!identifier && !wsUrl) {
      toast.error('Target node required');
      return;
    }
    setIsConnecting(true);
    try {
      await connectToDevice(type, identifier, undefined, wsUrl);
      
      setTimeout(() => {
        setIsConnecting((currentlyConnecting) => {
          if (currentlyConnecting) {
            toast.error("Connection timed out. Target node is unresponsive.");
            return false;
          }
          return currentlyConnecting;
        });
      }, 5000);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Link Failed';
      toast.error(type === 'auto' ? message : 'Link Failed');
      if (type === 'auto') {
        setConnectionMode('wifi');
      }
      setIsConnecting(false);
    }
  };

  const handleAutoConnect = async () => {
    await handleConnect('auto', 'CURRENT_WIFI');
  };


  // ⭐ Make Manual Entry perfectly format the URL based on your backend
  const getCustomWsUrl = () => {
    const ip = customIp.trim();
    if (!ip) return '';
    if (ip.startsWith('ws://') || ip.startsWith('wss://')) return ip;
    
    const { port, path } = getWsConfig();
    
    // If the user manually types the port (e.g. 192.168.1.50:8000)
    if (ip.includes(':')) {
       return `ws://${ip}${path}`;
    }
    
    // Otherwise, perfectly assemble the IP + Extracted Port + Extracted Path
    return `ws://${ip}:${port}${path}`; 
  };

  const getSmartSuggestion = () => {
    if (isConnecting) return "Establishing secure bridge...";
    if (scanPhase === 'deep') return "Deep sweep active. Searching full router subnet...";
    if (connectionMode === 'auto') return "Reconnect using your saved GNSS backend.";
    if (currentWifiName) return `Scanning ${currentWifiName} for GNSS hardware.`;
    return "Select a node to begin handshake.";
  };

  const techLabel = "text-[10px] font-bold text-muted-foreground uppercase tracking-[0.25em]";

  return (
    <div className="min-h-dvh safe-x bg-background transition-colors duration-700 flex flex-col items-center justify-start lg:justify-center p-4 md:p-6 lg:p-10 pt-safe overflow-hidden">
      
      <div className="lg:hidden w-full flex items-center justify-between mb-6 px-2 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
            <Cpu className="size-4" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground uppercase">
            GNSS <span className="text-primary font-medium">BASE STATION</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Ready</span>
        </div>
      </div>

      <div className="hidden lg:flex w-full max-w-[1400px] justify-between items-center mb-8 px-2 animate-in fade-in duration-1000">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-card border border-border rounded-xl shadow-sm text-primary">
            <Cpu className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground uppercase">GNSS <span className="text-primary font-medium">BASE STATION</span></h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.3em]">Hardware Handshake Terminal</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-card border-border text-[10px] h-8 px-4 font-medium uppercase tracking-widest text-muted-foreground">Protocol v4.2.1</Badge>
          <Badge variant="outline" className="bg-card border-border text-[10px] h-8 px-4 font-medium uppercase tracking-widest text-primary">AES-256 Encrypted</Badge>
        </div>
      </div>

      <main className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <div className="hidden lg:flex lg:col-span-3 space-y-4 flex-col justify-center animate-in slide-in-from-left-8 duration-700">
          <span className={techLabel}>Layer Selection</span>
          {[
            { id: 'auto', icon: Radar, label: 'Autonomous', desc: 'Smart Discovery' },
            { id: 'wifi', icon: Terminal, label: 'WLAN Socket', desc: 'Local Network Scan' }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setConnectionMode(m.id as any)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-500 ${
                connectionMode === m.id 
                ? 'bg-card border-primary shadow-sm' 
                : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-all duration-500 ${connectionMode === m.id ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                  <m.icon className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{m.label}</h3>
                  <p className="text-[10px] font-normal opacity-50 uppercase tracking-tighter">{m.desc}</p>
                </div>
                {connectionMode === m.id && <ChevronRight className="ml-auto size-4 text-primary animate-in slide-in-from-left-2" />}
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-6 w-full relative z-10">
          <Card className="h-full bg-card border border-border shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all duration-500">
            
            <div className="p-6 md:p-8 border-b border-border bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center">
                    <Lightbulb className={`size-5 ${isConnecting ? 'text-primary animate-pulse' : (scanPhase === 'deep' ? 'text-amber-500 animate-pulse' : 'text-muted-foreground')}`} />
                 </div>
                 <div>
                    <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${scanPhase === 'deep' ? 'text-amber-500' : 'text-primary'}`}>
                      {scanPhase === 'deep' ? 'Deep Scan' : 'Intelligent Trace'}
                    </p>
                    <p className="text-xs md:text-sm font-medium text-muted-foreground leading-tight">{getSmartSuggestion()}</p>
                 </div>
              </div>
              {connectionMode !== 'auto' && (
                <button 
                  onClick={() => scanLocalSockets()} 
                  disabled={isScanning} 
                  className="p-3 rounded-full bg-background border border-border text-primary active:scale-90 transition-all"
                >
                  <RotateCw className={`size-4 ${isScanning ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            <div className="flex-1 p-6 md:p-10 overflow-y-auto max-h-[60vh] lg:max-h-[500px] custom-scrollbar">
              
              {connectionMode === 'auto' && (
                <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                   <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center mb-10">
                      <div className="absolute inset-0 border border-border rounded-full" />
                      <div className="absolute inset-10 border border-border/70 rounded-full" />
                      <div className="absolute inset-20 border border-primary/10 rounded-full" />
                      <div className="absolute inset-[-12px] rounded-full border-t-2 border-primary/40 animate-[spin_4s_linear_infinite]" />
                      <div className="absolute inset-[-4px] rounded-full border-l border-primary/10 animate-[spin_10s_linear_infinite_reverse]" />
                      
                      <div className="p-8 rounded-full bg-background shadow-sm border border-border relative z-10">
                        <Orbit className="size-14 text-primary" />
                      </div>
                   </div>
                   <Button 
                    onClick={handleAutoConnect} 
                    disabled={isConnecting} 
                    className="h-12 px-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] shadow-sm text-[11px] active:scale-95 transition-all"
                   >
                      {isConnecting ? 'Verifying Link...' : 'Establish Bridge'}
                   </Button>
                </div>
              )}

              {connectionMode === 'wifi' && (
                <div className="space-y-4 animate-in slide-in-from-right-8 duration-500">
                  
                  {availableSockets.length === 0 && !isScanning ? (
                     <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-200 px-5 py-4 text-xs font-medium text-center">
                       <Waves className="size-6 mx-auto mb-2 opacity-50" />
                       No GNSS WebSockets Available.
                     </div>
                  ) : (
                     <div className="grid grid-cols-1 gap-3">
                       {availableSockets.map((sock) => (
                          <div 
                            key={sock.id}
                            onClick={() => {
                              setSelectedSocket(sock.url);
                              setCustomIp(''); 
                            }}
                            className={`p-5 rounded-3xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                              selectedSocket === sock.url 
                              ? 'border-primary/40 bg-primary/5 shadow-sm' 
                              : 'border-border bg-background hover:bg-muted/20'
                            }`}
                          >
                             <div className="flex items-center gap-4">
                               <div className={`p-2.5 rounded-xl ${selectedSocket === sock.url ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                                 <Terminal size={18} />
                               </div>
                               <div>
                                 <span className="text-sm font-semibold text-foreground block">{sock.name}</span>
                                 <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">{sock.ip}</p>
                               </div>
                             </div>
                             <div className="flex gap-1 items-end h-4">
                                <div className={`w-1.5 h-[50%] rounded-full transition-colors ${selectedSocket === sock.url ? 'bg-primary' : 'bg-emerald-500'}`} />
                                <div className={`w-1.5 h-[75%] rounded-full transition-colors ${selectedSocket === sock.url ? 'bg-primary' : 'bg-emerald-500'}`} />
                                <div className={`w-1.5 h-[100%] rounded-full transition-colors ${selectedSocket === sock.url ? 'bg-primary' : 'bg-emerald-500'}`} />
                             </div>
                          </div>
                       ))}
                     </div>
                  )}

                  <div 
                    onClick={() => setSelectedSocket('custom')}
                    className={`p-5 rounded-3xl border transition-all duration-300 flex flex-col gap-3 cursor-pointer ${
                    selectedSocket === 'custom' 
                    ? 'border-primary/40 bg-primary/5 shadow-sm' 
                    : 'border-border bg-background hover:bg-muted/20'
                  }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${selectedSocket === 'custom' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'}`}>
                        <Edit2 size={18} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground block">Manual IP Entry</span>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase mt-0.5">Override Target Node</p>
                      </div>
                    </div>
                    {selectedSocket === 'custom' && (
                      <div className="pl-14 pr-2">
                        <Input 
                          placeholder="e.g. 192.168.1.50" 
                          className="h-10 text-xs font-mono bg-background border-border"
                          value={customIp}
                          onChange={(e) => setCustomIp(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  {selectedSocket && !isScanning && (
                    <div className="pt-4 animate-in fade-in slide-in-from-top-4">
                      <Button 
                        onClick={() => {
                          const urlToUse = selectedSocket === 'custom' ? getCustomWsUrl() : selectedSocket;
                          handleConnect('wifi', 'CURRENT_WIFI', urlToUse);
                        }} 
                        disabled={isConnecting || (selectedSocket === 'custom' && !customIp.trim())}
                        className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold uppercase text-[11px] tracking-[0.2em] shadow-sm active:scale-95 transition-all"
                      >
                        {isConnecting ? 'Establishing Link...' : 'Connect to Node'}
                      </Button>
                    </div>
                  )}

                  <div className="pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={enterOfflinePreview}
                      className="w-full h-12 rounded-xl border-border bg-transparent font-bold uppercase text-[11px] tracking-[0.2em] active:scale-95 transition-all"
                    >
                      <Eye className="size-4 mr-2" />
                      Offline Preview
                    </Button>
                  </div>
                </div>
              )}

            </div>

            <div className="p-6 bg-muted/20 border-t border-border flex items-center justify-center gap-12">
               <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                 <ShieldCheck className="size-3.5" /> SECURE HANDSHAKE
               </div>
               <div className="flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                 <SearchCode className="size-3.5" /> Handshake v4.2
               </div>
            </div>
          </Card>
        </div>

        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 animate-in slide-in-from-right-8 duration-700">
           <span className={techLabel}>System Telemetry</span>
           <Card className="flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-3">
                 <Terminal className="size-4 text-primary" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Live Buffer</span>
              </div>
              <div className="flex-1 p-5 font-mono text-[10px] space-y-3 opacity-60 overflow-hidden">
                 {logs.slice(0, 10).map((log, i) => (
                   <div key={i} className="flex gap-2">
                     <span className="text-primary font-bold">[{log.timestamp.toLocaleTimeString()}]</span>
                     <span className="truncate">{log.message}</span>
                   </div>
                 ))}
                 <div className="flex gap-2 text-emerald-500 animate-pulse">
                    <span className="font-bold">[{new Date().toLocaleTimeString()}]</span>
                    <span>Waiting for hardware...</span>
                 </div>
              </div>
              <div className="p-5 bg-muted/20 border-t border-border space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-tighter">
                       <span>Link Quality</span>
                       <span>98%</span>
                    </div>
                    <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                       <div className="w-[98%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </div>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase">Handshake</span>
                    <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase px-2 h-4">SYNC</Badge>
                 </div>
              </div>
           </Card>
        </div>

        <div className="lg:hidden fixed floating-safe-frame z-50">
           <div className="bg-background/90 backdrop-blur-md border border-border p-2 rounded-2xl shadow-sm flex items-center justify-between gap-2">
              {[
                { id: 'auto', icon: Radar, label: 'AUTO' },
                { id: 'wifi', icon: Terminal, label: 'SOCKET' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setConnectionMode(m.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all duration-300 active:scale-90 ${
                    connectionMode === m.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  <m.icon className="size-5" />
                  {connectionMode === m.id && <span className="text-[10px] font-black tracking-widest">{m.label}</span>}
                </button>
              ))}
           </div>
        </div>
      </main>

      <div className="mt-8 mb-24 lg:mb-0 opacity-30 flex flex-col items-center select-none">
         <ShieldCheck className="size-4 mb-2" />
         <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">U-Blox Base Suite</p>
      </div>
    </div>
  );
};
