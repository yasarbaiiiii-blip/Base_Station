import React, { useState } from 'react';
import { useGNSS } from '../../context/GNSSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export const HistoryScreen: React.FC = () => {
  const { surveyHistory, logs, clearLogs } = useGNSS();
  const [searchQuery, setSearchQuery] = useState('');
  const [logLevel, setLogLevel] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logLevel === 'all' || log.level === logLevel;
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const exportSurvey = (survey: typeof surveyHistory[0]) => {
    const csvContent = `Survey Export
Timestamp,${survey.timestamp.toISOString()}
Duration,${survey.duration} seconds
Final Accuracy,${survey.finalAccuracy.toFixed(4)} meters
Latitude,${survey.coordinates.latitude.toFixed(8)}
Longitude,${survey.coordinates.longitude.toFixed(8)}
Altitude,${survey.coordinates.altitude.toFixed(3)} meters
Status,${survey.success ? 'Success' : 'Failed'}`;

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
    const text = `Survey Result
Lat: ${survey.coordinates.latitude.toFixed(8)}
Lon: ${survey.coordinates.longitude.toFixed(8)}
Alt: ${survey.coordinates.altitude.toFixed(3)}m
Accuracy: ${survey.finalAccuracy.toFixed(4)}m`;

    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Survey data copied to clipboard');
    }
  };

  const exportLogs = () => {
    const logContent = filteredLogs
      .map(log => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join('\n');

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
      case 'error':
        return <AlertCircle className="size-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="size-4 text-yellow-500" />;
      default:
        return <Info className="size-4 text-blue-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">History & Logs</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Review past survey sessions and system events
        </p>
      </div>

      <Tabs defaultValue="surveys" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="surveys" className="gap-2">
            <History className="size-4" />
            Survey History
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <FileText className="size-4" />
            System Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="surveys" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search surveys..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="size-4" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Survey List */}
          <div className="space-y-3">
            {surveyHistory.map((survey) => (
              <Card key={survey.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {survey.success ? (
                          <CheckCircle2 className="size-5 text-green-500" />
                        ) : (
                          <XCircle className="size-5 text-red-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={survey.success ? 'default' : 'destructive'} className={survey.success ? 'bg-green-500' : ''}>
                              {survey.success ? 'Success' : 'Failed'}
                            </Badge>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              Accuracy: {(survey.finalAccuracy * 100).toFixed(2)} cm
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="size-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Date:</span>
                            <span className="font-mono">{survey.timestamp.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="size-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Time:</span>
                            <span className="font-mono">{survey.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="size-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Duration:</span>
                            <span className="font-mono">{Math.floor(survey.duration / 60)}:{(survey.duration % 60).toString().padStart(2, '0')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="size-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">Target Accuracy:</span>
                            <span className="font-mono">{(survey.targetAccuracy * 100).toFixed(0)}cm</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="size-4 text-slate-400 mt-0.5" />
                            <div className="font-mono text-xs">
                              <div>Lat: {survey.coordinates.latitude.toFixed(8)}</div>
                              <div>Lon: {survey.coordinates.longitude.toFixed(8)}</div>
                              <div>Alt: {survey.coordinates.altitude.toFixed(3)}m</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportSurvey(survey)}>
                          <Download className="size-4" />
                          Export CSV
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => shareSurvey(survey)}>
                          <Share2 className="size-4" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {surveyHistory.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <History className="size-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold mb-2">No Survey History</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Completed surveys will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          {/* Log Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Log Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" className="gap-2" onClick={exportLogs}>
                  <Download className="size-4" />
                  Export
                </Button>
                <Button variant="outline" className="gap-2" onClick={clearLogs}>
                  <Trash2 className="size-4" />
                  Clear
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={logLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('all')}
                >
                  All
                </Button>
                <Button
                  variant={logLevel === 'error' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('error')}
                  className={logLevel === 'error' ? 'bg-red-500' : ''}
                >
                  Errors
                </Button>
                <Button
                  variant={logLevel === 'warning' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('warning')}
                  className={logLevel === 'warning' ? 'bg-yellow-500' : ''}
                >
                  Warnings
                </Button>
                <Button
                  variant={logLevel === 'info' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLogLevel('info')}
                  className={logLevel === 'info' ? 'bg-blue-500' : ''}
                >
                  Info
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Log Viewer */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">System Logs</CardTitle>
                  <CardDescription>
                    {filteredLogs.length} log {filteredLogs.length === 1 ? 'entry' : 'entries'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-2">
                  Auto-scroll: {autoScroll ? 'On' : 'Off'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded-lg border bg-slate-50 dark:bg-slate-900">
                <div className="p-4 space-y-2 font-mono text-sm">
                  {filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      {getLevelIcon(log.level)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getLevelColor(log.level)}`}
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 break-words">
                          {log.message}
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                      <FileText className="size-12 mx-auto mb-4 opacity-50" />
                      <p>No logs found matching your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
