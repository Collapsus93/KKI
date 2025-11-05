import React, { useState } from 'react';
import { ProductType, SalesReport } from '../../types';
import { FileParser, ProcessedReport } from '../../utils/fileParser';

interface Props {
  onUpload: (reports: SalesReport[], productType: ProductType, newRepresentatives: string[]) => void;
  existingRepresentativeNames: string[];
}

export const FileUpload: React.FC<Props> = ({ onUpload, existingRepresentativeNames }) => {
  const [productType, setProductType] = useState<ProductType>('creditCards');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const { reports, newRepresentatives }: ProcessedReport = await FileParser.parseSalesReport(file, productType, existingRepresentativeNames);
      
      if (newRepresentatives.length > 0) {
        const shouldAddNew = window.confirm(
          `Найдено ${newRepresentatives.length} новых представителей:\n${newRepresentatives.join(', ')}\n\nДобавить их в систему?`
        );
        
        if (shouldAddNew) {
          onUpload(reports, productType, newRepresentatives);
        } else {
          onUpload(reports, productType, []);
        }
      } else {
        onUpload(reports, productType, []);
      }
    } catch (error: any) {
      alert('Ошибка при обработке файла: ' + error.message);
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="upload-section">
      <h3>📤 Загрузить отчет по продажам</h3>
      <div className="upload-controls">
        <select 
          value={productType} 
          onChange={(e) => setProductType(e.target.value as ProductType)}
          disabled={isLoading}
        >
          <option value="creditCards">💳 Кредитные карты</option>
          <option value="simCards">📱 SIM-карты</option>
          <option value="investments">📈 Инвестиции</option>
          <option value="dataUpdate">🔄 Обновление данных</option>
          <option value="successRate">📊 Успешность встреч</option>
          <option value="courseProgress">📚 Прогресс по курсам</option>
        </select>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>
      {isLoading && <div className="loading">⏳ Обработка файла...</div>}
      
    </div>
  );
};