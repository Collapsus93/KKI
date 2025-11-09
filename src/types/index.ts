export interface Representative {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  successRate?: number;
  trainingCompletionDate?: string;
  profileUrl?: string;
  courseProgress?: number;
  conversations?: {
    conv1?: string;
    conv2?: string;
    conv3?: string;
  };
  notes?: string;
}

export interface CreditCardData {
  offers: number;
  issuance: number;
  utilization: number;
}

export interface SimCardData {
  offers: number;
  tariffPayments: number;
  tariffPaymentPercent: number;
}

export interface InvestmentData {
  offers: number;
  accountOpening: number;
  utilization: number;
}

export interface SalesData {
  representativeId: string;
  creditCards: CreditCardData;
  simCards: SimCardData;
  investments: InvestmentData;
  dataUpdate: number;
}

export interface SalesReport {
  representativeName: string;
  productType: ProductType;
  offers?: number;
  issuance?: number;
  utilization?: number;
  tariffPayments?: number;
  tariffPaymentPercent?: number;
  accountOpening?: number;
  salesCount?: number;
  successRate?: number;
  courseProgress?: number;
  trainingCompletionDate?: string;
  profileUrl?: string;
}

export type ProductType = 'creditCards' | 'simCards' | 'investments' | 'dataUpdate' | 'successRate' | 'courseProgress' | 'completionData';


export type TimePeriod = 'currentMonth' | 'last3Months';

export interface AppState {
  representatives: Representative[];
  salesData: {
    currentMonth: Record<string, SalesData>;
    last3Months: Record<string, SalesData>;
  };
}

// Функция для парсинга ФИО
export const parseFullName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

// Функция для нормализации имен (убирает ID в конце)
export const normalizeName = (fullName: string): string => {
  if (!fullName) return '';
  
  // Убираем цифры в конце имени (ID сотрудника)
  const withoutId = fullName.replace(/\s+\d+$/, '').trim();
  
  // Также убираем возможные дополнительные пробелы
  return withoutId.replace(/\s+/g, ' ').trim();
};

// Функция для сравнения имен с учетом нормализации
export const compareNames = (name1: string, name2: string): boolean => {
  return normalizeName(name1).toLowerCase() === normalizeName(name2).toLowerCase();
};
