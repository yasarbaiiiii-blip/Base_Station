import React, { useState, useRef, useEffect } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
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
  CheckCircle2, 
  MapPin,
  Share2,
  Trash2,
  AlertCircle,
  Info,
  AlertTriangle,
  Target,
  Terminal,
  PlayCircle,
  StopCircle,
  ChevronDown,
  ListChecks,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Custom Accordion Component to cleanly handle internal open/close state
const SurveyAccordionCard = ({ survey, style, selectionMode, isSelected, onSelect, onShare }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const EventIcon = style.icon;

  return (
    <Card className="bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
      
      {/* ── Header Layout ── */}
      <div 
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 ${isExpanded ? 'border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/50' : ''}`}
        onClick={() => {
          if (!selectionMode) {
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-4">
          
          {/* Checkbox for Selectable Delete */}
          {selectionMode && (
            <div 
              onClick={(e) => { e.stopPropagation(); onSelect(); }}
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}
            >
              {isSelected && <CheckCircle2 className="size-4 text-white" />}
            </div>
          )}

          {/* Icon Box */}
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl border ${style.bg} ${style.border}`}>
            <EventIcon className={`size-5 ${style.text}`} />
          </div>

          {/* Title, ID & Date */}
          <div className="flex flex-col">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">Survey Event</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{survey.id}</span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {survey.timestamp.toLocaleDateString()} {survey.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Side: Badge & Chevron */}
        <div className="flex items-center gap-4 mt-3 sm:mt-0 pl-16 sm:pl-0">
          <Badge variant="outline" className={`text-[10px] font-bold px-3 py-1 uppercase tracking-widest ${style.bg} ${style.border} ${style.text}`}>
            {style.label}
          </Badge>
          {!selectionMode && (
             <ChevronDown className={`size-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* ── Expandable Body ── */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded && !selectionMode ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <CardContent className="p-5 space-y-5">
          
          {survey.message && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{survey.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Duration</span>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{Math.floor(survey.duration / 60)}:{(survey.duration % 60).toString().padStart(2, '0')}</div>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/50">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Target</span>
              <div className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{(survey.targetAccuracy).toFixed(0)} cm</div>
            </div>
            <div className={`p-3 rounded-xl border col-span-2 ${style.bg} ${style.border}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${style.text}`}>Final Accuracy</span>
              <div className={`text-base font-black font-mono ${style.text}`}>{(survey.finalAccuracy).toFixed(2)} cm</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Global Coordinates */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="size-4 text-blue-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Global Coordinates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="pt-2 sm:pt-0 sm:px-2 first:pl-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Latitude</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.coordinates?.latitude?.toFixed(8) || "0.00000000"}</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Longitude</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.coordinates?.longitude?.toFixed(8) || "0.00000000"}</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Altitude</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.coordinates?.altitude?.toFixed(3) || "0.000"} <span className="text-[10px] text-slate-500">m</span></span>
                </div>
              </div>
            </div>

            {/* Local Coordinates */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700 dark:text-slate-300">Local Coordinates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800">
                <div className="pt-2 sm:pt-0 sm:px-2 first:pl-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Mean X</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.localCoordinates?.meanX?.toFixed(4) || "0.0000"} <span className="text-[10px] text-slate-500">m</span></span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Mean Y</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.localCoordinates?.meanY?.toFixed(4) || "0.0000"} <span className="text-[10px] text-slate-500">m</span></span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Mean Z</span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">{survey.localCoordinates?.meanZ?.toFixed(4) || "0.0000"} <span className="text-[10px] text-slate-500">m</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 gap-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active:scale-95 font-bold text-[11px] tracking-wider" onClick={() => onShare(survey)}>
              <Share2 className="size-4 mr-2" /> SHARE DATA
            </Button>
          </div>

        </CardContent>
      </div>
    </Card>
  );
};

export const HistoryScreen: React.FC = () => {
  const { surveyHistory, logs, clearLogs, deleteSurveys } = useGNSS();
  
  // Real-time terminal auto-scroll engine
  const logsEndRef = useRef<HTMLDivElement>(null);

  // States for Logs Tab
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  // States for Survey Tab
  const [surveySearchQuery, setSurveySearchQuery] = useState('');
  const [surveyFilter, setSurveyFilter] = useState<'all' | 'started' | 'completed' | 'stopped' | 'error'>('all');
  
  // Selection States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter Logic for Logs
  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = log.message.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Logic: Cast and Filter Surveys based on dynamic Event Type
  const surveys = surveyHistory as Array<typeof surveyHistory[0] & { eventType?: string; message?: string }>;
  const filteredSurveys = surveys.filter((survey) => {
    const type = survey.eventType || (survey.success ? 'completed' : 'error');
    const matchesFilter = surveyFilter === 'all' || type === surveyFilter;
    const matchesSearch = survey.id.toLowerCase().includes(surveySearchQuery.toLowerCase()) || 
                          (survey.message || '').toLowerCase().includes(surveySearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Toggle single item selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedIds.length === filteredSurveys.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSurveys.map(s => s.id));
    }
  };

  // Execute bulk delete
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    deleteSurveys(selectedIds);
    setSelectedIds([]);
    setSelectionMode(false);
  };


  // Logic: Custom file name prompt for Exporting Surveys
  const handleExportSurveys = () => {
    if (filteredSurveys.length === 0) {
      toast.error('No survey records found to export');
      return;
    }
    const defaultName = `surveys_${new Date().toISOString().split('T')[0]}`;
    const fileName = window.prompt("Enter file name for survey export:", defaultName);
    if (!fileName) return; // User cancelled
    
    const csvHeader = "ID,Timestamp,Event,Duration(s),TargetAcc(cm),FinalAcc(cm),Latitude,Longitude,Altitude,MeanX,MeanY,MeanZ,Message\n";
    const csvRows = filteredSurveys.map(s => {
      const event = s.eventType || (s.success ? 'completed' : 'error');
      const local = (s as any).localCoordinates || { meanX: 0, meanY: 0, meanZ: 0 };
      return `${s.id},${s.timestamp.toISOString()},${event.toUpperCase()},${s.duration},${s.targetAccuracy.toFixed(0)},${s.finalAccuracy.toFixed(2)},${s.coordinates.latitude},${s.coordinates.longitude},${s.coordinates.altitude},${local.meanX},${local.meanY},${local.meanZ},"${s.message || ''}"`;
    });
    
    const blob = new Blob([csvHeader + csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Survey export successful');
  };

  const shareSurvey = (survey: typeof surveys[0]) => {
    const text = `Survey Result [${survey.id}]\nLat: ${survey.coordinates.latitude.toFixed(8)}\nLon: ${survey.coordinates.longitude.toFixed(8)}\nAlt: ${survey.coordinates.altitude.toFixed(3)}m\nAccuracy: ${survey.finalAccuracy.toFixed(2)}cm`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Survey data copied to clipboard');
    }
  };

  // Logic: Custom file name prompt for Exporting Logs
  const handleExportLogs = () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs found to export');
      return;
    }
    const defaultName = `gnss_logs_${new Date().toISOString().split('T')[0]}`;
    const fileName = window.prompt("Enter file name for logs export:", defaultName);
    if (!fileName) return;

    const logContent = filteredLogs.map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs export successful');
  };

  // Helper for Log Styling
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

  // Helper for Survey Event Styling
  const getSurveyStyles = (type: string) => {
    switch (type) {
      case 'started':
        return {
          bg: 'bg-blue-50 dark:bg-blue-500/10',
          border: 'border-blue-200 dark:border-blue-500/30',
          text: 'text-blue-600 dark:text-blue-500',
          icon: PlayCircle,
          label: 'STARTED'
        };
      case 'completed':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-500/10',
          border: 'border-emerald-200 dark:border-emerald-500/30',
          text: 'text-emerald-600 dark:text-emerald-500',
          icon: CheckCircle2,
          label: 'COMPLETED'
        };
      case 'stopped':
        return {
          bg: 'bg-amber-50 dark:bg-amber-500/10',
          border: 'border-amber-200 dark:border-amber-500/30',
          text: 'text-amber-600 dark:text-amber-500',
          icon: StopCircle,
          label: 'STOPPED'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-500/10',
          border: 'border-red-200 dark:border-red-500/30',
          text: 'text-red-600 dark:text-red-500',
          icon: AlertTriangle,
          label: 'ERROR'
        };
      default:
        return {
          bg: 'bg-slate-50 dark:bg-slate-500/10',
          border: 'border-slate-200 dark:border-slate-500/30',
          text: 'text-slate-600 dark:text-slate-400',
          icon: Info,
          label: 'RECORD'
        };
    }
  };

  // UI Tier Classes
  const inputClasses = "h-11 text-sm font-medium bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:border-blue-500 transition-colors text-slate-900 dark:text-slate-100 shadow-sm";

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
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search surveys by date or ID..."
                    className={`${inputClasses} pl-10`}
                    value={surveySearchQuery}
                    onChange={(e) => setSurveySearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Dynamic Toolbar based on Selection Mode */}
                {!selectionMode ? (
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-11 px-4 border-slate-200 dark:border-slate-800 font-semibold" onClick={handleExportSurveys}>
                      <Download className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Export</span>
                    </Button>
                    <Button variant="outline" className="h-11 px-4 border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold" onClick={() => setSelectionMode(true)}>
                      <ListChecks className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Select</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in fade-in zoom-in-95">
                    <Button variant="outline" className="h-11 px-4 border-slate-200 dark:border-slate-800 font-semibold" onClick={handleSelectAll}>
                      {selectedIds.length === filteredSurveys.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button variant="destructive" className="h-11 px-4 font-bold" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                      <Trash2 className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                    </Button>
                    <Button variant="outline" className="h-11 px-3 border-slate-200 dark:border-slate-800" onClick={() => { setSelectionMode(false); setSelectedIds([]); }}>
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Survey State Filters */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
                {(['all', 'started', 'completed', 'stopped', 'error'] as const).map((level) => (
                  <button 
                    key={level} 
                    onClick={() => setSurveyFilter(level)} 
                    className={`flex-1 min-w-[70px] h-9 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 ${
                      surveyFilter === level 
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredSurveys.map((survey) => {
              const type = survey.eventType || (survey.success ? 'completed' : 'error');
              const style = getSurveyStyles(type);
              const isSelected = selectedIds.includes(survey.id);

              return (
                <SurveyAccordionCard 
                  key={survey.id} 
                  survey={survey} 
                  style={style} 
                  selectionMode={selectionMode} 
                  isSelected={isSelected} 
                  onSelect={() => toggleSelection(survey.id)}
                  onShare={shareSurvey}
                />
              );
            })}

            {filteredSurveys.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <History className="size-12 text-slate-300 dark:text-slate-700 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Survey Records</h3>
                <p className="text-sm font-medium text-slate-500 max-w-xs mt-1">Change your filters or start a new survey to populate history.</p>
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
                  <Input placeholder="Search system logs..." className={`${inputClasses} pl-10`} value={logSearchQuery} onChange={(e) => setLogSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm" onClick={handleExportLogs}>
                    <Download className="size-4" /> Export
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 font-semibold text-sm" onClick={clearLogs}>
                    <Trash2 className="size-4" /> Clear
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800/80">
                {(['all', 'info', 'warning', 'error'] as const).map((level) => (
                  <button key={level} onClick={() => setLogLevel(level)} className={`flex-1 min-w-[80px] h-9 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${logLevel === level ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 hover:text-slate-700'}`}>{level}</button>
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
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full bg-slate-50 dark:bg-slate-950/80">
                <div className="p-4 space-y-1.5 font-mono text-xs">
                  {/* Map logs oldest-to-newest so scrolling works naturally */}
                  {filteredLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                      <div className="mt-0.5 shrink-0">{getLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-[10px] font-medium text-slate-400">[{log.timestamp.toLocaleTimeString()}]</span>
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none ${getLevelColor(log.level)}`}>{log.level}</Badge>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 break-words leading-relaxed font-medium">{log.message}</div>
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