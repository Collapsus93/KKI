import { useState, useEffect } from 'react';
import { AppState, SalesData } from '../types';

export const useLocalStorage = (): [AppState, (state: AppState) => void] => {
  const [state, setState] = useState<AppState>({
    representatives: [],
    salesData: {
      currentMonth: {},
      last3Months: {}
    }
  });

  useEffect(() => {
    const savedReps = localStorage.getItem('representatives');
    const savedSalesCurrent = localStorage.getItem('salesDataCurrent');
    const savedSalesLast3 = localStorage.getItem('salesDataLast3');

    const representatives = savedReps ? JSON.parse(savedReps).map((rep: any) => ({
      ...rep,
      successRate: rep.successRate || 0,
      trainingCompletionDate: rep.trainingCompletionDate || undefined
    })) : [];
    
    // Инициализируем пустые объекты с правильным типом
    const currentMonthData: Record<string, SalesData> = {};
    const last3MonthsData: Record<string, SalesData> = {};
    
    // Загружаем данные за текущий месяц
    if (savedSalesCurrent) {
      try {
        const parsedSales = JSON.parse(savedSalesCurrent);
        if (parsedSales && typeof parsedSales === 'object') {
          Object.keys(parsedSales).forEach((key: string) => {
            const sales = parsedSales[key];
            if (sales && typeof sales === 'object') {
              currentMonthData[key] = {
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
        console.error('Error parsing current month sales data:', error);
      }
    }

    // Загружаем данные за последние 3 месяца
    if (savedSalesLast3) {
      try {
        const parsedSales = JSON.parse(savedSalesLast3);
        if (parsedSales && typeof parsedSales === 'object') {
          Object.keys(parsedSales).forEach((key: string) => {
            const sales = parsedSales[key];
            if (sales && typeof sales === 'object') {
              last3MonthsData[key] = {
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
        console.error('Error parsing last 3 months sales data:', error);
      }
    }

    setState({ 
      representatives, 
      salesData: {
        currentMonth: currentMonthData,
        last3Months: last3MonthsData
      }
    });
  }, []);

  const updateState = (newState: AppState) => {
    setState(newState);
    localStorage.setItem('representatives', JSON.stringify(newState.representatives));
    localStorage.setItem('salesDataCurrent', JSON.stringify(newState.salesData.currentMonth));
    localStorage.setItem('salesDataLast3', JSON.stringify(newState.salesData.last3Months));
  };

  return [state, updateState];
};