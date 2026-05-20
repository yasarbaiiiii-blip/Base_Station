// import React, { useState } from 'react';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { SurveyStatus } from './dashboard/SurveyStatus';
// import { GNSSStatusTab } from './dashboard/GNSSStatusTab';
// import { Satellite, Activity } from 'lucide-react';
// import { useGNSS } from '../../context/GNSSContext';

// export const DashboardScreen: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<'survey' | 'gnss'>('survey');
//   const { streams } = useGNSS();

//   return (
//     <div className="min-h-full bg-background text-foreground font-sans transition-colors duration-300">
//       <div className="max-w-[1400px] mx-auto p-6 md:p-8 md:pt-10">

//         {/* Top Navigation & Header Row */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border">
          
//           <div className="space-y-1.5">
//             <div className="flex items-center gap-3 mb-3">
//               <span className="relative flex h-2.5 w-2.5">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-25"></span>
//                 <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
//               </span>
//               <span className="text-xs font-bold tracking-widest text-primary uppercase">
//                 Live Telemetry
//               </span>
//             </div>
//             <h1 className="text-3xl font-semibold tracking-tight">
//               Dashboard
//             </h1>
//           </div>

//           <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
//             {streams.ntrip.active && (
//               <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
//                 <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">NTRIP</div>
//                 <div className="text-xs font-mono font-bold text-foreground">
//                   {((streams.ntrip.throughput || 0) / 1024).toFixed(2)} KB/s
//                 </div>
//                 <div className="text-xs font-mono font-semibold text-muted-foreground">
//                   {((streams.ntrip.dataSent || 0) / 1024).toFixed(1)} KB
//                 </div>
//                 <div className="text-xs font-mono font-semibold text-muted-foreground">
//                   {Math.floor((streams.ntrip.uptime || 0) / 60)}:{String(Math.floor((streams.ntrip.uptime || 0) % 60)).padStart(2, '0')}
//                 </div>
//               </div>
//             )}

//             {streams.lora.enabled && (
//               <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-3 py-2">
//                 <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LORA</div>
//                 <div className="text-xs font-mono font-bold text-foreground">
//                   {((streams.lora.throughput || 0) / 1024).toFixed(2)} KB/s
//                 </div>
//                 <div className="text-xs font-mono font-semibold text-muted-foreground">
//                   {((streams.lora.bytesSent || 0) / 1024).toFixed(1)} KB
//                 </div>
//                 <div className="text-xs font-mono font-semibold text-muted-foreground">
//                   {Math.floor((streams.lora.uptime || 0) / 60)}:{String(Math.floor((streams.lora.uptime || 0) % 60)).padStart(2, '0')}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Segmented Control Tabs */}
//           <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full md:w-auto">
//             <TabsList className="flex p-1 bg-muted/50 rounded-xl h-auto border border-border">
              
//               <TabsTrigger
//                 value="survey"
//                 className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all 
//                            text-muted-foreground hover:text-foreground
//                            data-[state=active]:text-foreground
//                            data-[state=active]:bg-card
//                            shadow-none data-[state=active]:shadow-sm"
//               >
//                 <Activity className="w-4 h-4" />
//                 Survey Status
//               </TabsTrigger>
              
//               {/* <TabsTrigger
//                 value="gnss"
//                 className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all 
//                            text-muted-foreground hover:text-foreground
//                            data-[state=active]:text-foreground
//                            data-[state=active]:bg-card
//                            shadow-none data-[state=active]:shadow-sm"
//               >
//                 <Satellite className="w-4 h-4" />
//                 GNSS Status
//               </TabsTrigger> */}

//             </TabsList>
//           </Tabs>
//         </div>

//         {/* Main Content Viewport */}
//         <div className="relative w-full">
//           <Tabs value={activeTab} className="w-full">
            
//             <TabsContent value="survey" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-[0.99] duration-300 ease-out">
//               <SurveyStatus />
//             </TabsContent>

//             {/* <TabsContent value="gnss" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-[0.99] duration-300 ease-out">
//               <GNSSStatusTab />
//             </TabsContent> */}

//           </Tabs>
//         </div>

//       </div>
//     </div>
//   );
// };




















































































import React, { useMemo, useState, useEffect } from 'react';
import { Tabs, TabsContent } from './ui/tabs';
import { SurveyStatus } from './dashboard/SurveyStatus';
import { useGNSS } from '../../context/GNSSContext';
import { ChevronRight, Clock, History } from 'lucide-react';

export const DashboardScreen: React.FC = () => {
  const [activeTab] = useState<'survey' | 'gnss'>('survey');
  const { streams, surveyHistory, logs } = useGNSS();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep time updated for a "live" feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const latestHistoryItem = useMemo(() => {
    const latestSurvey = surveyHistory.reduce<any | null>((latest, entry) => {
      if (!latest) return entry;
      const latestTime = new Date(latest.timestamp).getTime();
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime > latestTime ? entry : latest;
    }, null);

    const latestLog = logs.reduce<any | null>((latest, entry) => {
      if (!latest) return entry;
      const latestTime = new Date(latest.timestamp).getTime();
      const entryTime = new Date(entry.timestamp).getTime();
      return entryTime > latestTime ? entry : latest;
    }, null);

    if (!latestSurvey && !latestLog) return null;

    const surveyTime = latestSurvey ? new Date(latestSurvey.timestamp).getTime() : -1;
    const logTime = latestLog ? new Date(latestLog.timestamp).getTime() : -1;

    if (logTime > surveyTime) {
      const ts = new Date(latestLog.timestamp);
      return {
        kind: 'log' as const,
        title: `Log • ${latestLog.level?.toUpperCase?.() ?? 'INFO'}`,
        subtitle: latestLog.message ?? '—',
        timeLabel: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    const ts = new Date(latestSurvey.timestamp);
    const eventType =
      latestSurvey.eventType ?? (latestSurvey.success ? 'completed' : 'error');

    const baseTitle = `Survey - ${String(eventType).toUpperCase()}`;
    const accuracySuffix =
      typeof latestSurvey.finalAccuracy === 'number' && latestSurvey.finalAccuracy > 0
        ? ` - ${latestSurvey.finalAccuracy.toFixed(2)}cm`
        : '';

    return {
      kind: 'survey' as const,
      title: `${baseTitle}${accuracySuffix}`,
      subtitle: latestSurvey.message ?? `ID: ${latestSurvey.id ?? '—'}`,
      timeLabel: ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }, [surveyHistory, logs]);

  const openHistory = () => {
    window.dispatchEvent(new CustomEvent('navigate-to-history'));
  };

  return (
    <div className="min-h-full bg-slate-50 dark:bg-[#09090b] text-foreground font-sans transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8">

        <Tabs value={activeTab} className="w-full">
          
          {/* ── Unified Control Deck Header ── */}
          <div className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden mb-8">
            
            {/* Top Section: Title & Status Indicators */}
            <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border">
              
              <div className="space-y-1">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="text-muted-foreground text-sm font-medium">
                  Real-time positioning and system overview.
                </p>
              </div>

              {/* Enhanced Visual Replacements for the removed elements */}
              <div className="w-full md:w-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/20 border border-border/60">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs font-mono font-medium text-muted-foreground tabular-nums">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={openHistory}
                    className="group flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-muted/15 hover:bg-muted/25 transition-colors shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 w-full sm:w-[300px] md:w-[320px]"
                    aria-label="Open history"
                  >
                    <div className="p-2 rounded-xl bg-background/70 border border-border/60 group-hover:bg-background/90 transition-colors">
                      <History className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Recent history
                        </div>
                        {latestHistoryItem && (
                          <div className="text-[10px] font-mono font-semibold text-muted-foreground tabular-nums">
                            {latestHistoryItem.timeLabel}
                          </div>
                        )}
                      </div>

                      <div className="text-sm font-semibold text-foreground truncate">
                        {latestHistoryItem ? latestHistoryItem.title : 'No history yet'}
                      </div>

                      <div className="text-xs font-medium text-muted-foreground truncate hidden lg:block">
                        {latestHistoryItem ? latestHistoryItem.subtitle : 'Tap to view surveys and logs'}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Section: Telemetry Grid */}
            {(streams.ntrip.active || streams.lora.enabled) && (
              <div className="flex flex-col lg:flex-row bg-muted/5 divide-y lg:divide-y-0 lg:divide-x divide-border">
                
                {/* NTRIP Data */}
                {streams.ntrip.active && (
                  <div className="flex-1 p-4 md:px-8 flex flex-row items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">NTRIP Stream</div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="text-xs font-mono font-bold text-foreground">
                        {((streams.ntrip.throughput || 0) / 1024).toFixed(2)} KB/s
                      </div>
                      <div className="text-xs font-mono font-semibold text-muted-foreground hidden sm:block">
                        {((streams.ntrip.dataSent || 0) / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}

                {/* LORA Data */}
                {streams.lora.enabled && (
                  <div className="flex-1 p-4 md:px-8 flex flex-row items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LoRa Radio</div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <div className="text-xs font-mono font-bold text-foreground">
                        {((streams.lora.throughput || 0) / 1024).toFixed(2)} KB/s
                      </div>
                      <div className="text-xs font-mono font-semibold text-muted-foreground hidden sm:block">
                        {((streams.lora.bytesSent || 0) / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            )}
          </div>

          {/* ── Main Content Viewport ── */}
          <div className="relative w-full">
            <TabsContent value="survey" className="m-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
              <SurveyStatus />
            </TabsContent>
          </div>

        </Tabs>
      </div>
    </div>
  );
};
