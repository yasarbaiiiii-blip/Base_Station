import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  ConnectionState,
  SurveyState,
  GNSSStatus,
  StreamState,
  Configuration,
  WiFiNetwork,
  BLEDevice,
  LogEntry,
  SurveyHistoryEntry,
  AppSettings,
  Satellite,
} from "../types/gnss";

import { api, WS_URL, setApiHost } from "../api/gnssApi";
import { scanWifi, connectWifi } from "../native/wifi";
import { connectBle, scanBleDevices } from "../native/ble";
import { uiLogger } from "../utils/uiLogger";
import { toast } from "sonner";
import { stealthPing, validateManualIP } from "../utils/ipDiscovery"; 

/* ================= CONTEXT TYPE ================= */

type GNSSContextType = {
  connection: ConnectionState;
  connectToDevice: (type: "wifi" | "ble" | "auto", identifier: string, password?: string, wsUrl?: string) => Promise<void>;
  disconnect: () => void;
  survey: SurveyState;
  startSurvey: () => Promise<void>;
  stopSurvey: () => Promise<void>;
  isAutoFlowActive: boolean;
  gnssStatus: GNSSStatus;
  streams: StreamState;
  toggleStream: (key: keyof StreamState, enabled: boolean) => Promise<void>;
  configuration: Configuration;
  updateConfiguration: (config: Configuration) => void;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  availableWiFiNetworks: WiFiNetwork[];
  availableBLEDevices: BLEDevice[];
  scanWiFi: () => Promise<void>;
  scanBLE: () => Promise<void>;
  surveyHistory: SurveyHistoryEntry[];
  logs: LogEntry[];
  addLog: (level: 'error' | 'warning' | 'info', message: string) => void;
  clearLogs: () => void;
  deleteLogs: (ids: string[]) => void;
  clearSurveyHistory: () => void; 
  deleteSurveys: (ids: string[]) => void;
  exportHistoryCSV: () => Promise<void>;
  exportLogsCSV: () => Promise<void>;
  startNTRIP: (host: string, port: number, mountpoint: string, password: string, username?: string) => Promise<void>;
  stopNTRIP: () => Promise<void>;
};

const GNSSContext = createContext<GNSSContextType | null>(null);

export const useGNSS = () => {
  const ctx = useContext(GNSSContext);
  if (!ctx) throw new Error("useGNSS must be used inside GNSSProvider");
  return ctx;
};

/* ================= PROVIDER ================= */

export const GNSSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const activeWsUrlRef = useRef<string>(WS_URL);
  const stoppingRef = useRef(false);
  const intentionalDisconnectRef = useRef(false);
  const startPendingRef = useRef(false);
  const startInitiatedAtRef = useRef(0);
  const START_PENDING_GRACE_MS = 3500;
  
  const autoSurveyRunRef = useRef<boolean>(true);
  const STORAGE_KEYS = {
    connection: 'gnss_connection',
    survey: 'gnss_survey',
    gnssStatus: 'gnss_status',
    streams: 'gnss_streams',
    history: 'gnss_history',
    logs: 'gnss_logs',
    configuration: 'gnss_configuration',
    settings: 'gnss_settings',
    lastWs: 'gnss_last_ws',
    ntripArmed: 'gnss_ntrip_user_armed',
  } as const;

  const defaultStream = { enabled: false, active: false, throughput: 0, messageRate: 0 };
  const DEFAULT_CONNECTION: ConnectionState = {
    connectionType: "none",
    isConnected: false,
    lastConnectedTimestamp: null,
    signalStrength: 0,
    latency: 0,
    autoReconnect: true,
  };
  const DEFAULT_SURVEY: SurveyState = {
    surveyMode: "survey-in",
    isActive: false,
    valid: false,
    progress: 0,
    elapsedTime: 0,
    requiredTime: 30,
    currentAccuracy: 0,
    targetAccuracy: 200,
    position: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0 },
    localCoordinates: { meanX: 0, meanY: 0, meanZ: 0, observations: 0 },
    status: "idle",
    satelliteCount: 0,
  };
  const createDefaultGNSSStatus = (): GNSSStatus => ({
    satellites: [],
    fixType: "none",
    dop: { hdop: null, vdop: null, pdop: null },
    updateRate: 1,
    lastUpdate: new Date(),
    firmwareVersion: "unknown",
    activeConstellations: [],
    globalPosition: { latitude: 0, longitude: 0, altitude: 0, horizontalAccuracy: 0 },
  });
  const DEFAULT_STREAMS: StreamState = {
    serial: { ...defaultStream },
    ntrip: { ...defaultStream, mountpoint: "", uptime: 0, dataSent: 0, lastError: null },
    tcp: { ...defaultStream, connectedClients: 0 },
    udp: { ...defaultStream },
  };

  /* ================= STATE ================= */

  const [connection, setConnection] = useState<ConnectionState>(DEFAULT_CONNECTION);

  const [survey, setSurvey] = useState<SurveyState>(DEFAULT_SURVEY);

  const [isAutoFlowActive, setIsAutoFlowActive] = useState(false);

  const [gnssStatus, setGNSSStatus] = useState<GNSSStatus>(createDefaultGNSSStatus);

  const [streams, setStreams] = useState<StreamState>(DEFAULT_STREAMS);

  const [availableWiFiNetworks, setAvailableWiFiNetworks] = useState<WiFiNetwork[]>([]);
  const [availableBLEDevices, setAvailableBLEDevices] = useState<BLEDevice[]>([]);
  const [surveyHistory, setSurveyHistory] = useState<SurveyHistoryEntry[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isNtripUserArmed, setIsNtripUserArmed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ntripArmed) === '1';
    } catch {
      return false;
    }
  });
  const [lastSavedWsUrl, setLastSavedWsUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.lastWs);
    } catch {
      return null;
    }
  });

  /* ================= PERSISTED DEFAULTS ================= */
  const DEFAULT_CONFIG: Configuration = {
    baseStation: {
      surveyDuration: 120,
      accuracyThreshold: 200,
      autoStart: false,
      autoMode: false,
      fixedMode: { enabled: false, coordinates: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0 } },
    },
    streams: {
      ntrip: { server: "caster.emlid.com", port: 2101, mountpoint: "", username: "", password: "" },
      serial: { baudRate: 115200, messages: [], rates: [] },
      tcp: { port: 9000, maxClients: 5, authEnabled: false },
      udp: { port: 8001, broadcastAddress: "", multicast: false },
    },
    system: { wifiSsid: "", wifiPassword: "", ledMode: "status", ledBrightness: 80 },
  };

  const DEFAULT_SETTINGS: AppSettings = {
    units: { distance: "meters", coordinates: "DD" },
    theme: "system",
    language: "en",
    notifications: { surveyCompletion: true, connectionLoss: true, lowAccuracy: true, sound: true, vibration: true },
    connection: { preferredMethod: "auto", autoReconnect: true, timeout: 10, keepScreenAwake: true },
  };

  const loadPersistedConfig = (): Configuration => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.configuration);
      if (saved) {
        const parsed = JSON.parse(saved) as Configuration;
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          baseStation: {
            ...DEFAULT_CONFIG.baseStation, ...parsed.baseStation,
            fixedMode: {
              ...DEFAULT_CONFIG.baseStation.fixedMode, ...parsed.baseStation?.fixedMode,
              coordinates: { ...DEFAULT_CONFIG.baseStation.fixedMode.coordinates, ...parsed.baseStation?.fixedMode?.coordinates },
            },
          },
          streams: {
            ...DEFAULT_CONFIG.streams, ...parsed.streams,
            ntrip: { ...DEFAULT_CONFIG.streams.ntrip, ...parsed.streams?.ntrip },
            serial: { ...DEFAULT_CONFIG.streams.serial, ...parsed.streams?.serial },
            tcp: { ...DEFAULT_CONFIG.streams.tcp, ...parsed.streams?.tcp },
            udp: { ...DEFAULT_CONFIG.streams.udp, ...parsed.streams?.udp },
          },
          system: { ...DEFAULT_CONFIG.system, ...parsed.system },
        };
      }
    } catch (e) {
      console.warn('Failed to load saved configuration, using defaults:', e);
    }
    return DEFAULT_CONFIG;
  };

  const loadPersistedSettings = (): AppSettings => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.settings);
      if (saved) {
        const parsed = JSON.parse(saved) as AppSettings;
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          units: { ...DEFAULT_SETTINGS.units, ...parsed.units },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications },
          connection: { ...DEFAULT_SETTINGS.connection, ...parsed.connection },
        };
      }
    } catch (e) {
      console.warn('Failed to load saved settings, using defaults:', e);
    }
    return DEFAULT_SETTINGS;
  };

  const [configuration, setConfiguration] = useState<Configuration>(loadPersistedConfig);
  const [settings, setSettings] = useState<AppSettings>(loadPersistedSettings);

  useEffect(() => {
    try {
      const rawConnection = localStorage.getItem(STORAGE_KEYS.connection);
      if (rawConnection) {
        const parsed = JSON.parse(rawConnection) as ConnectionState;
        setConnection({
          ...DEFAULT_CONNECTION,
          ...parsed,
          isConnected: false,
          lastConnectedTimestamp: parsed.lastConnectedTimestamp ? new Date(parsed.lastConnectedTimestamp) : null,
        });
      }

      const rawSurvey = localStorage.getItem(STORAGE_KEYS.survey);
      if (rawSurvey) {
        const parsed = JSON.parse(rawSurvey) as SurveyState;
        setSurvey({ ...DEFAULT_SURVEY, ...parsed });
      }

      const rawGNSS = localStorage.getItem(STORAGE_KEYS.gnssStatus);
      if (rawGNSS) {
        const parsed = JSON.parse(rawGNSS) as GNSSStatus;
        setGNSSStatus({
          ...createDefaultGNSSStatus(),
          ...parsed,
          lastUpdate: parsed.lastUpdate ? new Date(parsed.lastUpdate) : new Date(),
        });
      }

      const rawStreams = localStorage.getItem(STORAGE_KEYS.streams);
      if (rawStreams) {
        const parsed = JSON.parse(rawStreams) as StreamState;
        setStreams({
          ...DEFAULT_STREAMS,
          ...parsed,
          serial: { ...DEFAULT_STREAMS.serial, ...parsed.serial },
          ntrip: isNtripUserArmed
            ? { ...DEFAULT_STREAMS.ntrip, ...parsed.ntrip }
            : { ...DEFAULT_STREAMS.ntrip, enabled: false, active: false, throughput: 0, uptime: 0, dataSent: 0 },
          tcp: { ...DEFAULT_STREAMS.tcp, ...parsed.tcp },
          udp: { ...DEFAULT_STREAMS.udp, ...parsed.udp },
        });
      }

      const rawHistory = localStorage.getItem(STORAGE_KEYS.history);
      if (rawHistory) {
        const parsed = JSON.parse(rawHistory) as SurveyHistoryEntry[];
        setSurveyHistory(parsed.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })));
      }

      const rawLogs = localStorage.getItem(STORAGE_KEYS.logs);
      if (rawLogs) {
        const parsed = JSON.parse(rawLogs) as LogEntry[];
        setLogs(parsed.map((entry) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        })));
      }
    } catch (e) {
      console.warn('Failed to hydrate app runtime state:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.connection, JSON.stringify(connection));
    } catch (e) {
      console.warn('Failed to persist connection state:', e);
    }
  }, [connection]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.survey, JSON.stringify(survey));
    } catch (e) {
      console.warn('Failed to persist survey state:', e);
    }
  }, [survey]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.gnssStatus, JSON.stringify(gnssStatus));
    } catch (e) {
      console.warn('Failed to persist GNSS status:', e);
    }
  }, [gnssStatus]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.streams, JSON.stringify(streams));
    } catch (e) {
      console.warn('Failed to persist stream state:', e);
    }
  }, [streams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(surveyHistory));
    } catch (e) {
      console.warn('Failed to persist survey history:', e);
    }
  }, [surveyHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(logs));
    } catch (e) {
      console.warn('Failed to persist logs:', e);
    }
  }, [logs]);

  useEffect(() => {
    try {
      if (isNtripUserArmed) {
        localStorage.setItem(STORAGE_KEYS.ntripArmed, '1');
      } else {
        localStorage.removeItem(STORAGE_KEYS.ntripArmed);
      }
    } catch (e) {
      console.warn('Failed to persist NTRIP arm state:', e);
    }
  }, [isNtripUserArmed]);

  /* ================= HELPER FUNCTIONS ================= */

  useEffect(() => {
    const syncAutoMode = () => {
      api.getAutoFlowConfig()
        .then((cfg) => {
          if (typeof cfg.enabled === 'boolean') {
            setConfiguration(prev => {
              if (prev.baseStation.autoMode === cfg.enabled) return prev; 
              const updated = {
                ...prev,
                baseStation: { ...prev.baseStation, autoMode: cfg.enabled },
              };
              localStorage.setItem(STORAGE_KEYS.configuration, JSON.stringify(updated));
              return updated;
            });
          }
        })
        .catch(() => { }); 
    };

    syncAutoMode(); 
    const interval = setInterval(syncAutoMode, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = useCallback((level: 'error' | 'warning' | 'info', message: string) => {
    setLogs((prev) => [{ id: Date.now().toString() + Math.random(), timestamp: new Date(), level, message }, ...prev].slice(0, 500));
  }, []);

  const clearSurveyHistory = useCallback(() => {
    setSurveyHistory([]);
    toast.success("Survey history cleared");
  }, []);

  const deleteSurveys = useCallback((ids: string[]) => {
    setSurveyHistory(prev => prev.filter(s => !ids.includes(s.id)));
    toast.success(`Deleted ${ids.length} record(s)`);
  }, []);

  const deleteLogs = useCallback((ids: string[]) => {
    setLogs((prev) => prev.filter((log) => !ids.includes(log.id)));
    toast.success(`Deleted ${ids.length} log record(s)`);
  }, []);

  /* ================= WEBSOCKET ================= */

  const connectWebSocket = useCallback((customUrl?: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    if (customUrl) {
      activeWsUrlRef.current = customUrl;
      setApiHost(customUrl);
    }

    wsRef.current = new WebSocket(activeWsUrlRef.current);

    wsRef.current.onopen = () => {
      setConnection((prev) => ({ ...prev, isConnected: true, lastConnectedTimestamp: new Date() }));
      addLog('info', 'WebSocket connected');
      
      // ⭐ MEMORY STORAGE RULE: The moment connection is successful, securely write the IP to memory
      try {
        localStorage.setItem(STORAGE_KEYS.lastWs, activeWsUrlRef.current);
        setLastSavedWsUrl(activeWsUrlRef.current);
        console.log(`💾 Saved successful connection: ${activeWsUrlRef.current}`);
      } catch (e) {
        console.warn('Failed to save WS URL:', e);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const satellites: Satellite[] = Array.from(
          { length: data.gnss?.num_satellites || 0 },
          (_, i) => ({ id: i, constellation: "GPS", elevation: 0, azimuth: 0, snr: 0, used: true })
        );

        setGNSSStatus({
          satellites,
          fixType: data.gnss?.fix_type ?? "none",
          dop: { hdop: data.gnss?.hdop ?? null, vdop: data.gnss?.vdop ?? null, pdop: data.gnss?.pdop ?? null },
          updateRate: data.gnss?.update_rate_hz ?? 1,
          lastUpdate: new Date(),
          firmwareVersion: data.system?.firmware_version ?? "unknown",
          activeConstellations: ["GPS"],
          globalPosition: {
            latitude: data.gnss?.latitude ?? 0,
            longitude: data.gnss?.longitude ?? 0,
            altitude: data.gnss?.altitude_msl ?? 0,
            horizontalAccuracy: data.gnss?.horizontal_accuracy ?? 0,
          },
        });

        if (data.autoflow !== undefined) {
          setIsAutoFlowActive(data.autoflow.active ?? false);
        }

        setSurvey((prev) => {
          const wsActive = data.survey?.active ?? false;
          if (stoppingRef.current) return prev;

          const wsAccuracy = (data.survey?.accuracy_m ?? 0) * 100;
          
          const parseVal = (val: any) => val !== undefined && val !== null ? Number(val) : undefined;
          const pos = data.survey?.position || data.survey?.local_position || {};
          
          const wsLocalCoords = {
            meanX: parseVal(data.survey?.mean_x_m ?? data.survey?.meanX ?? data.survey?.ecef_x ?? data.survey?.x ?? pos.x ?? pos[0]) ?? prev.localCoordinates.meanX,
            meanY: parseVal(data.survey?.mean_y_m ?? data.survey?.meanY ?? data.survey?.ecef_y ?? data.survey?.y ?? pos.y ?? pos[1]) ?? prev.localCoordinates.meanY,
            meanZ: parseVal(data.survey?.mean_z_m ?? data.survey?.meanZ ?? data.survey?.ecef_z ?? data.survey?.z ?? pos.z ?? pos[2]) ?? prev.localCoordinates.meanZ,
            observations: data.survey?.observations ?? prev.localCoordinates.observations,
          };
          const withinStartGrace =
            startPendingRef.current &&
            prev.isActive &&
            !wsActive &&
            (Date.now() - startInitiatedAtRef.current) < START_PENDING_GRACE_MS;

          if (wsActive && !prev.isActive) {
            startPendingRef.current = false;
            return {
              ...prev,
              isActive: true,
              status: "in-progress",
              elapsedTime: data.survey?.progress_seconds ?? 0,
              currentAccuracy: wsAccuracy,
              satelliteCount: data.gnss?.num_satellites ?? 0,
              localCoordinates: wsLocalCoords,
            };
          }

          if (prev.isActive) {
            if (wsActive) {
              startPendingRef.current = false;
            }
            const shouldUpdateAccuracy = wsAccuracy > 0 && wsAccuracy < 5000;
            if (withinStartGrace) {
              return {
                ...prev,
                satelliteCount: data.gnss?.num_satellites ?? prev.satelliteCount,
                currentAccuracy: shouldUpdateAccuracy ? wsAccuracy : prev.currentAccuracy,
                position: {
                  latitude: data.gnss?.latitude ?? prev.position.latitude,
                  longitude: data.gnss?.longitude ?? prev.position.longitude,
                  altitude: data.gnss?.altitude_msl ?? prev.position.altitude,
                  accuracy: data.gnss?.horizontal_accuracy ?? prev.position.accuracy,
                },
                localCoordinates: wsLocalCoords,
              };
            }
            return {
              ...prev,
              satelliteCount: data.gnss?.num_satellites ?? prev.satelliteCount,
              currentAccuracy: shouldUpdateAccuracy ? wsAccuracy : prev.currentAccuracy,
              position: {
                latitude: data.gnss?.latitude ?? prev.position.latitude,
                longitude: data.gnss?.longitude ?? prev.position.longitude,
                altitude: data.gnss?.altitude_msl ?? prev.position.altitude,
                accuracy: data.gnss?.horizontal_accuracy ?? prev.position.accuracy,
              },
              localCoordinates: wsLocalCoords,
              isActive: wsActive,
              status: !wsActive ? 'completed' : prev.status,
            };
          }

          return prev;
        });

      } catch (e) {
        console.error("WebSocket parse error:", e);
      }
    };

    wsRef.current.onclose = () => {
      if (intentionalDisconnectRef.current) {
        intentionalDisconnectRef.current = false;
        setConnection((prev) => ({ ...prev, isConnected: false }));
      }
    };
  }, [addLog]);

  useEffect(() => {
    const reconnectTimer = setInterval(() => {
      const wsDown = wsRef.current?.readyState !== WebSocket.OPEN;
      const surveyInactive = !survey.isActive;
      const notIntentionalDisconnect = !intentionalDisconnectRef.current;

      if (wsDown && surveyInactive && notIntentionalDisconnect && connection.isConnected) {
        connectWebSocket();
      }
    }, 5000);

    return () => clearInterval(reconnectTimer);
  }, [connectWebSocket, survey.isActive, connection.isConnected]);

  /* ================= START SURVEY ================= */
  const startSurvey = useCallback(async () => {
    try {
      if (!streams.ntrip.active) {
        const msg = 'Start NTRIP Sender first. Survey can begin only while NTRIP is streaming.';
        addLog('warning', msg);
        toast.error(msg);
        throw new Error(msg);
      }

      const currentDuration = configuration.baseStation.surveyDuration;
      const currentAccuracy = configuration.baseStation.accuracyThreshold;
      startPendingRef.current = true;
      startInitiatedAtRef.current = Date.now();

      setSurvey((prev) => ({
        ...prev,
        isActive: true,
        status: "initializing",
        progress: 0,
        elapsedTime: 0,
        targetAccuracy: currentAccuracy,
        requiredTime: currentDuration,
        currentAccuracy: 0,
      }));

      await api.startSurvey(currentDuration, currentAccuracy / 100);
      addLog('info', 'Survey started successfully');
    } catch (error) {
      startPendingRef.current = false;
      setSurveyHistory((prev) => [{
        id: `SRV-ERR-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(),
        duration: 0,
        finalAccuracy: 0,
        targetAccuracy: configuration.baseStation.accuracyThreshold,
        accuracyAttempts: [],
        coordinates: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0 },
        localCoordinates: { meanX: 0, meanY: 0, meanZ: 0, observations: 0 },
        success: false,
        eventType: 'error',
        message: `Hardware failed to initiate survey: ${String(error)}`
      } as any, ...prev]);

      addLog('error', `Survey start failed: ${String(error)}`);
      setSurvey((prev) => ({ ...prev, isActive: false, status: "failed" }));
      throw error;
    }
  }, [configuration.baseStation.surveyDuration, configuration.baseStation.accuracyThreshold, streams.ntrip.active, addLog]);

  /* ================= STOP SURVEY ================= */
  const stopSurvey = useCallback(async () => {
    try {
      addLog('info', 'Stopping survey');
      stoppingRef.current = true;
      startPendingRef.current = false;
      setSurvey((prev) => ({ ...prev, isActive: false, status: 'stopped' }));

      let stopAttempts = 0;
      let stopSucceeded = false;
      const maxRetries = 2;

      while (stopAttempts < maxRetries && !stopSucceeded) {
        try {
          stopAttempts++;
          await api.stopSurvey();
          stopSucceeded = true;
          addLog('info', 'Survey stopped successfully on backend');
        } catch (apiError) {
          if (stopAttempts < maxRetries) {
            addLog('warning', `Stop attempt ${stopAttempts}/${maxRetries} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            addLog('warning', `Backend stop failed after ${maxRetries} attempts (UI stopped locally)`);
          }
        }
      }
    } catch (error) {
      addLog('error', `Unexpected survey stop error: ${String(error)}`);
      setSurvey((prev) => ({ ...prev, isActive: false, status: 'stopped' }));
    } finally {
      setTimeout(() => {
        stoppingRef.current = false;
      }, 1000);
    }
  }, [addLog]);

/* ================= CONNECTION FUNCTIONS ================= */
  const connectToDevice = useCallback(async (type: "wifi" | "ble" | "auto", identifier: string, password?: string, wsUrl?: string) => {
    try {
      let finalWsUrl = wsUrl;

      // Auto mode: one strict 3-second check against the saved node only
      if (type === 'auto') {
        addLog('info', 'Auto Mode: Attempting stealth ping...');
        if (lastSavedWsUrl) {
          const pingResult = await stealthPing(lastSavedWsUrl, 3000);
          if (pingResult) {
            addLog('info', 'Stealth ping successful!');
            finalWsUrl = pingResult;
          } else {
            addLog('warning', 'Stealth ping failed. Saved IP may have changed.');
            throw new Error('Connection rejected. The hardware IP may have changed.');
          }
        } else {
          addLog('warning', 'No saved connection. Manual WLAN sweep required.');
          throw new Error('No previous connection found. Please use the WLAN Socket tab first.');
        }
      }
      // Manual WiFi via discovered/manual WS URL: connect directly (no native WiFi join flow)
      else if (type === 'wifi' && finalWsUrl) {
        // finalWsUrl is already resolved by scanner/manual input
      }
      // Manual WiFi by raw IP string
      else if (type === 'wifi' && identifier && identifier !== 'CURRENT_WIFI' && !identifier.includes('WLAN')) {
        // Check if it looks like an IP address
        if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(identifier)) {
          addLog('info', `Validating manual IP: ${identifier}`);
          finalWsUrl = await validateManualIP(identifier);
          if (!finalWsUrl) {
            throw new Error(`IP validation failed: ${identifier}`);
          }
        } else {
          // Regular WiFi network - just connect
          await connectWifi(identifier, password);
        }
      } else if (type === 'wifi') {
        if (identifier && identifier !== 'CURRENT_WIFI') {
          await connectWifi(identifier, password);
        }
      } else if (type === 'ble') {
        await connectBle(identifier);
      }

      // ⭐ Update API host if we have a new WS URL
      if (finalWsUrl) {
        setApiHost(finalWsUrl);
      }

      // ⭐ Connect WebSocket with discovered URL
      const resolvedType = type === 'auto' ? 'wifi' : type;
      connectWebSocket(finalWsUrl);
      setConnection(prev => ({ ...prev, connectionType: resolvedType }));
      addLog('info', `Connecting via ${type}`);
    } catch (error) {
      addLog('error', `Connection failed: ${String(error)}`);
      throw error;
    }
  }, [connectWebSocket, lastSavedWsUrl, addLog]);

  // ⭐ THE MISSING DISCONNECT FUNCTION
  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true;
    stoppingRef.current = false;
    startPendingRef.current = false;
    setSurvey(prev => ({ ...prev, isActive: false, status: 'idle' }));
    setIsAutoFlowActive(false);
    wsRef.current?.close();
    setConnection(prev => ({ ...prev, isConnected: false, connectionType: 'none' })); // Force UI reset
    addLog('info', 'Disconnected from device');
  }, [addLog]);

  /* ================= STREAM FUNCTIONS ================= */
  const toggleStream = useCallback(async (key: keyof StreamState, enabled: boolean) => {
    try {
      addLog('info', `${enabled ? 'Enabling' : 'Disabling'} ${key} stream`);
    } catch (error) {
      addLog('error', `Stream toggle failed: ${String(error)}`);
      throw error;
    }
  }, [addLog]);

  /* ================= SCAN FUNCTIONS ================= */
  const scanWiFi = useCallback(async () => {
    try {
      const networks = await scanWifi();
      setAvailableWiFiNetworks(networks);
      addLog('info', `Found ${networks.length} WiFi networks`);
    } catch (error) {
      addLog('error', `WiFi scan failed: ${String(error)}`);
    }
  }, [addLog]);

  const scanBLE = useCallback(async () => {
    try {
      const devices = await scanBleDevices();
      setAvailableBLEDevices(devices);
      addLog('info', `Found ${devices.length} BLE devices`);
    } catch (error) {
      addLog('error', `BLE scan failed: ${String(error)}`);
    }
  }, [addLog]);

  /* ================= CONFIG & SETTINGS ================= */
  const updateConfiguration = useCallback((config: Configuration) => {
    setConfiguration(config);
    try {
      localStorage.setItem(STORAGE_KEYS.configuration, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save configuration:', e);
    }

    if (config.baseStation.autoMode) {
      autoSurveyRunRef.current = false;
    }

    addLog('info', 'Configuration saved');
  }, [addLog]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save settings:', e);
      }
      return next;
    });
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);
  const exportHistoryCSV = useCallback(async () => {}, []);
  const exportLogsCSV = useCallback(async () => {}, []);

  /* ================= NTRIP FUNCTIONS ================= */
  const startNTRIP = useCallback(async (host: string, port: number, mountpoint: string, password: string, username?: string) => {
    try {
      addLog('info', `Starting NTRIP: ${host}:${port}/${mountpoint}`);
      setStreams((prev) => ({
        ...prev,
        ntrip: { ...prev.ntrip, enabled: true, active: false, mountpoint },
      }));
      await api.startNTRIP(host, port, mountpoint, password, username);
      setStreams((prev) => ({
        ...prev,
        ntrip: { ...prev.ntrip, active: true, mountpoint },
      }));
      setIsNtripUserArmed(true);
      addLog('info', 'NTRIP started successfully');
    } catch (error) {
      setIsNtripUserArmed(false);
      setStreams((prev) => ({
        ...prev,
        ntrip: { ...prev.ntrip, enabled: false, active: false },
      }));
      addLog('error', `NTRIP start failed: ${String(error)}`);
      throw error;
    }
  }, [addLog]);

  const stopNTRIP = useCallback(async () => {
    try {
      addLog('info', 'Stopping NTRIP');
      setIsNtripUserArmed(false);
      setStreams((prev) => ({
        ...prev,
        ntrip: { ...prev.ntrip, enabled: false, active: false, throughput: 0, uptime: 0, dataSent: 0 },
      }));
      await api.stopNTRIP();
      addLog('info', 'NTRIP stopped successfully');
    } catch (error) {
      setIsNtripUserArmed(false);
      addLog('error', `NTRIP stop failed: ${String(error)}`);
      throw error;
    }
  }, [addLog]);

  /* ================= SURVEY TIMER ================= */
  useEffect(() => {
    if (!survey.isActive) return;

    const surveyInterval = setInterval(() => {
      setSurvey((prev) => {
        const newElapsedTime = prev.elapsedTime + 1;
        const progress = Math.min(newElapsedTime / prev.requiredTime, 1);
        return { ...prev, elapsedTime: newElapsedTime, progress };
      });
    }, 1000);

    return () => clearInterval(surveyInterval);
  }, [survey.isActive]);

  /* ================= SURVEY STATUS POLL ================= */
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (!connection.isConnected) return;
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      try {
        const surveyStatus = await api.getSurveyStatus();
        if (surveyStatus && !stoppingRef.current) {
          setSurvey((prev) => {
            const pollAccuracy = (surveyStatus.accuracy_m ?? 0) * 100;
            const pollElapsed = surveyStatus.progress_seconds ?? prev.elapsedTime;
            const pollActive = surveyStatus.active ?? prev.isActive;
            const withinStartGrace =
              startPendingRef.current &&
              prev.isActive &&
              !pollActive &&
              (Date.now() - startInitiatedAtRef.current) < START_PENDING_GRACE_MS;
            
            const parseVal = (val: any) => val !== undefined && val !== null ? Number(val) : undefined;
            const pos = surveyStatus.position || surveyStatus.local_position || {};
            
            const pollLocalCoords = {
              meanX: parseVal(surveyStatus.mean_x_m ?? surveyStatus.meanX ?? surveyStatus.ecef_x ?? surveyStatus.x ?? pos.x ?? pos[0]) ?? prev.localCoordinates.meanX,
              meanY: parseVal(surveyStatus.mean_y_m ?? surveyStatus.meanY ?? surveyStatus.ecef_y ?? surveyStatus.y ?? pos.y ?? pos[1]) ?? prev.localCoordinates.meanY,
              meanZ: parseVal(surveyStatus.mean_z_m ?? surveyStatus.meanZ ?? surveyStatus.ecef_z ?? surveyStatus.z ?? pos.z ?? pos[2]) ?? prev.localCoordinates.meanZ,
              observations: surveyStatus.observations ?? prev.localCoordinates.observations,
            };

            if (pollActive) {
              startPendingRef.current = false;
            }

            if (withinStartGrace) {
              return {
                ...prev,
                elapsedTime: pollElapsed > 0 ? pollElapsed : prev.elapsedTime,
                currentAccuracy: pollAccuracy > 0 ? pollAccuracy : prev.currentAccuracy,
                localCoordinates: pollLocalCoords,
              };
            }

            return {
              ...prev,
              elapsedTime: pollElapsed > 0 ? pollElapsed : prev.elapsedTime,
              currentAccuracy: pollAccuracy > 0 ? pollAccuracy : prev.currentAccuracy,
              isActive: pollActive,
              localCoordinates: pollLocalCoords,
              status: pollActive ? "in-progress" : (prev.isActive && !pollActive ? "completed" : prev.status)
            };
          });
        }
      } catch (e) {
        console.warn("Survey status poll failed:", e);
      }
    }, survey.isActive ? 2000 : 5000);

    return () => clearInterval(pollInterval);
  }, [survey.isActive, connection.isConnected]);

  /* ================= UNIFIED SURVEY LIFECYCLE WATCHER ================= */
  const prevIsActive = useRef(survey.isActive);
  
  useEffect(() => {
    if (prevIsActive.current === false && survey.isActive === true) {
      setSurveyHistory((prev) => [{
        id: `SRV-START-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(),
        duration: 0,
        finalAccuracy: 0,
        targetAccuracy: survey.targetAccuracy,
        accuracyAttempts: [],
        coordinates: { latitude: 0, longitude: 0, altitude: 0, accuracy: 0 },
        localCoordinates: { meanX: 0, meanY: 0, meanZ: 0, observations: 0 },
        success: true,
        eventType: 'started',
        message: `Survey sequence initialized. Target: ${survey.targetAccuracy}cm`
      } as any, ...prev]);
    }

    if (prevIsActive.current === true && survey.isActive === false) {
      startPendingRef.current = false;
      
      if (survey.elapsedTime < 2 && survey.currentAccuracy === 0 && !stoppingRef.current) {
        console.warn("Ignored ghost state transition (API Polling lag)");
      } 
      else if (stoppingRef.current) {
        setSurveyHistory((prev) => [{
          id: `SRV-STOP-${Date.now().toString().slice(-6)}`,
          timestamp: new Date(),
          duration: survey.elapsedTime,
          finalAccuracy: survey.currentAccuracy,
          targetAccuracy: survey.targetAccuracy,
          accuracyAttempts: [],
          coordinates: { ...survey.position },
          localCoordinates: { ...survey.localCoordinates },
          success: false,
          eventType: 'stopped',
          message: 'Survey manually halted by operator.'
        } as any, ...prev]);
      } 
      else {
        const isSuccess = survey.currentAccuracy <= survey.targetAccuracy && survey.currentAccuracy > 0;
        
        setSurveyHistory((prev) => [{
          id: `SRV-${isSuccess ? 'COMP' : 'ERR'}-${Date.now().toString().slice(-6)}`,
          timestamp: new Date(),
          duration: survey.elapsedTime,
          finalAccuracy: survey.currentAccuracy,
          targetAccuracy: survey.targetAccuracy,
          accuracyAttempts: [],
          coordinates: { ...survey.position },
          localCoordinates: { ...survey.localCoordinates },
          success: isSuccess,
          eventType: isSuccess ? 'completed' : 'error',
          message: isSuccess ? 'Hardware reported successful convergence.' : 'Survey terminated without reaching target constraints.'
        } as any, ...prev]);

        addLog(isSuccess ? 'info' : 'warning', `Survey convergence complete. Accuracy: ${survey.currentAccuracy.toFixed(2)}cm`);
      }
    }
    
    prevIsActive.current = survey.isActive;
  }, [survey.isActive, survey.currentAccuracy, survey.targetAccuracy, survey.elapsedTime, survey.position, survey.localCoordinates, addLog]);

  /* ================= NTRIP STATUS POLL ================= */
  useEffect(() => {
    if (!connection.isConnected || isNtripUserArmed) return;

    // Enforce "manual start only" policy when app connects or restarts.
    setStreams((prev) => ({
      ...prev,
      ntrip: {
        ...prev.ntrip,
        enabled: false,
        active: false,
        throughput: 0,
        uptime: 0,
        dataSent: 0,
        lastError: null,
      },
    }));

    void api.stopNTRIP().catch(() => {
      // Best effort only; if backend is unreachable we still keep local NTRIP disabled.
    });
  }, [connection.isConnected, isNtripUserArmed]);

  useEffect(() => {
    const pollInterval = setInterval(async () => {
      if (!connection.isConnected) return;
      if (!isNtripUserArmed) return;
      try {
        const ntripStatus = await api.getNTRIP();
        if (ntripStatus) {
          setStreams((prev) => ({
            ...prev,
            ntrip: {
              ...prev.ntrip,
              enabled: ntripStatus.enabled ?? false,
              active: ntripStatus.connected ?? false,
              throughput: ntripStatus.data_rate_bps ?? 0,
              mountpoint: ntripStatus.mountpoint ?? prev.ntrip.mountpoint,
              uptime: ntripStatus.uptime_seconds ?? 0,
              dataSent: ntripStatus.bytes_sent ?? 0,
              lastError: null,
            },
          }));
        }
      } catch (e) {
        console.warn("NTRIP status poll failed:", e);
      }
    }, 2000);
    return () => clearInterval(pollInterval);
  }, [connection.isConnected, isNtripUserArmed]);

  /* ================= AUTO MODE ================= */
  useEffect(() => {
    if (
      configuration.baseStation.autoMode &&
      !survey.isActive &&
      connection.isConnected &&
      !stoppingRef.current &&
      !autoSurveyRunRef.current 
    ) {
      autoSurveyRunRef.current = true; 

      const timer = setTimeout(() => {
        startSurvey().catch(err => {
          console.error("Auto start failed", err);
          addLog('error', `Auto start failed: ${String(err)}`);
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [configuration.baseStation.autoMode, connection.isConnected, survey.isActive, startSurvey, addLog]);

  /* ================= CONFIG SYNC ================= */
  useEffect(() => {
    if (survey.isActive) {
      setSurvey((prev) => ({
        ...prev,
        requiredTime: configuration.baseStation.surveyDuration,
        targetAccuracy: configuration.baseStation.accuracyThreshold,
      }));
    }
  }, [configuration.baseStation.surveyDuration, configuration.baseStation.accuracyThreshold, survey.isActive]);

  /* ================= CONTEXT VALUE ================= */

  const value = useMemo(
    () => ({
      connection,
      connectToDevice,
      disconnect,
      survey,
      startSurvey,
      stopSurvey,
      isAutoFlowActive,
      gnssStatus,
      streams,
      toggleStream,
      configuration,
      updateConfiguration,
      settings,
      updateSettings,
      availableWiFiNetworks,
      availableBLEDevices,
      scanWiFi,
      scanBLE,
      surveyHistory,
      logs,
      addLog,
      clearLogs,
      deleteLogs,
      clearSurveyHistory,
      deleteSurveys,
      exportHistoryCSV,
      exportLogsCSV,
      startNTRIP,
      stopNTRIP,
    }),
    [connection, survey, isAutoFlowActive, gnssStatus, streams, configuration, settings, surveyHistory, logs, connectToDevice, disconnect, startSurvey, stopSurvey, toggleStream, updateConfiguration, updateSettings, scanWiFi, scanBLE, addLog, clearLogs, deleteLogs, clearSurveyHistory, deleteSurveys, exportHistoryCSV, exportLogsCSV, startNTRIP, stopNTRIP]
  );

  return (
    <GNSSContext.Provider value={value}>
      {children}
    </GNSSContext.Provider>
  );
};
