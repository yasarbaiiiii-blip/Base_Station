// import React, { useState } from 'react';
// import { useGNSS } from '../../context/GNSSContext';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
// import { Button } from './ui/button';
// import { Input } from './ui/input';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
// import { Badge } from './ui/badge';
// import { ScrollArea } from './ui/scroll-area';
// import { 
//   History, 
//   FileText, 
//   Download, 
//   Search, 
//   Filter, 
//   CheckCircle2, 
//   XCircle,
//   Calendar,
//   Clock,
//   MapPin,
//   Share2,
//   Trash2,
//   AlertCircle,
//   Info,
//   AlertTriangle,
//   Target
// } from 'lucide-react';
// import { toast } from 'sonner';

// export const HistoryScreen: React.FC = () => {
//   const { surveyHistory, logs, clearLogs } = useGNSS();
//   const [searchQuery, setSearchQuery] = useState('');
//   const [logLevel, setLogLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all');
//   const [autoScroll, setAutoScroll] = useState(true);

//   const filteredLogs = logs.filter((log) => {
//     const matchesLevel = logLevel === 'all' || log.level === logLevel;
//     const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesLevel && matchesSearch;
//   });

//   const exportSurvey = (survey: typeof surveyHistory[0]) => {
//     const csvContent = `Survey Export
// Timestamp,${survey.timestamp.toISOString()}
// Duration,${survey.duration} seconds
// Final Accuracy,${survey.finalAccuracy.toFixed(4)} meters
// Latitude,${survey.coordinates.latitude.toFixed(8)}
// Longitude,${survey.coordinates.longitude.toFixed(8)}
// Altitude,${survey.coordinates.altitude.toFixed(3)} meters
// Status,${survey.success ? 'Success' : 'Failed'}`;

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `survey_${survey.timestamp.toISOString().split('T')[0]}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('Survey exported successfully');
//   };

//   const shareSurvey = (survey: typeof surveyHistory[0]) => {
//     const text = `Survey Result
// Lat: ${survey.coordinates.latitude.toFixed(8)}
// Lon: ${survey.coordinates.longitude.toFixed(8)}
// Alt: ${survey.coordinates.altitude.toFixed(3)}m
// Accuracy: ${survey.finalAccuracy.toFixed(4)}m`;

//     if (navigator.share) {
//       navigator.share({ text });
//     } else {
//       navigator.clipboard.writeText(text);
//       toast.success('Survey data copied to clipboard');
//     }
//   };

//   const exportLogs = () => {
//     const logContent = filteredLogs
//       .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
//       .join('\n');

//     const blob = new Blob([logContent], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `gnss_logs_${new Date().toISOString().split('T')[0]}.txt`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success('Logs exported successfully');
//   };

//   const getLevelIcon = (level: string) => {
//     switch (level) {
//       case 'error':
//         return <AlertCircle className="size-4 text-red-500" />;
//       case 'warning':
//         return <AlertTriangle className="size-4 text-yellow-500" />;
//       default:
//         return <Info className="size-4 text-blue-500" />;
//     }
//   };

//   const getLevelColor = (level: string) => {
//     switch (level) {
//       case 'error':
//         return 'text-red-600 dark:text-red-400';
//       case 'warning':
//         return 'text-yellow-600 dark:text-yellow-400';
//       default:
//         return 'text-blue-600 dark:text-blue-400';
//     }
//   };

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold mb-2">History & Logs</h1>
//         <p className="text-slate-600 dark:text-slate-400">
//           Review past survey sessions and system events
//         </p>
//       </div>

//       <Tabs defaultValue="surveys" className="w-full">
//         <TabsList className="grid w-full grid-cols-2 mb-6">
//           <TabsTrigger value="surveys" className="gap-2">
//             <History className="size-4" />
//             Survey History
//           </TabsTrigger>
//           <TabsTrigger value="logs" className="gap-2">
//             <FileText className="size-4" />
//             System Logs
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="surveys" className="space-y-4">
//           {/* Filters */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Filters</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex gap-3">
//                 <div className="relative flex-1">
//                   <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                   <Input
//                     placeholder="Search surveys..."
//                     className="pl-10"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <Button variant="outline" className="gap-2">
//                   <Filter className="size-4" />
//                   Filter
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Survey List */}
//           <div className="space-y-3">
//             {surveyHistory.map((survey) => (
//               <Card key={survey.id}>
//                 <CardContent className="pt-6">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-3">
//                         {survey.success ? (
//                           <CheckCircle2 className="size-5 text-green-500" />
//                         ) : (
//                           <XCircle className="size-5 text-red-500" />
//                         )}
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <Badge variant={survey.success ? 'default' : 'destructive'} className={survey.success ? 'bg-green-500' : ''}>
//                               {survey.success ? 'Success' : 'Failed'}
//                             </Badge>
//                             <span className="text-sm text-slate-600 dark:text-slate-400">
//                               Accuracy: {(survey.finalAccuracy * 100).toFixed(2)} cm
//                             </span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="grid md:grid-cols-2 gap-4 mb-4">
//                         <div className="space-y-2">
//                           <div className="flex items-center gap-2 text-sm">
//                             <Calendar className="size-4 text-slate-400" />
//                             <span className="text-slate-600 dark:text-slate-400">Date:</span>
//                             <span className="font-mono">{survey.timestamp.toLocaleDateString()}</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm">
//                             <Clock className="size-4 text-slate-400" />
//                             <span className="text-slate-600 dark:text-slate-400">Time:</span>
//                             <span className="font-mono">{survey.timestamp.toLocaleTimeString()}</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm">
//                             <Clock className="size-4 text-slate-400" />
//                             <span className="text-slate-600 dark:text-slate-400">Duration:</span>
//                             <span className="font-mono">{Math.floor(survey.duration / 60)}:{(survey.duration % 60).toString().padStart(2, '0')}</span>
//                           </div>
//                           <div className="flex items-center gap-2 text-sm">
//                             <Target className="size-4 text-slate-400" />
//                             <span className="text-slate-600 dark:text-slate-400">Target Accuracy:</span>
//                             <span className="font-mono">{(survey.targetAccuracy * 100).toFixed(0)}cm</span>
//                           </div>
//                         </div>

//                         <div className="space-y-1">
//                           <div className="flex items-start gap-2 text-sm">
//                             <MapPin className="size-4 text-slate-400 mt-0.5" />
//                             <div className="font-mono text-xs">
//                               <div>Lat: {survey.coordinates.latitude.toFixed(8)}</div>
//                               <div>Lon: {survey.coordinates.longitude.toFixed(8)}</div>
//                               <div>Alt: {survey.coordinates.altitude.toFixed(3)}m</div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex gap-2">
//                         <Button variant="outline" size="sm" className="gap-2" onClick={() => exportSurvey(survey)}>
//                           <Download className="size-4" />
//                           Export CSV
//                         </Button>
//                         <Button variant="outline" size="sm" className="gap-2" onClick={() => shareSurvey(survey)}>
//                           <Share2 className="size-4" />
//                           Share
//                         </Button>
//                       </div>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}

//             {surveyHistory.length === 0 && (
//               <Card>
//                 <CardContent className="py-12 text-center">
//                   <History className="size-12 mx-auto mb-4 text-slate-400" />
//                   <h3 className="text-lg font-semibold mb-2">No Survey History</h3>
//                   <p className="text-slate-600 dark:text-slate-400">
//                     Completed surveys will appear here
//                   </p>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </TabsContent>

//         <TabsContent value="logs" className="space-y-4">
//           {/* Log Controls */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Log Controls</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex gap-3">
//                 <div className="relative flex-1">
//                   <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
//                   <Input
//                     placeholder="Search logs..."
//                     className="pl-10"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                   />
//                 </div>
//                 <Button variant="outline" className="gap-2" onClick={exportLogs}>
//                   <Download className="size-4" />
//                   Export
//                 </Button>
//                 <Button variant="outline" className="gap-2" onClick={clearLogs}>
//                   <Trash2 className="size-4" />
//                   Clear
//                 </Button>
//               </div>

//               <div className="flex gap-2">
//                 <Button
//                   variant={logLevel === 'all' ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => setLogLevel('all')}
//                 >
//                   All
//                 </Button>
//                 <Button
//                   variant={logLevel === 'error' ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => setLogLevel('error')}
//                   className={logLevel === 'error' ? 'bg-red-500' : ''}
//                 >
//                   Errors
//                 </Button>
//                 <Button
//                   variant={logLevel === 'warning' ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => setLogLevel('warning')}
//                   className={logLevel === 'warning' ? 'bg-yellow-500' : ''}
//                 >
//                   Warnings
//                 </Button>
//                 <Button
//                   variant={logLevel === 'info' ? 'default' : 'outline'}
//                   size="sm"
//                   onClick={() => setLogLevel('info')}
//                   className={logLevel === 'info' ? 'bg-blue-500' : ''}
//                 >
//                   Info
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Log Viewer */}
//           <Card>
//             <CardHeader>
//               <div className="flex justify-between items-center">
//                 <div>
//                   <CardTitle className="text-lg">System Logs</CardTitle>
//                   <CardDescription>
//                     {filteredLogs.length} log {filteredLogs.length === 1 ? 'entry' : 'entries'}
//                   </CardDescription>
//                 </div>
//                 <Badge variant="outline" className="gap-2">
//                   Auto-scroll: {autoScroll ? 'On' : 'Off'}
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ScrollArea className="h-96 w-full rounded-lg border bg-slate-50 dark:bg-slate-900">
//                 <div className="p-4 space-y-2 font-mono text-sm">
//                   {filteredLogs.map((log) => (
//                     <div
//                       key={log.id}
//                       className="flex items-start gap-3 p-2 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors"
//                     >
//                       {getLevelIcon(log.level)}
//                       <div className="flex-1 min-w-0">
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-xs text-slate-500">
//                             {log.timestamp.toLocaleTimeString()}
//                           </span>
//                           <Badge
//                             variant="outline"
//                             className={`text-xs ${getLevelColor(log.level)}`}
//                           >
//                             {log.level.toUpperCase()}
//                           </Badge>
//                         </div>
//                         <div className="text-slate-700 dark:text-slate-300 break-words">
//                           {log.message}
//                         </div>
//                       </div>
//                     </div>
//                   ))}

//                   {filteredLogs.length === 0 && (
//                     <div className="text-center py-12 text-slate-500">
//                       <FileText className="size-12 mx-auto mb-4 opacity-50" />
//                       <p>No logs found matching your filters</p>
//                     </div>
//                   )}
//                 </div>
//               </ScrollArea>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };






























import React, { useState, useRef, useEffect } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  History, 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  Target,
  Terminal
} from 'lucide-react';
import { toast } from 'sonner';

export const HistoryScreen: React.FC = () => {
  const { surveyHistory, logs, clearLogs } = useGNSS();
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  
  // Real-time terminal auto-scroll engine
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Automatically scroll to the bottom of logs whenever they update
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const exportSurvey = (survey: typeof surveyHistory[0]) => {
    const csvContent = `Survey Export\nTimestamp,${survey.timestamp.toISOString()}\nDuration,${survey.duration} seconds\nFinal Accuracy,${survey.finalAccuracy.toFixed(4)} cm\nLatitude,${survey.coordinates.latitude.toFixed(8)}\nLongitude,${survey.coordinates.longitude.toFixed(8)}\nAltitude,${survey.coordinates.altitude.toFixed(3)} meters\nStatus,${survey.success ? 'Success' : 'Failed'}`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey_${survey.timestamp.toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Survey exported successfully');
  };

  const shareSurvey = (survey: typeof surveyHistory[0]) => {
    const text = `Survey Result\nLat: ${survey.coordinates.latitude.toFixed(8)}\nLon: ${survey.coordinates.longitude.toFixed(8)}\nAlt: ${survey.coordinates.altitude.toFixed(3)}m\nAccuracy: ${survey.finalAccuracy.toFixed(4)}cm`;
    if (navigator.share) { navigator.share({ text }); } 
    else { navigator.clipboard.writeText(text); toast.success('Survey data copied to clipboard'); }
  };

  const exportLogs = () => {
    const logContent = filteredLogs.map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gnss_logs_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported successfully');
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="size-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10';
      case 'warning': return 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10';
    }
  };

  // Tier 2 & 3 depth classes
  const inputClasses = "h-11 text-sm font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100 shadow-sm";
  const boxClasses = "p-4 md:p-5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50 shadow-sm";

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-screen animate-in fade-in duration-300 pb-24">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">History & Logs</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Review past survey sessions and hardware diagnostic events
          </p>
        </div>
      </div>

      <Tabs defaultValue="surveys" className="w-full flex flex-col">
        <div className="pb-5">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800/60 h-12 max-w-md">
            <TabsTrigger value="surveys" className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all h-full">
              <History className="size-4" /> SURVEYS
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 rounded-lg data-[state=active]:shadow-sm data-[state=active]:text-slate-900 dark:data-[state=active]:text-white transition-all h-full">
              <FileText className="size-4" /> SYSTEM LOGS
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── SURVEYS TAB ── */}
        <TabsContent value="surveys" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <Card className="bg-white dark:bg-[#020617] border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-5 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search surveys by date or ID..."
                  className={`${inputClasses} pl-10`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-11 px-5 gap-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 shadow-sm font-semibold rounded-lg shrink-0">
                <Filter className="size-4" />
                Filter Options
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {surveyHistory.map((survey) => (
              <Card key={survey.id} className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-all hover:border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border ${survey.success ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30' : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'}`}>
                        {survey.success ? <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-500" /> : <XCircle className="size-6 text-red-600 dark:text-red-500" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50">Survey Complete</h3>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest">{survey.id}</p>
                      </div>
                    </div>
                    <Badge variant={survey.success ? 'default' : 'destructive'} className={`text-[10px] font-bold px-3 py-1.5 shadow-sm uppercase tracking-widest ${survey.success ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}>
                      {survey.success ? 'TARGET MET' : 'TARGET FAILED'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className={boxClasses}>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Date</span>
                      <div className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{survey.timestamp.toLocaleDateString()}</div>
                    </div>
                    <div className={boxClasses}>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Duration</span>
                      <div className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{Math.floor(survey.duration / 60)}:{(survey.duration % 60).toString().padStart(2, '0')}</div>
                    </div>
                    <div className={boxClasses}>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1">Target</span>
                      <div className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{(survey.targetAccuracy * 100).toFixed(0)} cm</div>
                    </div>
                    <div className={`${boxClasses} border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5`}>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-1">Final Accuracy</span>
                      <div className="text-sm font-bold font-mono text-blue-700 dark:text-blue-300">{(survey.finalAccuracy * 100).toFixed(2)} cm</div>
                    </div>
                  </div>

                  <div className="mb-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="size-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Final Geodetic Position</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                      <div className="pt-2 sm:pt-0 sm:px-4 first:pl-0">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Latitude</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{survey.coordinates.latitude.toFixed(8)}</span>
                      </div>
                      <div className="pt-2 sm:pt-0 sm:px-4">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Longitude</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{survey.coordinates.longitude.toFixed(8)}</span>
                      </div>
                      <div className="pt-2 sm:pt-0 sm:px-4">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Altitude</span>
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{survey.coordinates.altitude.toFixed(3)} <span className="text-xs font-medium text-slate-500">m</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 font-bold text-[11px] tracking-wider" onClick={() => exportSurvey(survey)}>
                      <Download className="size-4" /> EXPORT CSV
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 font-bold text-[11px] tracking-wider" onClick={() => shareSurvey(survey)}>
                      <Share2 className="size-4" /> SHARE DATA
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {surveyHistory.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <History className="size-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Survey History</h3>
                <p className="text-sm font-medium text-slate-500 max-w-xs mt-1">Completed surveys will automatically appear here once finished.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── LOGS TAB ── */}
        <TabsContent value="logs" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="Search system logs..." className={`${inputClasses} pl-10`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 font-semibold text-sm" onClick={exportLogs}>
                    <Download className="size-4" /> Export
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors active:scale-95 font-semibold text-sm" onClick={clearLogs}>
                    <Trash2 className="size-4" /> Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
                {(['all', 'info', 'warning', 'error'] as const).map((level) => (
                  <button key={level} onClick={() => setLogLevel(level)} className={`flex-1 min-w-[80px] h-9 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 ${logLevel === level ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{level}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terminal Viewer */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 p-4 md:p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="size-5 text-blue-500" />
                <CardTitle className="text-base font-bold dark:text-slate-50 uppercase tracking-widest">Hardware Terminal</CardTitle>
              </div>
              <div onClick={() => setAutoScroll(!autoScroll)} className="flex items-center gap-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full ${autoScroll ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`} />
                {autoScroll ? 'AUTO-SCROLL ON' : 'AUTO-SCROLL OFF'}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full bg-slate-50 dark:bg-slate-950/80">
                <div className="p-4 space-y-1.5 font-mono text-xs">
                  {/* Map logs oldest-to-newest so scrolling works naturally */}
                  {filteredLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                      <div className="mt-0.5 shrink-0">{getLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">[{log.timestamp.toLocaleTimeString()}]</span>
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none ${getLevelColor(log.level)}`}>{log.level}</Badge>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 break-words leading-relaxed font-medium">
                          {log.message}
                        </div>
                      </div>
                    </div>
                  ))}
                  {/* Scroll Target */}
                  <div ref={logsEndRef} className="h-1" />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>
    </div>
  );
};