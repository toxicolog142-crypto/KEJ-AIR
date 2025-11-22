import React from 'react';

interface TabsProps {
  activeTab: 'today' | 'tomorrow';
  onTabChange: (tab: 'today' | 'tomorrow') => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex p-1 bg-slate-800 mx-4 mt-4 mb-2 rounded-lg border border-slate-700/50">
      <button
        onClick={() => onTabChange('today')}
        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
          activeTab === 'today'
            ? 'bg-slate-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Сегодня
      </button>
      <button
        onClick={() => onTabChange('tomorrow')}
        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
          activeTab === 'tomorrow'
            ? 'bg-slate-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        Завтра
      </button>
    </div>
  );
};