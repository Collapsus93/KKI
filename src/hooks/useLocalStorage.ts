import { useState, useEffect } from 'react';
import { AppState, SalesData } from '../types';

export const useLocalStorage = (): [AppState, (state: AppState) => void] => {
  const [state, setState] = useState<AppState>({
    representatives: [],
    salesData: {}
  });

  useEffect(() => {
    const savedReps = localStorage.getItem('representatives');
    const savedSales = localStorage.getItem('salesData');

    const representatives = savedReps ? JSON.parse(savedReps).map((rep: any) => ({
      ...rep,
      successRate: rep.successRate || 0,
      trainingCompletionDate: rep.trainingCompletionDate || undefined
    })) : [];
    
    // Инициализируем пустой объект с правильным типом
    const salesData: Record<string, SalesData> = {};
    
    if (savedSales) {
      try {
        const parsedSales = JSON.parse(savedSales);
        
        // Проверяем что parsedSales - объект
        if (parsedSales && typeof parsedSales === 'object') {
          Object.keys(parsedSales).forEach((key: string) => {
            const sales = parsedSales[key];
            // Проверяем и нормализуем данные под новую структуру (без loans)
            if (sales && typeof sales === 'object') {
              salesData[key] = {
                representativeId: sales.representativeId || key,
                creditCards: {
                  offers: Number(sales.creditCards?.offers) || 0,
                  issuance: Number(sales.creditCards?.issuance) || 0,
                  utilization: Number(sales.creditCards?.utilization) || 0
                },
                simCards: {
                  offers: Number(sales.simCards?.offers) || 0,
                  tariffPayments: Number(sales.simCards?.tariffPayments) || 0,
                  tariffPaymentPercent: Number(sales.simCards?.tariffPaymentPercent) || 0
                },
                investments: {
                  offers: Number(sales.investments?.offers) || 0,
                  accountOpening: Number(sales.investments?.accountOpening) || 0,
                  utilization: Number(sales.investments?.utilization) || 0
                },
                dataUpdate: Number(sales.dataUpdate) || 0
              };
            }
          });
        }
      } catch (error) {
        console.error('Error parsing sales data:', error);
      }
    }

    setState({ representatives, salesData });
  }, []);

  const updateState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem('representatives', JSON.stringify(newState.representatives));
    localStorage.setItem('salesData', JSON.stringify(newState.salesData));
  };

  return [state, updateState];
};