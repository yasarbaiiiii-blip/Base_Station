import React, { useState, useEffect } from 'react';
import { GNSSProvider, useGNSS } from '../context/GNSSContext';
import { ConnectionScreen } from './components/ConnectionScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ConfigurationScreen } from './components/ConfigurationScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Toaster } from './components/ui/sonner';
import { BackendLoggerDebugPanel } from './components/BackendLoggerDebugPanel';
import { uiLogger } from '../utils/uiLogger';
import {
  Home,
  Settings,
  History,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

type Screen = 'connection' | 'dashboard' | 'configuration' | 'history' | 'settings';

const AppContent: React.FC = () => {
  const { connection, disconnect, settings, survey } = useGNSS();
  const [currentScreen, setCurrentScreen] = useState<Screen>('connection');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Apply theme on mount and when settings change
  useEffect(() => {
    const applyTheme = () => {
      const htmlElement = document.documentElement;
      if (settings.theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      } else if (settings.theme === 'dark') {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(applyTheme);

    return () => mediaQuery.removeListener(applyTheme);
  }, [settings.theme]);

  // Auto-navigate to dashboard when connected
  useEffect(() => {
    if (connection.isConnected && currentScreen === 'connection') {
      setCurrentScreen('dashboard');
    }
  }, [connection.isConnected, currentScreen]);

  // Trigger auto-start survey event when dashboard is shown
  useEffect(() => {
    if (currentScreen === 'dashboard' && connection.isConnected) {
      // Dispatch custom event to trigger auto-start survey
      window.dispatchEvent(new CustomEvent('dashboard-navigated'));
    }
  }, [currentScreen, connection.isConnected]);

  const handleDisconnect = () => {
    uiLogger.log('Disconnect button clicked', 'App');
    disconnect();
    setCurrentScreen('connection');
    uiLogger.log('Navigated to Connection Screen', 'App');
  };

  const handleScreenChange = (screen: Screen) => {
    uiLogger.log(`Maps to ${screen}`, 'App', { screen });
    setCurrentScreen(screen);
    setMobileMenuOpen(false);
  };

  // Listen for reconfigure button click
  useEffect(() => {
    const handleNavigation = () => {
      handleScreenChange('configuration');
    };
    window.addEventListener('navigate-to-configuration', handleNavigation);
    return () => window.removeEventListener('navigate-to-configuration', handleNavigation);
  }, []);

  const navItems = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: Home },
    { id: 'configuration' as Screen, label: 'Configuration', icon: Settings },
    { id: 'history' as Screen, label: 'History', icon: History },
    { id: 'settings' as Screen, label: 'Settings', icon: FileText },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'connection':
        return <ConnectionScreen />;
      case 'dashboard':
        return <DashboardScreen />;
      case 'configuration':
        return <ConfigurationScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <ConnectionScreen />;
    }
  };

  // If not connected and no active survey, show only connection screen
  if (!connection.isConnected && !survey.isActive) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 transition-colors duration-300">
        <div key="connection-screen" className="animate-in fade-in zoom-in-[0.99] duration-200 ease-out">
          <ConnectionScreen />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex overflow-hidden transition-colors duration-300">

      {/* ── Desktop Sidebar (fixed left) ── */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50">
        <div className="p-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            GNSS Base Station
          </h1>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
            RTK Configuration
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleScreenChange(item.id)}
                // Added active:scale-95 for the click squish effect
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${currentScreen === item.id
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                <Icon className="size-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleDisconnect}
            // Added active:scale-95 and the solid red styling
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all active:scale-95 shadow-sm"
          >
            <LogOut className="size-5" />
            <span>Disconnect</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Header (fixed top) ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
            GNSS Base Station
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            // Added active:scale-90 for a snappy tap effect on mobile
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-90"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <nav className="p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleScreenChange(item.id)}
                    // Added active:scale-95
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 ${currentScreen === item.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-50 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                  >
                    <Icon className="size-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleDisconnect}
                  // Added active:scale-95 and solid red styling
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-md bg-red-700 hover:bg-red-800 text-white font-medium transition-all active:scale-95 shadow-sm"
                >
                  <LogOut className="size-5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

{/* ── Main Content ── */}
      {/* Desktop: offset by sidebar width; Mobile: offset by fixed header height */}
      <main className="flex-1 overflow-y-auto md:ml-64 mt-[60px] md:mt-0 overflow-x-hidden">
        {/* The key={currentScreen} is the magic trick here. 
          It tells React to completely rebuild this div on every navbar click, 
          which forces the smooth slide-in animation to play every time! 
        */}
        <div 
          key={currentScreen} 
          className="animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out h-full"
        >
          {renderScreen()}
        </div>
      </main>

      <Toaster />
      {import.meta.env.MODE === 'development' && (
        <BackendLoggerDebugPanel />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GNSSProvider>
      <AppContent />
    </GNSSProvider>
  );
};

export default App;










































