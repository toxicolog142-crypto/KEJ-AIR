import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000); // Update every minute is enough for date
    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = currentDate.toLocaleDateString('ru-RU', { weekday: 'long' });
  const dateStr = currentDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

  return (
    <div className="bg-slate-900 border-b border-slate-800 shadow-sm sticky top-0 z-50">
      <div className="px-4 py-3 flex justify-between items-center">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <MapPin size={14} />
            <span className="text-xs font-bold tracking-wider uppercase">KEJ • Кемерово</span>
          </div>
          <h1 className="text-2xl font-bold text-white capitalize leading-tight">
            {dayOfWeek}
          </h1>
          <p className="text-sm text-slate-400">
            {dateStr}
          </p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className={`p-3 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600 transition-all ${loading ? 'opacity-50' : 'shadow-sm'}`}
          aria-label="Обновить"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
  );
};