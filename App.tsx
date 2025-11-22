import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { FlightRow } from './components/FlightRow';
import { fetchFlightSchedule } from './services/geminiService';
import { Flight, FlightStatus } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [todayFlights, setTodayFlights] = useState<Flight[]>([]);
  const [tomorrowFlights, setTomorrowFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs to track if notification was already sent for a specific flight ID
  const notifiedFlights = useRef<Set<string>>(new Set());

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const sendDelayNotification = (flight: Flight) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      // Prevent duplicate notifications
      if (notifiedFlights.current.has(flight.id)) return;

      const delayTime = calculateDelay(flight.scheduledTime, flight.estimatedTime);
      const title = `Задержка рейса ${flight.flightNumber}`;
      const body = `Рейс из ${flight.origin} задерживается. Время ожидания: ${delayTime}. Ожидаемое прибытие: ${flight.estimatedTime}`;
      
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
        notifiedFlights.current.add(flight.id);
      } catch (e) {
        console.log("Notification failed", e);
      }
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    try {
      const [todayData, tomorrowData] = await Promise.all([
        fetchFlightSchedule(today),
        fetchFlightSchedule(tomorrow)
      ]);
      
      setTodayFlights(todayData);
      setTomorrowFlights(tomorrowData);

      // Check for delays to notify
      todayData.forEach(flight => {
        if (flight.status === FlightStatus.Delayed) {
          sendDelayNotification(flight);
        }
      });

    } catch (error: any) {
      console.error("Failed to load flights", error);
      // Friendly error message
      let message = "Не удалось загрузить данные.";
      if (error.message && (error.message.includes("API_KEY") || error.name === "ReferenceError")) {
        message = "Ошибка: API_KEY не найден. Убедитесь, что ключ настроен в окружении.";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time simulation: Polling every 60 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
        // Silent refresh (could add a different loading state if desired)
        console.log("Auto-refreshing data...");
        loadData();
    }, 60000); 

    return () => clearInterval(intervalId);
  }, [loadData]);

  const displayFlights = activeTab === 'today' ? todayFlights : tomorrowFlights;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <Header onRefresh={loadData} loading={loading} />
      
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="pb-6">
        <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">
            <span>Время</span>
            <span>Рейс</span>
            <span>Статус</span>
        </div>

        {error ? (
          <div className="mx-4 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="text-red-400 shrink-0" size={20} />
            <div>
              <h3 className="text-sm font-bold text-red-400">Ошибка загрузки</h3>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
              <button 
                onClick={loadData}
                className="mt-2 text-xs font-medium text-red-400 underline hover:text-red-300"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        ) : loading && displayFlights.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-400">Связь с Flightradar24...</p>
          </div>
        ) : (
          <div className="bg-slate-900 shadow-sm border-y border-slate-800">
            {displayFlights.length > 0 ? (
                displayFlights.map((flight) => (
                <FlightRow key={flight.id} flight={flight} />
                ))
            ) : (
                <div className="text-center py-12 text-slate-500">
                    Нет рейсов на выбранную дату
                </div>
            )}
          </div>
        )}
        
        <div className="mt-8 px-6 text-center space-y-2">
            <p className="text-[10px] text-slate-600 leading-relaxed">
                Данные обновляются автоматически каждую минуту.
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
                Источник данных: <span className="text-blue-400">airkem.ru</span>, <span className="text-blue-400">Flightradar24</span> (через Google Grounding).
            </p>
        </div>
      </div>
    </div>
  );
};

// Helper duplication for notification logic scope
function calculateDelay(scheduled: string, estimated?: string): string {
    if (!estimated) return "неизвестно";
    const [h1, m1] = scheduled.split(':').map(Number);
    const [h2, m2] = estimated.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 1440; // Simple wrap around handle
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return h > 0 ? `${h}ч ${m}м` : `${m} мин`;
}

export default App;