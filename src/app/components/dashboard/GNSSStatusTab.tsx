// import React from 'react';
// import { useGNSS } from '../../../context/GNSSContext';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
// import { Badge } from '../ui/badge';
// import { Satellite, Activity, Crosshair } from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

// export const GNSSStatusTab: React.FC = () => {
//   const { gnssStatus } = useGNSS();

//   const constellationColors: Record<string, string> = {
//     GPS: '#3b82f6',
//     GLONASS: '#ef4444',
//     Galileo: '#10b981',
//     BeiDou: '#f59e0b',
//   };

//   const getConstellationCount = (constellation: string) => {
//     return gnssStatus.satellites.filter(s => s.constellation === constellation && s.used).length;
//   };

//   const getFixTypeColor = () => {
//     switch (gnssStatus.fixType) {
//       case 'rtk-fixed':
//         return 'bg-green-500';
//       case 'rtk-float':
//         return 'bg-yellow-500';
//       case '3D':
//         return 'bg-blue-500';
//       case '2D':
//         return 'bg-orange-500';
//       default:
//         return 'bg-slate-400';
//     }
//   };

//   const getFixTypeLabel = () => {
//     // Show the raw fix type value from API directly
//     return gnssStatus.fixType || 'No Fix';
//   };

//   // Prepare SNR chart data
//   const snrChartData = gnssStatus.satellites
//     .filter(s => s.used)
//     .sort((a, b) => b.snr - a.snr)
//     .slice(0, 20)
//     .map(s => ({
//       name: `${s.constellation.substring(0, 3)}${s.id % 100}`,
//       snr: s.snr,
//       constellation: s.constellation,
//     }));

//   const averageSNR = gnssStatus.satellites.filter(s => s.used).length > 0
//     ? gnssStatus.satellites
//         .filter(s => s.used)
//         .reduce((sum, s) => sum + s.snr, 0) / gnssStatus.satellites.filter(s => s.used).length
//     : 0;

//   // Prepare sky plot data for polar chart
//   const skyPlotData = gnssStatus.satellites.map(s => ({
//     azimuth: s.azimuth,
//     elevation: s.elevation,
//     snr: s.snr,
//     constellation: s.constellation,
//     id: s.id,
//     used: s.used,
//   }));

//   return (
//     <div className="space-y-6">
//       {/* Satellite Sky Plot */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Satellite Sky Plot</CardTitle>
//           <CardDescription>Polar view of visible satellites by position</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="relative">
//             {/* Custom Polar Sky Plot */}
//             <div className="w-full aspect-square max-w-2xl mx-auto relative">
//               <svg viewBox="0 0 400 400" className="w-full h-full">
//                 {/* Background circles for elevation */}
//                 <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />
//                 <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />
//                 <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />
                
//                 {/* Cardinal directions */}
//                 <text x="200" y="25" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">N</text>
//                 <text x="375" y="205" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">E</text>
//                 <text x="200" y="385" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">S</text>
//                 <text x="25" y="205" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">W</text>
                
//                 {/* Elevation labels */}
//                 <text x="205" y="80" className="text-xs fill-slate-500">60°</text>
//                 <text x="205" y="140" className="text-xs fill-slate-500">30°</text>
                
//                 {/* Satellites */}
//                 {skyPlotData.map((sat, i) => {
//                   const radius = (90 - sat.elevation) * 2; // Convert elevation to radius
//                   const angle = (sat.azimuth - 90) * (Math.PI / 180); // Convert azimuth to radians
//                   const x = 200 + radius * Math.cos(angle);
//                   const y = 200 + radius * Math.sin(angle);
//                   const size = sat.used ? 8 : 5;
//                   const opacity = sat.snr / 55;
                  
//                   return (
//                     <g key={i}>
//                       <circle
//                         cx={x}
//                         cy={y}
//                         r={size}
//                         fill={constellationColors[sat.constellation]}
//                         opacity={opacity}
//                         stroke={sat.used ? 'white' : 'none'}
//                         strokeWidth="1"
//                       />
//                       <text
//                         x={x}
//                         y={y - 12}
//                         textAnchor="middle"
//                         className="text-[10px] fill-slate-700 dark:fill-slate-300 font-medium"
//                       >
//                         {sat.id % 100}
//                       </text>
//                     </g>
//                   );
//                 })}
//               </svg>
//             </div>

//             {/* Legend */}
//             <div className="flex flex-wrap justify-center gap-4 mt-6">
//               {Object.entries(constellationColors).map(([constellation, color]) => (
//                 <div key={constellation} className="flex items-center gap-2">
//                   <div className="size-3 rounded-full" style={{ backgroundColor: color }} />
//                   <span className="text-sm">
//                     {constellation} ({getConstellationCount(constellation)})
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Signal Quality Metrics */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Signal Quality Metrics</CardTitle>
//           <CardDescription>SNR distribution across visible satellites</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           {/* SNR Bar Chart */}
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={snrChartData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
//                 <XAxis 
//                   dataKey="name" 
//                   tick={{ fontSize: 11 }}
//                   className="text-slate-600 dark:text-slate-400"
//                 />
//                 <YAxis 
//                   label={{ value: 'SNR (dB-Hz)', angle: -90, position: 'insideLeft' }}
//                   className="text-slate-600 dark:text-slate-400"
//                 />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: 'rgba(0,0,0,0.8)', 
//                     border: 'none', 
//                     borderRadius: '8px',
//                     color: 'white'
//                   }}
//                 />
//                 <Bar dataKey="snr" radius={[4, 4, 0, 0]}>
//                   {snrChartData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={constellationColors[entry.constellation]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Average SNR and DOP Values */}
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <Activity className="size-5 mx-auto mb-2 text-blue-500" />
//               <div className="text-2xl font-bold">{gnssStatus.satellites.filter(s => s.used).length > 0 ? averageSNR.toFixed(1) : 'NIL'}</div>
//               <div className="text-xs text-slate-600 dark:text-slate-400">Avg SNR</div>
//             </div>

//             <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <Crosshair className="size-5 mx-auto mb-2 text-green-500" />
//               <div className="text-2xl font-bold">{gnssStatus.dop.hdop ? (gnssStatus.dop.hdop > 0 ? gnssStatus.dop.hdop.toFixed(2) : 'NIL') : 'NIL'}</div>
//               <div className="text-xs text-slate-600 dark:text-slate-400">HDOP</div>
//             </div>

//             <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <Crosshair className="size-5 mx-auto mb-2 text-yellow-500" />
//               <div className="text-2xl font-bold">{gnssStatus.dop.vdop ? (gnssStatus.dop.vdop > 0 ? gnssStatus.dop.vdop.toFixed(2) : 'NIL') : 'NIL'}</div>
//               <div className="text-xs text-slate-600 dark:text-slate-400">VDOP</div>
//             </div>

//             <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <Crosshair className="size-5 mx-auto mb-2 text-purple-500" />
//               <div className="text-2xl font-bold">{gnssStatus.dop.pdop ? (gnssStatus.dop.pdop > 0 ? gnssStatus.dop.pdop.toFixed(2) : 'NIL') : 'NIL'}</div>
//               <div className="text-xs text-slate-600 dark:text-slate-400">PDOP</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Receiver Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Receiver Information</CardTitle>
//           <CardDescription>GNSS receiver status and configuration</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid gap-3">
//             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <span className="text-sm text-slate-600 dark:text-slate-400">Fix Type</span>
//               <Badge className={getFixTypeColor()}>{getFixTypeLabel()}</Badge>
//             </div>

//             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <span className="text-sm text-slate-600 dark:text-slate-400">Firmware Version</span>
//               <span className="font-semibold">{gnssStatus.firmwareVersion && gnssStatus.firmwareVersion !== 'unknown' ? gnssStatus.firmwareVersion : 'NIL'}</span>
//             </div>

//             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <span className="text-sm text-slate-600 dark:text-slate-400">Update Rate</span>
//               <span className="font-semibold">{gnssStatus.updateRate > 0 ? gnssStatus.updateRate.toFixed(1) : 'NIL'} {gnssStatus.updateRate > 0 ? 'Hz' : ''}</span>
//             </div>

//             <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
//               <span className="text-sm text-slate-600 dark:text-slate-400">Last Update</span>
//               <span className="font-semibold text-xs">
//                 {gnssStatus.lastUpdate ? gnssStatus.lastUpdate.toLocaleTimeString() : 'NIL'}
//               </span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };





















































import React from 'react';
import { useGNSS } from '../../../context/GNSSContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Satellite, Activity, Crosshair } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from 'recharts';

export const GNSSStatusTab: React.FC = () => {
  // ==========================================
  // LOGIC FROM DESIGN 1
  // ==========================================
  const { gnssStatus } = useGNSS();

  const constellationColors: Record<string, string> = {
    GPS: '#3b82f6',
    GLONASS: '#ef4444',
    Galileo: '#10b981',
    BeiDou: '#f59e0b',
  };

  const getConstellationCount = (constellation: string) => {
    return gnssStatus.satellites.filter(s => s.constellation === constellation && s.used).length;
  };

  const getFixTypeColor = () => {
    switch (gnssStatus.fixType) {
      case 'rtk-fixed':
        return 'bg-green-500';
      case 'rtk-float':
        return 'bg-yellow-500';
      case '3D':
        return 'bg-blue-500';
      case '2D':
        return 'bg-orange-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getFixTypeLabel = () => {
    // Show the raw fix type value from API directly
    return gnssStatus.fixType || 'No Fix';
  };

  // Prepare SNR chart data
  const snrChartData = gnssStatus.satellites
    .filter(s => s.used)
    .sort((a, b) => b.snr - a.snr)
    .slice(0, 20)
    .map(s => ({
      name: `${s.constellation.substring(0, 3)}${s.id % 100}`,
      snr: s.snr,
      constellation: s.constellation,
    }));

  const averageSNR = gnssStatus.satellites.filter(s => s.used).length > 0
    ? gnssStatus.satellites
        .filter(s => s.used)
        .reduce((sum, s) => sum + s.snr, 0) / gnssStatus.satellites.filter(s => s.used).length
    : 0;

  // Prepare sky plot data for polar chart
  const skyPlotData = gnssStatus.satellites.map(s => ({
    azimuth: s.azimuth,
    elevation: s.elevation,
    snr: s.snr,
    constellation: s.constellation,
    id: s.id,
    used: s.used,
  }));

  // ==========================================
  // UI / JSX FROM DESIGN 2
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Satellite Sky Plot */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Satellite Sky Plot</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Polar view of visible satellites by position</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Custom Polar Sky Plot */}
            <div className="w-full aspect-square max-w-2xl mx-auto relative">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Background circles for elevation */}
                <circle cx="200" cy="200" r="180" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
                <circle cx="200" cy="200" r="120" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
                <circle cx="200" cy="200" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-800" />
                
                {/* Cardinal directions */}
                <text x="200" y="25" textAnchor="middle" className="text-xs font-bold fill-slate-500 dark:fill-slate-400">N</text>
                <text x="375" y="205" textAnchor="middle" className="text-xs font-bold fill-slate-500 dark:fill-slate-400">E</text>
                <text x="200" y="385" textAnchor="middle" className="text-xs font-bold fill-slate-500 dark:fill-slate-400">S</text>
                <text x="25" y="205" textAnchor="middle" className="text-xs font-bold fill-slate-500 dark:fill-slate-400">W</text>
                
                {/* Elevation labels */}
                <text x="205" y="80" className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500">60°</text>
                <text x="205" y="140" className="text-[10px] font-semibold fill-slate-400 dark:fill-slate-500">30°</text>
                
                {/* Satellites */}
                {skyPlotData.map((sat, i) => {
                  const radius = (90 - sat.elevation) * 2; 
                  const angle = (sat.azimuth - 90) * (Math.PI / 180); 
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  const size = sat.used ? 8 : 5;
                  const opacity = sat.snr / 55;
                  
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        fill={constellationColors[sat.constellation]}
                        opacity={opacity}
                        stroke={sat.used ? 'white' : '#0f172a'} // slate-900 outline for dark
                        strokeWidth="1"
                      />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-900 dark:fill-slate-50 font-bold"
                      >
                        {sat.id % 100}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {Object.entries(constellationColors).map(([constellation, color]) => (
                <div key={constellation} className="flex items-center gap-2">
                  <div className="size-3 rounded-full shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {constellation} <span className="text-slate-500 dark:text-slate-400 font-normal">({getConstellationCount(constellation)})</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signal Quality Metrics */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Signal Quality Metrics</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">SNR distribution across visible satellites</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* SNR Bar Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={snrChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11 }}
                  className="text-slate-500 dark:text-slate-400 font-medium"
                />
                <YAxis 
                  label={{ value: 'SNR (dB-Hz)', angle: -90, position: 'insideLeft', fill: 'currentColor' }}
                  className="text-slate-500 dark:text-slate-400 font-medium"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#020617', // slate-950
                    border: '1px solid #1e293b', // slate-800
                    borderRadius: '8px',
                    color: '#f8fafc', // slate-50 text
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
                  }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 600 }}
                />
                <Bar dataKey="snr" radius={[4, 4, 0, 0]}>
                  {snrChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={constellationColors[entry.constellation]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average SNR and DOP Values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
              <Activity className="size-5 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-50">{gnssStatus.satellites.filter(s => s.used).length > 0 ? averageSNR.toFixed(1) : 'NIL'}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Avg SNR</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
              <Crosshair className="size-5 mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-50">{gnssStatus.dop.hdop ? (gnssStatus.dop.hdop > 0 ? gnssStatus.dop.hdop.toFixed(2) : 'NIL') : 'NIL'}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">HDOP</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
              <Crosshair className="size-5 mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-50">{gnssStatus.dop.vdop ? (gnssStatus.dop.vdop > 0 ? gnssStatus.dop.vdop.toFixed(2) : 'NIL') : 'NIL'}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">VDOP</div>
            </div>

            <div className="text-center p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
              <Crosshair className="size-5 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-50">{gnssStatus.dop.pdop ? (gnssStatus.dop.pdop > 0 ? gnssStatus.dop.pdop.toFixed(2) : 'NIL') : 'NIL'}</div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">PDOP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receiver Information */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-slate-50">Receiver Information</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">GNSS receiver status and configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Fix Type</span>
              <Badge className={`${getFixTypeColor()} text-white border-none`}>{getFixTypeLabel()}</Badge>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Firmware Version</span>
              <span className="font-bold text-slate-900 dark:text-slate-50">{gnssStatus.firmwareVersion && gnssStatus.firmwareVersion !== 'unknown' ? gnssStatus.firmwareVersion : 'NIL'}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Update Rate</span>
              <span className="font-bold text-slate-900 dark:text-slate-50">{gnssStatus.updateRate > 0 ? gnssStatus.updateRate.toFixed(1) : 'NIL'} {gnssStatus.updateRate > 0 ? 'Hz' : ''}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Last Update</span>
              <span className="font-bold font-mono text-sm text-slate-900 dark:text-slate-50">
                {gnssStatus.lastUpdate ? gnssStatus.lastUpdate.toLocaleTimeString() : 'NIL'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};