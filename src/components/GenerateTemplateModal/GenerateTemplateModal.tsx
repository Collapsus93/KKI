import React, { useState } from 'react';
import { Representative, SalesData } from '../../types';

interface Props {
  representative: Representative;
  salesData: SalesData;
  onClose: () => void;
}

export const GenerateTemplateModal: React.FC<Props> = ({
  representative,
  salesData,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const generateTemplate = () => {
    const simCards = salesData.simCards || { tariffPayments: 0 };
    const investments = salesData.investments || { accountOpening: 0 };
    const dataUpdate = salesData.dataUpdate || 0;
    const successRate = representative.successRate || 0;

    const conversations = representative.conversations || {};
    const conv1 = conversations.conv1 || 'ссылка не добавлена';
    const conv2 = conversations.conv2 || 'ссылка не добавлена';
    const conv3 = conversations.conv3 || 'ссылка не добавлена';

    return `Приветствую!
Прошу принять исполнителя в основную группу.
План обучения выполнен, план продаж выполнен, а именно: ${dataUpdate} обновления данных, ${simCards.tariffPayments} сим-карт с пополнением тарифа, ${investments.accountOpening} открытия брокерского счёта. Успешность встреч ${successRate}%.
Прикрепляю коммуникации в адаптации:
Ролевки:
НАРУШЕНИЯ ${conv1}
СИМ ${conv2}
ИНВЕСТ ${conv3}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateTemplate());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const templateText = generateTemplate();

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h4>📋 Шаблон для {representative.fullName}</h4>
        
        <div className="template-content">
          <div className="template-text">
            <pre>{templateText}</pre>
          </div>
          
          <div className="template-actions">
            <button 
              onClick={handleCopy} 
              className={`copy-btn ${copied ? 'copied' : ''}`}
            >
              {copied ? '✅ Скопировано!' : '📋 Копировать текст'}
            </button>
            <button onClick={onClose} className="cancel-btn">
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};