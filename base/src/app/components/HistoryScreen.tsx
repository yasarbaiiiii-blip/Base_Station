import React, { useState, useRef, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
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
  X,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Custom Accordion Component to cleanly handle internal open/close state
const SurveyAccordionCard = ({ survey, style, selectionMode, isSelected, onSelect, onShare }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const EventIcon = style.icon;

  // Mathematically calculate the exact start time of the survey
  const startTime = new Date(survey.timestamp.getTime() - (survey.duration * 1000));

  return (
    <Card className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden transition-all hover:bg-muted/10">
      
      {/* ── Header Layout ── */}
      <div 
        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer transition-colors hover:bg-muted/30 ${isExpanded ? 'border-b border-border bg-muted/20' : ''}`}
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
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}
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
            <h3 className="font-semibold text-base text-foreground">Survey Event</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{survey.id}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
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
             <ChevronDown className={`size-5 text-muted-foreground transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* ── Expandable Body ── */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded && !selectionMode ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <CardContent className="p-5 space-y-5">
          
          {/* ⭐ NEW: Embedded "Started" Info Card */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/30 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <PlayCircle className="size-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Survey Initiated</p>
                <p className="text-xs font-bold text-foreground mt-0.5">
                  {startTime.toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {startTime.toLocaleDateString()}
                  </p>
               </div>
            </div>
          </div>

          {survey.message && (
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium text-foreground/90">{survey.message}</p>
            </div>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Duration</span>
              <div className="text-sm font-bold font-mono text-foreground">{Math.floor(survey.duration / 60)}:{(survey.duration % 60).toString().padStart(2, '0')}</div>
            </div>
            <div className="p-3 rounded-xl border border-border bg-muted/30">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Target</span>
              <div className="text-sm font-bold font-mono text-foreground">{(survey.targetAccuracy).toFixed(0)} cm</div>
            </div>
            <div className={`p-3 rounded-xl border col-span-2 ${style.bg} ${style.border}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${style.text}`}>Final Accuracy</span>
              <div className={`text-base font-black font-mono ${style.text}`}>{(survey.finalAccuracy).toFixed(2)} cm</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Global Coordinates */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="size-4 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/90">Global Coordinates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="pt-2 sm:pt-0 sm:px-2 first:pl-0">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Latitude</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.coordinates?.latitude?.toFixed(8) || "0.00000000"}</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Longitude</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.coordinates?.longitude?.toFixed(8) || "0.00000000"}</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Altitude</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.coordinates?.altitude?.toFixed(3) || "0.000"} <span className="text-[10px] text-muted-foreground">m</span></span>
                </div>
              </div>
            </div>

            {/* Local Coordinates */}
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="size-4 text-emerald-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/90">Local Coordinates</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
                <div className="pt-2 sm:pt-0 sm:px-2 first:pl-0">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Mean X</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.localCoordinates?.meanX?.toFixed(4) || "0.0000"} <span className="text-[10px] text-muted-foreground">m</span></span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Mean Y</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.localCoordinates?.meanY?.toFixed(4) || "0.0000"} <span className="text-[10px] text-muted-foreground">m</span></span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-0.5">Mean Z</span>
                  <span className="font-mono text-xs font-bold text-foreground">{survey.localCoordinates?.meanZ?.toFixed(4) || "0.0000"} <span className="text-[10px] text-muted-foreground">m</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="flex-1 sm:flex-none h-11 px-6 gap-2 transition-colors active:scale-95 font-bold text-[11px] tracking-wider" onClick={() => onShare(survey)}>
              <Share2 className="size-4 mr-2" /> SHARE DATA
            </Button>
          </div>

        </CardContent>
      </div>
    </Card>
  );
};

export const HistoryScreen: React.FC = () => {
  const { surveyHistory, logs, deleteSurveys, deleteLogs } = useGNSS();
  
  // Real-time terminal auto-scroll engine
  const logsEndRef = useRef<HTMLDivElement>(null);

  // States for Logs Tab
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all');

  // States for Survey Tab (Removed 'started' from default view type)
  const [surveySearchQuery, setSurveySearchQuery] = useState('');
  const [surveyFilter, setSurveyFilter] = useState<'all' | 'completed' | 'stopped' | 'error'>('all');
  
  // Selection States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [logSelectionMode, setLogSelectionMode] = useState(false);
  const [selectedLogIds, setSelectedLogIds] = useState<string[]>([]);

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
    
    // ⭐ FORCE HIDE standalone 'started' events to prevent spam
    if (type === 'started') return false; 

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

  const toggleLogSelection = (id: string) => {
    setSelectedLogIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const handleSelectAllLogs = () => {
    if (selectedLogIds.length === filteredLogs.length) {
      setSelectedLogIds([]);
    } else {
      setSelectedLogIds(filteredLogs.map((l) => l.id));
    }
  };

  const handleDeleteSelectedLogs = () => {
    if (selectedLogIds.length === 0) return;
    deleteLogs(selectedLogIds);
    setSelectedLogIds([]);
    setLogSelectionMode(false);
  };

  const normalizeFileName = (input: string, ext: string) => {
    const cleaned = input.trim().replace(/[<>:"/\\|?*]+/g, '_');
    const safe = cleaned || `export_${new Date().toISOString().split('T')[0]}`;
    return safe.toLowerCase().endsWith(`.${ext}`) ? safe : `${safe}.${ext}`;
  };

  const downloadOrShareFile = async (
    fileName: string,
    content: string,
    mimeType: string,
    successMessage: string
  ) => {
    if (Capacitor.isNativePlatform()) {
      await Filesystem.writeFile({
        path: fileName,
        data: content,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      const { uri } = await Filesystem.getUri({
        directory: Directory.Documents,
        path: fileName,
      });

      await Share.share({
        title: fileName,
        text: `Exported file: ${fileName}`,
        url: uri,
        dialogTitle: 'Save or share exported file',
      });

      toast.success(successMessage);
      return;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(successMessage);
  };


  // Logic: Custom file name prompt for Exporting Surveys
  const handleExportSurveys = async () => {
    if (filteredSurveys.length === 0) {
      toast.error('No survey records found to export');
      return;
    }
    const defaultName = `surveys_${new Date().toISOString().split('T')[0]}`;
    const inputName = window.prompt("Enter file name for survey export:", defaultName);
    if (!inputName) return; // User cancelled
    
    const csvEscape = (value: unknown) => {
      const str = value == null ? '' : String(value);
      const needsQuotes = /[",\r\n]/.test(str);
      const escaped = str.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };

    const csvHeader = "ID,Timestamp,Event,Duration(s),TargetAcc(cm),FinalAcc(cm),Latitude,Longitude,Altitude,MeanX,MeanY,MeanZ,Message\n";
    const csvRows = filteredSurveys.map((survey) => {
      const event = survey.eventType || (survey.success ? 'completed' : 'error');
      const local = (survey as any).localCoordinates || { meanX: 0, meanY: 0, meanZ: 0 };

      return [
        csvEscape(survey.id),
        csvEscape(survey.timestamp.toISOString()),
        csvEscape(event.toUpperCase()),
        csvEscape(survey.duration),
        csvEscape(survey.targetAccuracy.toFixed(0)),
        csvEscape(survey.finalAccuracy.toFixed(2)),
        csvEscape(survey.coordinates.latitude),
        csvEscape(survey.coordinates.longitude),
        csvEscape(survey.coordinates.altitude),
        csvEscape(local.meanX),
        csvEscape(local.meanY),
        csvEscape(local.meanZ),
        csvEscape(survey.message || ''),
      ].join(",");
    });

    const fileName = normalizeFileName(inputName, 'csv');
    const csvBom = "\uFEFF"; // Helps Excel interpret UTF-8 reliably
    const csvContent = csvBom + csvHeader + csvRows.join('\n');

    try {
      await downloadOrShareFile(fileName, csvContent, 'text/csv', 'Survey export successful');
    } catch (error) {
      toast.error(`Survey export failed: ${String(error)}`);
    }
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
  const handleExportLogs = async () => {
    if (filteredLogs.length === 0) {
      toast.error('No logs found to export');
      return;
    }
    const defaultName = `gnss_logs_${new Date().toISOString().split('T')[0]}`;
    const inputName = window.prompt("Enter file name for logs export:", defaultName);
    if (!inputName) return;

    const logContent = filteredLogs.map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`).join('\n');
    const fileName = normalizeFileName(inputName, 'txt');

    try {
      await downloadOrShareFile(fileName, logContent, 'text/plain', 'Logs export successful');
    } catch (error) {
      toast.error(`Logs export failed: ${String(error)}`);
    }
  };

  // Helper for Log Styling
  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="size-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="size-4 text-amber-500" />;
      default: return <Info className="size-4 text-primary" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10';
      case 'warning': return 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10';
      default: return 'text-primary border-primary/25 bg-primary/10';
    }
  };

  // Helper for Survey Event Styling
  const getSurveyStyles = (type: string) => {
    switch (type) {
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
          bg: 'bg-muted/30',
          border: 'border-border',
          text: 'text-muted-foreground',
          icon: Info,
          label: 'RECORD'
        };
    }
  };

  // UI Tier Classes
  const inputClasses = "h-11 text-sm font-medium bg-background border border-border rounded-lg focus:border-ring transition-colors text-foreground shadow-sm";

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto min-h-full animate-in fade-in duration-300 pb-6 md:pb-8">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History & Logs</h1>
          <p className="text-sm font-medium text-muted-foreground mt-1">
            Review past survey sessions and hardware diagnostic events
          </p>
        </div>
      </div>

      <Tabs defaultValue="surveys" className="w-full flex flex-col">
        <div className="pb-5">
          <TabsList className="grid w-full grid-cols-2 bg-muted/40 p-1.5 rounded-xl border border-border h-12 max-w-md">
            <TabsTrigger value="surveys" className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-card rounded-lg data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all h-full text-muted-foreground">
              <History className="size-4" /> SURVEYS
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center justify-center gap-2 text-xs font-bold data-[state=active]:bg-card rounded-lg data-[state=active]:shadow-sm data-[state=active]:text-foreground transition-all h-full text-muted-foreground">
              <FileText className="size-4" /> SYSTEM LOGS
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── SURVEYS TAB ── */}
        <TabsContent value="surveys" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                    <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 font-semibold text-sm" onClick={handleExportSurveys}>
                      <Download className="size-4" /> Export
                    </Button>
                    <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 font-semibold text-sm" onClick={() => setSelectionMode(true)}>
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in fade-in zoom-in-95">
                    <Button variant="outline" className="h-11 px-4 font-semibold" onClick={handleSelectAll}>
                      {selectedIds.length === filteredSurveys.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button variant="destructive" className="h-11 px-4 font-bold" onClick={handleDeleteSelected} disabled={selectedIds.length === 0}>
                      <Trash2 className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Delete ({selectedIds.length})</span>
                    </Button>
                    <Button variant="outline" className="h-11 px-3" onClick={() => { setSelectionMode(false); setSelectedIds([]); }}>
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Survey State Filters (Removed 'started') */}
              <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-xl border border-border">
                {(['all', 'completed', 'stopped', 'error'] as const).map((level) => (
                  <button 
                    key={level} 
                    onClick={() => setSurveyFilter(level)} 
                    className={`flex-1 min-w-[70px] h-9 px-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 ${
                      surveyFilter === level 
                      ? 'bg-card text-foreground shadow-sm border border-border' 
                      : 'text-muted-foreground hover:text-foreground'
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
              <div className="py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-border/70 rounded-3xl">
                <History className="size-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No Survey Records</h3>
                <p className="text-sm font-medium text-muted-foreground max-w-xs mt-1">Change your filters or start a new survey to populate history.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── LOGS TAB ── */}
        <TabsContent value="logs" className="m-0 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 md:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search system logs..." className={`${inputClasses} pl-10`} value={logSearchQuery} onChange={(e) => setLogSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 font-semibold text-sm" onClick={handleExportLogs}>
                    <Download className="size-4" /> Export
                  </Button>
                  {!logSelectionMode ? (
                    <Button variant="outline" className="flex-1 sm:flex-none h-11 px-5 gap-2 border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10 font-semibold text-sm" onClick={() => setLogSelectionMode(true)}>
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="h-11 px-4 font-semibold" onClick={handleSelectAllLogs}>
                        {selectedLogIds.length === filteredLogs.length ? 'Deselect All' : 'Select All'}
                      </Button>
                      <Button variant="destructive" className="h-11 px-4 font-bold" onClick={handleDeleteSelectedLogs} disabled={selectedLogIds.length === 0}>
                        <Trash2 className="size-4 sm:mr-2" /> <span className="hidden sm:inline">Delete ({selectedLogIds.length})</span>
                      </Button>
                      <Button variant="outline" className="h-11 px-3" onClick={() => { setLogSelectionMode(false); setSelectedLogIds([]); }}>
                        <X className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 p-1.5 bg-muted/40 rounded-xl border border-border">
                {(['all', 'info', 'warning', 'error'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogLevel(level)}
                    className={`flex-1 min-w-[80px] h-9 px-3 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      logLevel === level
                        ? 'bg-card text-foreground shadow-sm border border-border'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terminal Viewer */}
          <Card className="bg-card border border-border shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/20 p-4 md:p-5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="size-5 text-primary" />
                <CardTitle className="text-base font-semibold uppercase tracking-widest">Hardware Terminal</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px] w-full bg-muted/20">
                <div className="p-4 space-y-1.5 font-mono text-xs">
                  {/* Map logs oldest-to-newest so scrolling works naturally */}
                  {filteredLogs.slice().reverse().map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-card border border-transparent hover:border-border">
                      {logSelectionMode && (
                        <div
                          onClick={() => toggleLogSelection(log.id)}
                          className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                            selectedLogIds.includes(log.id)
                              ? 'bg-red-600 border-red-600'
                              : 'border-border'
                          }`}
                        >
                          {selectedLogIds.includes(log.id) && <CheckCircle2 className="size-3 text-white" />}
                        </div>
                      )}
                      <div className="mt-0.5 shrink-0">{getLevelIcon(log.level)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <span className="text-[10px] font-medium text-muted-foreground">[{log.timestamp.toLocaleTimeString()}]</span>
                          <Badge variant="outline" className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0 border-none ${getLevelColor(log.level)}`}>{log.level}</Badge>
                        </div>
                        <div className="text-foreground/90 break-words leading-relaxed font-medium">{log.message}</div>
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
