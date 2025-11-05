import React from 'react';
import { SalesData } from '../../types';

interface Props {
  salesData: Record<string, SalesData>;
  representatives: any[];
}

export const MetricsCard: React.FC<Props> = ({ salesData, representatives }) => {
  const totals = Object.values(salesData).reduce(
    (acc, curr) => {
      const creditCards = curr.creditCards || { offers: 0, issuance: 0, utilization: 0 };
      const simCards = curr.simCards || { offers: 0, tariffPayments: 0, tariffPaymentPercent: 0 };
      const investments = curr.investments || { offers: 0, accountOpening: 0, utilization: 0 };
      
      return {
        creditCards: {
          offers: acc.creditCards.offers + (creditCards.offers || 0),
          issuance: acc.creditCards.issuance + (creditCards.issuance || 0),
          utilization: acc.creditCards.utilization + (creditCards.utilization || 0)
        },
        simCards: {
          offers: acc.simCards.offers + (simCards.offers || 0),
          tariffPayments: acc.simCards.tariffPayments + (simCards.tariffPayments || 0),
          tariffPaymentPercent: acc.simCards.tariffPaymentPercent + (simCards.tariffPaymentPercent || 0)
        },
        investments: {
          offers: acc.investments.offers + (investments.offers || 0),
          accountOpening: acc.investments.accountOpening + (investments.accountOpening || 0),
          utilization: acc.investments.utilization + (investments.utilization || 0)
        },
        dataUpdate: acc.dataUpdate + (curr.dataUpdate || 0)
      };
    },
    { 
      creditCards: { offers: 0, issuance: 0, utilization: 0 },
      simCards: { offers: 0, tariffPayments: 0, tariffPaymentPercent: 0 },
      investments: { offers: 0, accountOpening: 0, utilization: 0 },
      dataUpdate: 0
    }
  );

  const count = Object.values(salesData).length;
  
  // Средние значения для текущих метрик
  const avgCreditUtilization = count > 0 ? totals.creditCards.utilization / count : 0;
  const avgSimTariffPercent = count > 0 ? totals.simCards.tariffPaymentPercent / count : 0;
  const avgInvestmentUtilization = count > 0 ? totals.investments.utilization / count : 0;
  
  // Новая метрика: средняя успешность встреч
  const representativesWithSuccessRate = representatives.filter(rep => rep.successRate && rep.successRate > 0);
  const avgSuccessRate = representativesWithSuccessRate.length > 0 
    ? representativesWithSuccessRate.reduce((sum, rep) => sum + (rep.successRate || 0), 0) / representativesWithSuccessRate.length
    : 0;

  return (
    <div className="metrics-card">
      <h3>🎯 Ключевые показатели эффективности</h3>
      <div className="metrics-grid">
        {/* Утилизация кредитных карт */}
        <div className="metric" style={{ borderColor: '#27ae60' }}>
          <span className="metric-value" style={{ color: '#27ae60' }}>
            {avgCreditUtilization.toFixed(2)}%
          </span>
          <span className="metric-label">Утилизация кредитных карт</span>
        </div>
        
        {/* Оплата тарифа SIM */}
        <div className="metric" style={{ borderColor: '#e67e22' }}>
          <span className="metric-value" style={{ color: '#e67e22' }}>
            {avgSimTariffPercent.toFixed(2)}%
          </span>
          <span className="metric-label">Оплата тарифа Мобайл</span>
        </div>
        
        {/* Утилизация инвестиций */}
        <div className="metric" style={{ borderColor: '#9b59b6' }}>
          <span className="metric-value" style={{ color: '#9b59b6' }}>
            {avgInvestmentUtilization.toFixed(2)}%
          </span>
          <span className="metric-label">Утилизация инвестиций</span>
        </div>
        
        {/* Успешность встреч - НОВАЯ МЕТРИКА */}
        <div className="metric" style={{ borderColor: '#3498db' }}>
          <span className="metric-value" style={{ color: '#3498db' }}>
            {avgSuccessRate.toFixed(1)}%
          </span>
          <span className="metric-label">Успешность встреч</span>
          <div className="metric-subtitle">
            ({representativesWithSuccessRate.length}/{representatives.length})
          </div>
        </div>
      </div>
    </div>
  );
};