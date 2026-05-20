import React, { useState, useEffect, useRef } from 'react';
import { useGNSS } from '../../../context/GNSSContext';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  Play,
  Square,
  MapPin,
  CheckCircle2,
  Clock,
  Target,
  Satellite,
  Radio, 
  Activity, 
  Download,
  RefreshCw,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { uiLogger } from '../../../utils/uiLogger';

interface AccuracyRecord {
  accuracy: number;
  elapsedTime: string;
  isSuccess: boolean;
}

export const SurveyStatus: React.FC = () => {
  // ==========================================
  // LOGIC BLOCK - COMPLETELY UNTOUCHED
  // ==========================================
  const {
    survey,
    startSurvey,
    stopSurvey,
    configuration,
    gnssStatus,
    streams,
    isAutoFlowActive,
    isAutoFlowSessionActive,
    autoFlowRuntime,
    savedBasePosition,
    confirmResurvey,
    skipResurvey,
  } = useGNSS();
  const [coordinateFormat, setCoordinateFormat] = useState<'Global' | 'Local'>('Global');
  const [isLoading, setIsLoading] = useState(false);
  const [accuracyHistory, setAccuracyHistory] = useState<AccuracyRecord[]>([]);
  const [finalAccuracyRecord, setFinalAccuracyRecord] = useState<AccuracyRecord | null>(null);
  const [showAccuracyHistory, setShowAccuracyHistory] = useState(false);
  const [displayElapsedTime, setDisplayElapsedTime] = useState(0);
  const [smoothElapsedTime, setSmoothElapsedTime] = useState(0);
  const [confirmCountdown, setConfirmCountdown] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<'start' | 'stop' | 'decision' | null>(null);
  const prevIsActiveRef = useRef(survey.isActive);
  const prevStatusRef = useRef(survey.status);
  const startToastIdRef = useRef<string>('survey-start-loading');
  const isStartToastOpenRef = useRef(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const surveyStartedAtRef = useRef<number | null>(null);
  const hasMetTargetAccuracy = survey.valid || (survey.currentAccuracy > 0 && survey.currentAccuracy <= survey.targetAccuracy);
  const showFixedIndicators = !survey.isActive && survey.status !== 'stopped' && hasMetTargetAccuracy;
  const hasAutoFlowControl = isAutoFlowActive || isAutoFlowSessionActive;
  const isNtripStreaming = streams.ntrip.active;
  const isStreamingConnected = isNtripStreaming || (streams.ntrip.enabled && hasAutoFlowControl);
  const showBaseFixedBanner = Boolean(savedBasePosition) && !autoFlowRuntime.isAwaitingConfirm && !survey.isActive;
  const shouldShowStreamingState = isNtripStreaming && !survey.isActive;
  const isFixedBaseState = showBaseFixedBanner || showFixedIndicators;
  const shouldShowStartLoadingToast =
    pendingAction === 'start' &&
    survey.status === 'initializing' &&
    !survey.isActive &&
    !shouldShowStreamingState &&
    !isFixedBaseState &&
    !autoFlowRuntime.isAwaitingConfirm;
  const shouldShowStopButton = !autoFlowRuntime.isAwaitingConfirm && (
    survey.isActive ||
    survey.status === 'initializing' ||
    hasAutoFlowControl ||
    isStreamingConnected
  );

  const requiredTimeSecs = survey.requiredTime > 0 ? survey.requiredTime : configuration.baseStation.surveyDuration;

  useEffect(() => {
    if (survey.status === 'initializing') {
      setDisplayElapsedTime(0);
      setSmoothElapsedTime(0);
      surveyStartedAtRef.current = null;
      return;
    }

    if (survey.isActive) {
      const safeElapsed = Math.max(0, Math.floor(survey.elapsedTime));
      setDisplayElapsedTime(safeElapsed);

      if (surveyStartedAtRef.current === null) {
        surveyStartedAtRef.current = Date.now() - safeElapsed * 1000;
      }

      const tick = () => {
        if (surveyStartedAtRef.current === null) {
          setSmoothElapsedTime(safeElapsed);
          return;
        }

        const runtimeSeconds = Math.floor((Date.now() - surveyStartedAtRef.current) / 1000);
        setSmoothElapsedTime(Math.min(Math.max(runtimeSeconds, safeElapsed), requiredTimeSecs));
      };

      tick();
      const interval = setInterval(tick, 250);
      return () => clearInterval(interval);
    }

    const settledElapsed = Math.min(survey.elapsedTime, requiredTimeSecs);
    setDisplayElapsedTime(settledElapsed);
    setSmoothElapsedTime(settledElapsed);
    surveyStartedAtRef.current = null;
  }, [survey.elapsedTime, survey.isActive, survey.status, requiredTimeSecs]);

  useEffect(() => {
    prevIsActiveRef.current = survey.isActive;
  }, [survey.isActive]);

  const clampedElapsedTime = Math.min(smoothElapsedTime, requiredTimeSecs);

  useEffect(() => {
    if (shouldShowStartLoadingToast) {
      if (!isStartToastOpenRef.current) {
        toast.loading('Starting survey...', { id: startToastIdRef.current });
        isStartToastOpenRef.current = true;
      }
      return;
    }

    if (isStartToastOpenRef.current) {
      toast.dismiss(startToastIdRef.current);
      isStartToastOpenRef.current = false;
    }
  }, [shouldShowStartLoadingToast]);

  useEffect(() => {
    if (!isStartToastOpenRef.current) {
      return;
    }

    const isStillStarting = pendingAction === 'start' && (survey.status === 'initializing' || survey.isActive);
    if (isStillStarting) {
      return;
    }

    toast.dismiss(startToastIdRef.current);
    isStartToastOpenRef.current = false;
  }, [isLoading, survey.status, survey.isActive, shouldShowStreamingState, isFixedBaseState, autoFlowRuntime.isAwaitingConfirm]);

  useEffect(() => {
    return () => {
      toast.dismiss(startToastIdRef.current);
    };
  }, []);

  useEffect(() => {
    if (pendingAction === 'start') {
      const startSettled =
        survey.status === 'in-progress' ||
        autoFlowRuntime.isAwaitingConfirm ||
        shouldShowStreamingState ||
        showBaseFixedBanner ||
        showFixedIndicators ||
        survey.status === 'failed';

      if (startSettled) {
        if (survey.status === 'in-progress') {
          uiLogger.log('Survey Started Successfully', 'SurveyStatus');
          toast.success('Survey started');
        } else if (shouldShowStreamingState) {
          toast.success('Streaming started');
        } else if (autoFlowRuntime.isAwaitingConfirm) {
          toast.info('Position changed. Choose Resurvey or Skip Resurvey.');
        }

        setPendingAction(null);
        setIsLoading(false);
      }
      return;
    }

    if (pendingAction === 'stop') {
      const stopSettled =
        survey.status === 'stopped' &&
        !survey.isActive &&
        !isAutoFlowActive &&
        !isAutoFlowSessionActive &&
        !streams.ntrip.active;

      if (stopSettled) {
        setPendingAction(null);
        setIsLoading(false);
      }
      return;
    }

    if (pendingAction === 'decision') {
      if (!autoFlowRuntime.isAwaitingConfirm) {
        setPendingAction(null);
        setIsLoading(false);
      }
    }
  }, [
    autoFlowRuntime.isAwaitingConfirm,
    isAutoFlowActive,
    isAutoFlowSessionActive,
    pendingAction,
    shouldShowStreamingState,
    showBaseFixedBanner,
    showFixedIndicators,
    streams.ntrip.active,
    survey.isActive,
    survey.status,
  ]);

  useEffect(() => {
    const percentage = requiredTimeSecs > 0
      ? Math.min((clampedElapsedTime / requiredTimeSecs) * 100, 100)
      : 0;
    setProgressPercentage(percentage);
  }, [clampedElapsedTime, requiredTimeSecs]);

  useEffect(() => {
    if (!autoFlowRuntime.isAwaitingConfirm || !autoFlowRuntime.deadlineAt) {
      setConfirmCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const remainingMs = autoFlowRuntime.deadlineAt!.getTime() - Date.now();
      setConfirmCountdown(Math.max(0, Math.ceil(remainingMs / 1000)));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [autoFlowRuntime.deadlineAt, autoFlowRuntime.isAwaitingConfirm]);

  const surveWasActiveRef = useRef(false);
  useEffect(() => {
    if (!survey.isActive && surveWasActiveRef.current === true) {
      uiLogger.log('Survey ended', 'SurveyStatus', {
        finalAccuracy: survey.currentAccuracy,
        duration: survey.elapsedTime,
      });
    }
    surveWasActiveRef.current = survey.isActive;
  }, [survey.isActive, survey.currentAccuracy, survey.elapsedTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCoordinate = () => {
    if (coordinateFormat === 'Global') {
      return {
        lat: Number.isFinite(gnssStatus.globalPosition.latitude) && gnssStatus.globalPosition.latitude !== 0 ? gnssStatus.globalPosition.latitude.toFixed(8) : 'NIL',
        lon: Number.isFinite(gnssStatus.globalPosition.longitude) && gnssStatus.globalPosition.longitude !== 0 ? gnssStatus.globalPosition.longitude.toFixed(8) : 'NIL',
        alt: Number.isFinite(gnssStatus.globalPosition.altitude) && gnssStatus.globalPosition.altitude !== 0 ? gnssStatus.globalPosition.altitude.toFixed(3) : 'NIL',
      };
    }

    if (savedBasePosition) {
      const x = Number(savedBasePosition.ecef_x);
      const y = Number(savedBasePosition.ecef_y);
      const z = Number(savedBasePosition.ecef_z);
      return {
        lat: Number.isFinite(x) ? x.toFixed(4) : 'NIL',
        lon: Number.isFinite(y) ? y.toFixed(4) : 'NIL',
        alt: Number.isFinite(z) ? z.toFixed(4) : 'NIL',
      };
    }

    return {
      lat: 'NIL',
      lon: 'NIL',
      alt: 'NIL',
    };
  };

  const coords = formatCoordinate();

  const normalizeFileName = (input: string, ext: string) => {
    const cleaned = input.trim().replace(/[<>:"/\\|?*]+/g, '_');
    const safe = cleaned || `position_${new Date().toISOString().split('T')[0]}`;
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

  const exportPositionFile = async () => {
    const defaultName = `position_${new Date().toISOString().split('T')[0]}`;
    const inputName = window.prompt('Enter file name', defaultName);
    if (!inputName) return;

    if (!savedBasePosition) {
      toast.error('No saved base position found (cannot export accuracy).');
      return;
    }

    const lat = Number(savedBasePosition.latitude);
    const lon = Number(savedBasePosition.longitude);
    const alt = Number(savedBasePosition.altitude);
    const accuracy = Number(savedBasePosition.accuracy);

    if (![lat, lon, alt].every((v) => Number.isFinite(v)) || lat === 0 || lon === 0) {
      toast.error('No valid global position to export');
      return;
    }

    const payload = {
      format: 'gnss-position-export',
      version: 1,
      name: normalizeFileName(inputName, 'json'),
      exported_at: new Date().toISOString(),
      accuracy_m: Number.isFinite(accuracy) ? accuracy : 0,
      global_llh: { latitude: lat, longitude: lon, altitude: alt },
      local_xyz: { x: savedBasePosition.ecef_x, y: savedBasePosition.ecef_y, z: savedBasePosition.ecef_z },
    };

    try {
      const fileName = payload.name;
      await downloadOrShareFile(fileName, JSON.stringify(payload, null, 2), 'application/json', 'Position exported');
      uiLogger.log('Export Position', 'SurveyStatus', payload);
    } catch (error) {
      toast.error(`Position export failed: ${String(error)}`);
    }
  };

  const handleStartSurvey = async () => {
    try {
      setPendingAction('start');
      setIsLoading(true);
      setAccuracyHistory([]);
      setFinalAccuracyRecord(null);
      uiLogger.log('Start Survey Button Clicked', 'SurveyStatus', {
        duration: configuration.baseStation.surveyDuration,
        accuracy: configuration.baseStation.accuracyThreshold,
      });

      await startSurvey();
    } catch (error) {
      setPendingAction(null);
      const errorMsg = error instanceof Error ? error.message : String(error);
      toast.dismiss(startToastIdRef.current);
      isStartToastOpenRef.current = false;
      uiLogger.log('Start Survey Failed', 'SurveyStatus', undefined, errorMsg);
      toast.error(`Failed to start survey: ${errorMsg}`);
      setIsLoading(false);
    }
  };

  const handleStopSurvey = async () => {
    try {
      toast.dismiss(startToastIdRef.current);
      isStartToastOpenRef.current = false;
      setPendingAction('stop');
      setIsLoading(true);
      uiLogger.log('Stop Survey Button Clicked', 'SurveyStatus', {
        elapsedTime: survey.elapsedTime,
        accuracy: `${(survey.currentAccuracy).toFixed(1)}cm`,
      });

      await stopSurvey();

      uiLogger.log('Survey Stopped Successfully', 'SurveyStatus');
      toast.success('Survey stopped');
    } catch (error) {
      setPendingAction(null);
      const errorMsg = error instanceof Error ? error.message : String(error);
      uiLogger.log('Stop Survey Failed', 'SurveyStatus', undefined, errorMsg);
      toast.error(`Failed to stop survey: ${errorMsg}`);
    } finally {
      if (pendingAction !== 'stop') {
        setIsLoading(false);
      }
    }
  };

  const getDisplayStatus = () => {
    if (autoFlowRuntime.isAwaitingConfirm) return 'Awaiting Confirm';
    if (survey.isActive) return 'In Progress';
    if (shouldShowStreamingState) return 'Streaming';
    if (survey.status === 'initializing') return 'Initializing';
    if (survey.status === 'stopped') return 'Stopped';
    if (isFixedBaseState) return 'Fixed Base';
    return 'Standby';
  };

  const handleConfirmResurvey = async () => {
    try {
      setPendingAction('decision');
      setIsLoading(true);
      await confirmResurvey();
      toast.success('Resurvey confirmed');
    } catch (error) {
      setPendingAction(null);
      toast.error(`Failed to confirm resurvey: ${String(error)}`);
    } finally {
      if (pendingAction !== 'decision') {
        setIsLoading(false);
      }
    }
  };

  const handleSkipResurvey = async () => {
    try {
      setPendingAction('decision');
      setIsLoading(true);
      await skipResurvey();
      toast.success('Saved position kept');
    } catch (error) {
      setPendingAction(null);
      toast.error(`Failed to skip resurvey: ${String(error)}`);
    } finally {
      if (pendingAction !== 'decision') {
        setIsLoading(false);
      }
    }
  };

  const getStatusColorInfo = () => {
    if (autoFlowRuntime.isAwaitingConfirm) return { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500 animate-pulse' };
    if (survey.isActive) return survey.status === 'initializing' ? { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500 animate-pulse' } : { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500 animate-pulse' };
    if (shouldShowStreamingState) return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500 animate-pulse' };
    if (survey.status === 'initializing') return { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500 animate-pulse' };
    if (survey.status === 'stopped') return { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
    if (isFixedBaseState) return { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
    return { bg: 'bg-slate-50 dark:bg-slate-800/50', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' };
  };

  const lockedAccuracy = useRef<number>(0);
  const lockedTime = useRef<number>(0);

  useEffect(() => {
    if (!survey.isActive && clampedElapsedTime > 0) {
      lockedAccuracy.current = survey.currentAccuracy;
      lockedTime.current = clampedElapsedTime; 
    } else if (survey.isActive) {
      lockedAccuracy.current = 0;
      lockedTime.current = 0;
    }
  }, [survey.isActive, survey.currentAccuracy, clampedElapsedTime]);

  const livePositionAccuracyM = gnssStatus.globalPosition.horizontalAccuracy > 0
    ? Number(gnssStatus.globalPosition.horizontalAccuracy)
    : 0;
  const savedPositionAccuracyM = savedBasePosition?.accuracy && savedBasePosition.accuracy > 0
    ? Number(savedBasePosition.accuracy)
    : 0;

  const displayAccuracyCm = (survey.isActive || survey.status === 'initializing')
    ? (livePositionAccuracyM > 0 ? livePositionAccuracyM * 100 : 0)
    : (savedPositionAccuracyM > 0
      ? savedPositionAccuracyM * 100
      : (livePositionAccuracyM > 0 ? livePositionAccuracyM * 100 : (!savedBasePosition && lockedAccuracy.current > 0 ? lockedAccuracy.current : 0)));
  const displaySatelliteCount = survey.satelliteCount > 0
    ? survey.satelliteCount
    : gnssStatus.satellites.length > 0
    ? gnssStatus.satellites.length
    : 0;
  const finalDisplayTime = !survey.isActive && lockedTime.current > 0 ? lockedTime.current : clampedElapsedTime;

  const statusColors = getStatusColorInfo();

  // ==========================================
  // UPDATED MINIMAL & INTERACTIVE UI
  // ==========================================
  return (
    <div className="flex flex-col gap-5 p-1">
      
      {/* ── BENTO GRID TOP SECTION ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Main Status & Timer Card */}
        <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] p-6 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          
          {/* Top Row: Title & Glowing Status Pill */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">Session</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {isFixedBaseState ? 'Reference Active' : 'Real-time Mode'}
              </p>
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusColors.bg}`}>
              <div className={`size-2 rounded-full ${statusColors.dot}`} />
              <span className={`text-xs font-bold tracking-wide uppercase ${statusColors.text}`}>
                {getDisplayStatus()}
              </span>
            </div>
          </div>

          {/* Time Display & Circular Progress */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Elapsed</span>
              <div className="flex items-baseline gap-2 text-slate-900 dark:text-white">
                <span className="text-5xl font-light tracking-tighter tabular-nums">{formatTime(finalDisplayTime)}</span>
                <span className="text-lg font-medium text-slate-400 tabular-nums">/ {formatTime(requiredTimeSecs)}</span>
              </div>
            </div>

            {/* Ultra-minimal progress ring */}
            <div className="relative size-16">
              <svg className="size-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="6" />
                <circle 
                  cx="50" cy="50" r="46" fill="none" 
                  className={`transition-all duration-500 ease-out ${progressPercentage >= 100 ? 'stroke-emerald-500' : 'stroke-blue-500'}`} 
                  strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${(progressPercentage / 100) * 289} 289`}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Controls & Small Metrics */}
        <div className="md:col-span-1 flex flex-col gap-4">
          
          {/* Action Button Container */}
          <div className="p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-sm flex flex-col gap-3 justify-center h-full">
            
            {autoFlowRuntime.isAwaitingConfirm ? (
              <>
                <div className="text-center pb-2">
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">Position Changed</p>
                  <p className="text-[10px] text-slate-500">{confirmCountdown !== null ? `Auto-skip in ${confirmCountdown}s` : 'Waiting...'}</p>
                </div>
                <Button onClick={handleConfirmResurvey} className="w-full rounded-2xl h-12 bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-transform active:scale-[0.98]" disabled={isLoading}>
                  Confirm Resurvey
                </Button>
                <Button onClick={handleSkipResurvey} variant="ghost" className="w-full rounded-2xl h-10 text-slate-500 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-transform active:scale-[0.98]" disabled={isLoading}>
                  Skip
                </Button>
              </>
            ) : shouldShowStopButton ? (
              <Button onClick={handleStopSurvey} variant="destructive" className="w-full rounded-2xl h-14 font-semibold text-base shadow-md shadow-red-500/20 transition-all hover:shadow-lg active:scale-[0.98]" disabled={isLoading}>
                End Session
              </Button>
            ) : (
              <Button 
                onClick={handleStartSurvey} 
                className="w-full rounded-2xl h-14 bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 font-semibold text-base shadow-md transition-all hover:shadow-lg active:scale-[0.98]" 
                disabled={isLoading || survey.status === 'initializing'}
              >
                {survey.status === 'initializing' ? 'Initializing...' : 'Start Survey'}
              </Button>
            )}

          </div>
        </div>
      </div>

      {/* ── METRICS ROW (Hover Cards) ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Target', val: `${parseFloat(((survey.isActive ? survey.targetAccuracy : configuration.baseStation.accuracyThreshold)).toFixed(0))}cm`, icon: Target, active: true },
          { label: 'Sats', val: displaySatelliteCount || '--', icon: Satellite, active: displaySatelliteCount > 0 },
          { label: 'L - Accuracy', val: displayAccuracyCm > 0 ? `${displayAccuracyCm.toFixed(1)}cm` : '--', icon: CheckCircle2, active: displayAccuracyCm > 0 }
        ].map((item, i) => (
          <div key={i} className="group cursor-default rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800/40 p-4 transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:-translate-y-0.5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{item.label}</span>
              <item.icon className={`size-3.5 transition-colors duration-300 ${item.active ? 'text-slate-800 dark:text-slate-200 group-hover:text-blue-500' : 'text-slate-300 dark:text-slate-700'}`} />
            </div>
            <div className="text-xl font-semibold text-slate-900 dark:text-white tabular-nums">{item.val}</div>
          </div>
        ))}
      </div>

      {/* ── FLOATING NTRIP STRIP ── */}
      {(streams?.ntrip?.active || (streams?.ntrip?.enabled && (isAutoFlowSessionActive || isAutoFlowActive))) && (
        <div className="relative overflow-hidden rounded-3xl bg-blue-500 text-white p-5 shadow-lg shadow-blue-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-blue-500/30">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
             <Radio className="size-32 transform rotate-12" />
          </div>
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="size-2 rounded-full bg-white animate-ping" />
            <div>
              <p className="text-xs font-medium text-blue-100 uppercase tracking-widest">Broadcasting</p>
              <p className="font-semibold text-lg">{streams.ntrip.mountpoint || 'RTCM_V3'}</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-6 bg-black/10 rounded-2xl px-4 py-2 backdrop-blur-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 uppercase font-semibold">Speed</span>
              <span className="font-mono font-medium">{(streams.ntrip.throughput / 1024).toFixed(1)} kb/s</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex flex-col">
              <span className="text-[10px] text-blue-200 uppercase font-semibold">Uptime</span>
              <span className="font-mono font-medium">{Math.floor(streams.ntrip.uptime / 60)}:{String(streams.ntrip.uptime % 60).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── COORDINATES ACCORDION/TABS ── */}
      <div className="rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 shadow-sm overflow-hidden">
        
        {/* Minimal segmented control for tabs */}
        <div className="p-2 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
          <Tabs value={coordinateFormat} onValueChange={(v) => setCoordinateFormat(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl p-1 h-10">
              <TabsTrigger value="Global" className="rounded-xl font-semibold text-xs transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Global GNSS</TabsTrigger>
              <TabsTrigger value="Local" className="rounded-xl font-semibold text-xs transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">Local Survey</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Clean Data List */}
        <div className="px-6 py-4 space-y-1">
          {[
            { label: coordinateFormat === 'Global' ? 'Latitude' : 'ECEF X', val: coords.lat },
            { label: coordinateFormat === 'Global' ? 'Longitude' : 'ECEF Y', val: coords.lon },
            { label: coordinateFormat === 'Global' ? 'Altitude (MSL)' : 'ECEF Z', val: coords.alt },
          ].map((row, i) => (
            <div key={i} className="group flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:px-2 transition-all duration-300 cursor-default rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/30">
              <span className="text-sm font-medium text-slate-500 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-200">{row.label}</span>
              <span className="font-mono text-sm font-medium text-slate-900 dark:text-white tabular-nums">{row.val}</span>
            </div>
          ))}
        </div>

        {/* Seamless Export Action */}
        <button 
          onClick={exportPositionFile}
          className="w-full flex items-center justify-center gap-2 py-4 text-xs font-semibold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <Download className="size-4" /> Export Location Data
        </button>
      </div>

    </div>
  );
};