import React from 'react';
import { Flight, FlightStatus } from '../types';
import { Plane, AlertTriangle, Check, Clock } from 'lucide-react';

interface FlightRowProps {
  flight: Flight;
}

const getStatusStyles = (status: FlightStatus) => {
  switch (status) {
    case FlightStatus.Landed:
      return { bg: 'bg-emerald-900/30 text-emerald-400', iconColor: 'text-emerald-400', text: 'Прибыл', icon: <Check size={12} className="text-emerald-400" /> };
    case FlightStatus.Delayed:
      return { bg: 'bg-red-900/30 text-red-400', iconColor: 'text-red-400', text: 'Задерживается', icon: <AlertTriangle size={12} className="text-red-400" /> };
    case FlightStatus.Expected:
    case FlightStatus.EnRoute:
      return { bg: 'bg-blue-900/30 text-blue-400', iconColor: 'text-blue-400', text: 'В пути', icon: <Plane size={12} className="text-blue-400 -rotate-45" /> };
    case FlightStatus.Cancelled:
      return { bg: 'bg-slate-800 text-slate-400', iconColor: 'text-slate-400', text: 'Отменен', icon: <Clock size={12} className="text-slate-400" /> };
    default:
      return { bg: 'bg-slate-800 text-slate-400', iconColor: 'text-slate-400', text: 'По расписанию', icon: <Clock size={12} className="text-slate-400" /> };
  }
};

function calculateDelay(scheduled: string, estimated?: string): string {
    if (!estimated) return "";
    const [h1, m1] = scheduled.split(':').map(Number);
    const [h2, m2] = estimated.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    // Handle next day wrap around roughly
    if (diff < -1000) diff += 1440; 
    
    if (diff <= 0) return "";
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m} мин`;
}

export const FlightRow: React.FC<FlightRowProps> = ({ flight }) => {
  const isDelayed = flight.status === FlightStatus.Delayed;
  const style = getStatusStyles(flight.status);
  const delayText = calculateDelay(flight.scheduledTime, flight.estimatedTime);

  return (
    <div className="flex items-stretch bg-slate-900 border-b border-slate-800 py-3 px-4 last:border-0 hover:bg-slate-800 transition-colors">
      {/* Time Column */}
      <div className="w-14 flex flex-col items-start justify-start pt-0.5 mr-3 shrink-0">
        <span className={`text-lg font-bold leading-none ${isDelayed ? 'text-slate-600 line-through decoration-slate-600 text-base' : 'text-slate-100'}`}>
          {flight.scheduledTime}
        </span>
        {isDelayed && (
           <span className="text-lg font-bold leading-none text-red-400 mt-1">
             {flight.estimatedTime}
           </span>
        )}
      </div>

      {/* Middle Column: Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between mr-2">
         <div className="flex items-center pt-0.5">
            <h3 className="text-slate-100 font-medium truncate text-base leading-tight">{flight.origin}</h3>
         </div>
         <div className="flex items-center text-xs text-slate-500 truncate mt-2">
            <span className="truncate font-medium text-slate-400">{flight.airline}</span>
            {flight.aircraft && (
              <>
                <span className="mx-1.5 text-slate-600">|</span>
                <span className="truncate text-slate-500">{flight.aircraft}</span>
              </>
            )}
         </div>
      </div>

      {/* Right Column: Flight # and Status */}
      <div className="flex flex-col items-end justify-between shrink-0 min-w-[80px] pl-1">
         <span className="text-xs font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mb-1">
             {flight.flightNumber}
         </span>
         
         <div className="flex flex-col items-end w-full">
            {isDelayed && delayText && (
               <span className="text-[10px] font-medium text-red-400 mb-1 text-right whitespace-nowrap">
                 +{delayText}
               </span>
            )}
            <div className={`${style.bg} px-2.5 py-1 rounded-full flex items-center justify-center shadow-sm ml-auto border border-white/5`}>
                {style.icon}
                <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                    {flight.status}
                </span>
            </div>
         </div>
      </div>
    </div>
  );
};