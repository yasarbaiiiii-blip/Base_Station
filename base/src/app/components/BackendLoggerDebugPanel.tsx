/**
 * ============================================
 * BackendLogger Debug Panel Component
 * ============================================
 * Displays all backend API calls and WebSocket events
 * Can be added to the app for debugging purposes
 */

import React, { useState, useEffect } from "react";
import { backendLogger, BackendLog } from "../../utils/backendLogger";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Download, Trash2, RefreshCw, Play, Square } from "lucide-react";

interface DebugPanelProps {
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
}

export const BackendLoggerDebugPanel: React.FC<DebugPanelProps> = ({
  isOpen = false,
  onToggle,
}) => {
  const [logs, setLogs] = useState<BackendLog[]>([]);
  const [panelOpen, setPanelOpen] = useState(isOpen);
  const [selectedLog, setSelectedLog] = useState<BackendLog | null>(null);
  const [filterType, setFilterType] = useState<BackendLog["type"] | "ALL">("ALL");
  const [stats, setStats] = useState({
    total: 0,
    byType: {} as Record<BackendLog["type"], number>,
    averageResponseTime: 0,
    errors: 0,
  });

  useEffect(() => {
    // Subscribe to logger updates
    const unsubscribe = backendLogger.subscribe((log) => {
      setLogs((prevLogs) => [...prevLogs.slice(-99), log]); // Keep last 100
      setStats(backendLogger.getStatistics());
    });

    // Initial load
    setLogs(backendLogger.getLogs());
    setStats(backendLogger.getStatistics());

    return unsubscribe;
  }, []);

  const handleToggle = () => {
    setPanelOpen(!panelOpen);
    onToggle?.(!panelOpen);
  };

  const filteredLogs =
    filterType === "ALL"
      ? logs
      : logs.filter((log) => log.type === filterType);

  const getTypeBadgeColor = (type: BackendLog["type"]) => {
    switch (type) {
      case "API_CALL":
        return "bg-blue-500";
      case "API_RESPONSE":
        return "bg-green-500";
      case "API_ERROR":
        return "bg-red-500";
      case "WEBSOCKET_EVENT":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const testEndpoints = async () => {
    try {
      await backendLogger.testAllEndpoints();
    } catch (error) {
      console.error("Error testing endpoints:", error);
    }
  };

  return (
    <>
      {/* Toggle Button - Fixed Position */}
      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-full shadow-lg hover:bg-slate-800 transition-colors"
        title={panelOpen ? "Close Debug Panel" : "Open Debug Panel"}
      >
        🔧
      </button>

      {/* Debug Panel */}
      {panelOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-96 max-h-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-lg">🔍 Backend Logger</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Total: {stats.total} | Errors: {stats.errors}
            </p>
          </div>

          {/* Controls */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={testEndpoints}
              className="gap-2"
            >
              <Play className="size-3" /> Test API
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => backendLogger.downloadLogs("json")}
              className="gap-2"
            >
              <Download className="size-3" /> JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => backendLogger.downloadLogs("csv")}
              className="gap-2"
            >
              <Download className="size-3" /> CSV
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                backendLogger.clearLogs();
                setLogs([]);
              }}
              className="gap-2"
            >
              <Trash2 className="size-3" /> Clear
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="logs" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            {/* Logs Tab */}
            <TabsContent
              value="logs"
              className="flex-1 overflow-y-auto p-3 space-y-2"
            >
              {/* Filter */}
              <div className="flex gap-2 flex-wrap pb-2 border-b sticky top-0 bg-white dark:bg-slate-900">
                <button
                  onClick={() => setFilterType("ALL")}
                  className={`px-2 py-1 text-xs rounded ${filterType === "ALL" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                >
                  All
                </button>
                {Object.entries(stats.byType).map(([type]) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFilterType(type as BackendLog["type"])
                    }
                    className={`px-2 py-1 text-xs rounded ${filterType === type ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Log Entries */}
              {filteredLogs.length === 0 ? (
                <div className="text-center text-slate-500 py-4">
                  No logs yet. Click "Test API" to generate data.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    onClick={() =>
                      setSelectedLog(
                        selectedLog?.id === log.id ? null : log
                      )
                    }
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <Badge
                        className={`${getTypeBadgeColor(log.type)} text-white text-xs`}
                      >
                        {log.type.split("_")[0]}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono truncate">
                          {log.endpoint || log.type}
                        </div>
                        <div className="text-slate-500">
                          {log.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      {log.status && (
                        <Badge
                          className={`${log.status >= 200 && log.status < 300 ? "bg-green-500" : "bg-red-500"} text-white`}
                        >
                          {log.status}
                        </Badge>
                      )}
                    </div>

                    {/* Expanded View */}
                    {selectedLog?.id === log.id && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                        {log.method && (
                          <div>
                            <span className="font-bold">Method:</span> {log.method}
                          </div>
                        )}
                        {log.duration && (
                          <div>
                            <span className="font-bold">Duration:</span>{" "}
                            {log.duration.toFixed(2)}ms
                          </div>
                        )}
                        {log.error && (
                          <div>
                            <span className="font-bold">Error:</span>
                            <pre className="bg-red-50 dark:bg-red-950 p-1 rounded mt-1 overflow-auto max-h-32">
                              {typeof log.error === "string"
                                ? log.error
                                : log.error.message}
                            </pre>
                          </div>
                        )}
                        {log.data && (
                          <div>
                            <span className="font-bold">Data:</span>
                            <pre className="bg-slate-100 dark:bg-slate-900 p-1 rounded mt-1 overflow-auto max-h-32">
                              {JSON.stringify(log.data, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="p-4 text-sm space-y-3">
              <div>
                <p className="font-bold">Total Logs: {stats.total}</p>
              </div>
              <div>
                <p className="font-bold mb-2">By Type:</p>
                <div className="space-y-1">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span>{type}</span>
                      <Badge>{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold">
                  Avg Response Time: {stats.averageResponseTime.toFixed(2)}ms
                </p>
              </div>
              <div>
                <p className="font-bold text-red-500">Errors: {stats.errors}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </>
  );
};
