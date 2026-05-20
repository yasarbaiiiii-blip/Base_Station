import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { SurveyStatus } from './dashboard/SurveyStatus';
import { GNSSStatusTab } from './dashboard/GNSSStatusTab';
import { Satellite, Activity } from 'lucide-react';
import { useGNSS } from '../../context/GNSSContext';

export const DashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'survey' | 'gnss'>('survey');
  const { streams } = useGNSS();

  return (
    <div className="min-h-full bg-background text-foreground font-sans transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto p-6 md:p-8 md:pt-10">

        {/* Top Navigation & Header Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-border">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-25"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                Live Telemetry
              </span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
            {streams.ntrip.active && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-300">NTRIP</div>
                <div className="text-xs font-mono font-bold text-foreground">
                  {((streams.ntrip.throughput || 0) / 1024).toFixed(2)} KB/s
                </div>
                <div className="text-xs font-mono font-semibold text-muted-foreground">
                  {((streams.ntrip.dataSent || 0) / 1024).toFixed(1)} KB
                </div>
                <div className="text-xs font-mono font-semibold text-muted-foreground">
                  {Math.floor((streams.ntrip.uptime || 0) / 60)}:{String(Math.floor((streams.ntrip.uptime || 0) % 60)).padStart(2, '0')}
                </div>
              </div>
            )}

            {streams.lora.enabled && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card/80 px-3 py-2">
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">LORA</div>
                <div className="text-xs font-mono font-bold text-foreground">
                  {((streams.lora.throughput || 0) / 1024).toFixed(2)} KB/s
                </div>
                <div className="text-xs font-mono font-semibold text-muted-foreground">
                  {((streams.lora.bytesSent || 0) / 1024).toFixed(1)} KB
                </div>
                <div className="text-xs font-mono font-semibold text-muted-foreground">
                  {Math.floor((streams.lora.uptime || 0) / 60)}:{String(Math.floor((streams.lora.uptime || 0) % 60)).padStart(2, '0')}
                </div>
              </div>
            )}
          </div>

          {/* Segmented Control Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full md:w-auto">
            <TabsList className="flex p-1 bg-muted/50 rounded-xl h-auto border border-border">
              
              <TabsTrigger
                value="survey"
                className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all 
                           text-muted-foreground hover:text-foreground
                           data-[state=active]:text-foreground
                           data-[state=active]:bg-card
                           shadow-none data-[state=active]:shadow-sm"
              >
                <Activity className="w-4 h-4" />
                Survey Status
              </TabsTrigger>
              
              {/* <TabsTrigger
                value="gnss"
                className="flex items-center gap-2.5 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all 
                           text-muted-foreground hover:text-foreground
                           data-[state=active]:text-foreground
                           data-[state=active]:bg-card
                           shadow-none data-[state=active]:shadow-sm"
              >
                <Satellite className="w-4 h-4" />
                GNSS Status
              </TabsTrigger> */}

            </TabsList>
          </Tabs>
        </div>

        {/* Main Content Viewport */}
        <div className="relative w-full">
          <Tabs value={activeTab} className="w-full">
            
            <TabsContent value="survey" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-[0.99] duration-300 ease-out">
              <SurveyStatus />
            </TabsContent>

            {/* <TabsContent value="gnss" className="m-0 focus-visible:outline-none animate-in fade-in zoom-in-[0.99] duration-300 ease-out">
              <GNSSStatusTab />
            </TabsContent> */}

          </Tabs>
        </div>

      </div>
    </div>
  );
};
