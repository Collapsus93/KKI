import React from 'react';
import { TimePeriod } from '../../types';

interface Props {
  activeTab: TimePeriod;
  onTabChange: (tab: TimePeriod) => void;
}

export const Tabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="tabs-container">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'currentMonth' ? 'active' : ''}`}
          onClick={() => onTabChange('currentMonth')}
        >
          📅 Текущий месяц
        </button>
        <button 
          className={`tab ${activeTab === 'last3Months' ? 'active' : ''}`}
          onClick={() => onTabChange('last3Months')}
        >
          📊 Последние 3 месяца
        </button>
      </div>
    </div>
  );
};