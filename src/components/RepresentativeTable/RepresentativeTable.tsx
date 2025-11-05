import React, { useState, useMemo } from 'react';
import { Representative, SalesData } from '../../types';
import { EditTrainingDate } from '../EditTrainingDate/EditTrainingDate';
import { EditProfileUrl } from '../EditProfileUrl/EditProfileUrl';
import { EditConversation } from '../EditConversation/EditConversation';
import { GenerateTemplateModal } from '../GenerateTemplateModal/GenerateTemplateModal';
import { EditNotes } from '../EditNotes/EditNotes';

interface Props {
  representatives: Representative[];
  salesData: Record<string, SalesData>;
  onRemove: (id: string) => void;
  onUpdate: (representative: Representative) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('ru-RU');
  } catch {
    return dateString;
  }
};

const formatNumber = (value: number | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined) return '0';
  return Number(value).toFixed(decimals);
};

type SortDirection = 'asc' | 'desc' | null;

export const RepresentativeTable: React.FC<Props> = ({
  representatives,
  salesData,
  onRemove,
  onUpdate
}) => {
  const [editingRep, setEditingRep] = useState<Representative | null>(null);
  const [editingField, setEditingField] = useState<'trainingDate' | 'profileUrl' | 'notes' | null>(null);
  const [editingConversation, setEditingConversation] = useState<{
    representative: Representative;
    conversationNumber: 1 | 2 | 3;
  } | null>(null);
  const [templateRep, setTemplateRep] = useState<Representative | null>(null);
  const [sortBy, setSortBy] = useState<{ field: 'trainingDate'; direction: SortDirection }>({
    field: 'trainingDate',
    direction: null
  });

  const handleEditTrainingDate = (representative: Representative) => {
    setEditingRep(representative);
    setEditingField('trainingDate');
  };

  const handleEditProfileUrl = (representative: Representative) => {
    setEditingRep(representative);
    setEditingField('profileUrl');
  };

  const handleEditNotes = (representative: Representative) => {
    setEditingRep(representative);
    setEditingField('notes');
  };

  const handleConversationClick = (representative: Representative, conversationNumber: 1 | 2 | 3) => {
    setEditingConversation({ representative, conversationNumber });
  };

  const handleGenerateTemplate = (representative: Representative) => {
    setTemplateRep(representative);
  };

  const handleSortByTrainingDate = () => {
    setSortBy(prev => {
      if (prev.direction === null) return { field: 'trainingDate', direction: 'desc' };
      if (prev.direction === 'desc') return { field: 'trainingDate', direction: 'asc' };
      return { field: 'trainingDate', direction: null };
    });
  };

  const handleSave = (updatedRep: Representative) => {
    onUpdate(updatedRep);
    setEditingRep(null);
    setEditingField(null);
  };

  const handleConversationSave = (updatedRep: Representative) => {
    onUpdate(updatedRep);
    setEditingConversation(null);
  };

  const handleCancelEdit = () => {
    setEditingRep(null);
    setEditingField(null);
  };

  const handleNameClick = (representative: Representative) => {
    if (representative.profileUrl) {
      window.open(representative.profileUrl, '_blank');
    } else {
      handleEditProfileUrl(representative);
    }
  };

  const getProgressColor = (progress?: number) => {
    if (!progress) return '#7f8c8d';
    if (progress >= 80) return '#27ae60';
    if (progress >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getSuccessRateColor = (rate?: number) => {
    if (!rate) return '#7f8c8d';
    if (rate >= 80) return '#27ae60';
    if (rate >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const hasConversationLink = (conversations: any, convNumber: number): boolean => {
    return !!conversations?.[`conv${convNumber}`];
  };

  const getNotesPreview = (notes?: string) => {
    if (!notes) return '-';
    if (notes.length <= 50) return notes;
    return notes.substring(0, 50) + '...';
  };

  // ПОНЯТНАЯ ЛОГИКА СОРТИРОВКИ
  const sortedRepresentatives = useMemo(() => {
    // Если сортировка отключена - возвращаем исходный порядок
    if (sortBy.direction === null) return representatives;

    // Создаем копию массива для сортировки
    return [...representatives].sort((a, b) => {
      const hasDateA = !!a.trainingCompletionDate;
      const hasDateB = !!b.trainingCompletionDate;

      // СЛУЧАЙ 1: У одного из представителей нет даты
      if (!hasDateA && hasDateB) return 1; // A без даты идет ПОСЛЕ B с датой
      if (hasDateA && !hasDateB) return -1; // A с даты идет ПЕРЕД B без даты
      
      // СЛУЧАЙ 2: У обоих нет дат - сохраняем исходный порядок
      if (!hasDateA && !hasDateB) return 0;

      // СЛУЧАЙ 3: У обоих есть даты - сортируем по дате
      const dateA = new Date(a.trainingCompletionDate!).getTime();
      const dateB = new Date(b.trainingCompletionDate!).getTime();

      if (sortBy.direction === 'desc') {
        // Новые даты сверху
        return dateB - dateA;
      } else {
        // Старые даты сверху  
        return dateA - dateB;
      }
    });
  }, [representatives, sortBy]);

  const getSortIcon = () => {
    if (sortBy.direction === null) return '📅';
    if (sortBy.direction === 'desc') return '⬇️';
    return '⬆️';
  };

  if (representatives.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          📊 Нет данных для отображения. Добавьте представителей и загрузите отчеты по продажам.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="table-container compact-table">
        <table>
          <thead>
            <tr>
              <th className="col-number" rowSpan={2}>#</th>
              <th className="col-name" rowSpan={2}>👤 Исполнитель</th>
              <th className="col-progress section-divider-right" rowSpan={2}>📚 Курсы</th>
              
              <th className="section-header credit-cards-section section-divider-both" colSpan={3}>💳 КК</th>
              <th className="section-header sim-cards-section section-divider-both" colSpan={3}>📱 Мобайл</th>
              <th className="section-header investments-section section-divider-both" colSpan={3}>📈 Инвестиции</th>
              
              <th className="col-success-rate section-divider-both" rowSpan={2}>📊 Успешность</th>
              <th className="section-header conversations-section section-divider-both" colSpan={3}>🎤 Беседы</th>
              <th 
                className="col-training-date section-divider-both" 
                rowSpan={2}
                onClick={handleSortByTrainingDate}
                style={{ cursor: 'pointer' }}
                title="Кликните для сортировки по дате"
              >
                🎓 Завершение подготовки {getSortIcon()}
              </th>
              <th className="col-notes section-divider-both" rowSpan={2}>📝 Заметки</th>
              <th className="col-actions section-divider-left" rowSpan={2}>⚙️ Действия</th>
            </tr>
            <tr>
              <th className="sub-header credit-cards-section section-divider-left">Выпало</th>
              <th className="sub-header credit-cards-section">Оформ.</th>
              <th className="sub-header credit-cards-section section-divider-right">Утил.%</th>
              
              <th className="sub-header sim-cards-section section-divider-left">Выпало</th>
              <th className="sub-header sim-cards-section">Оплата</th>
              <th className="sub-header sim-cards-section section-divider-right">Оплата%</th>
              
              <th className="sub-header investments-section section-divider-left">Выпало</th>
              <th className="sub-header investments-section">Открыто</th>
              <th className="sub-header investments-section section-divider-right">Утил.%</th>
              
              <th className="sub-header conversations-section section-divider-left">1</th>
              <th className="sub-header conversations-section">2</th>
              <th className="sub-header conversations-section section-divider-right">3</th>
            </tr>
          </thead>
          <tbody>
            {sortedRepresentatives.map((representative, index) => {
              const sales = salesData[representative.id] || {};
              const creditCards = sales.creditCards || { offers: 0, issuance: 0, utilization: 0 };
              const simCards = sales.simCards || { offers: 0, tariffPayments: 0, tariffPaymentPercent: 0 };
              const investments = sales.investments || { offers: 0, accountOpening: 0, utilization: 0 };

              return (
                <tr key={representative.id}>
                  <td className="col-number">{index + 1}</td>

                  <td className="col-name">
                    <span 
                      className={`name-cell ${representative.profileUrl ? 'has-link' : ''}`}
                      onClick={() => handleNameClick(representative)}
                      title={representative.profileUrl ? "Перейти в профиль" : "Добавить ссылку на профиль"}
                    >
                      {representative.fullName}
                      {representative.profileUrl && <span className="link-icon">🔗</span>}
                    </span>
                    <button
                      className="edit-url-btn"
                      onClick={() => handleEditProfileUrl(representative)}
                      title="Редактировать ссылку на профиль"
                    >
                      ✏️
                    </button>
                  </td>

                  <td 
                    className="col-progress section-divider-right"
                    style={{ color: getProgressColor(representative.courseProgress) }}
                  >
                    {representative.courseProgress ? `${representative.courseProgress}%` : '-'}
                  </td>
                  
                  <td className="credit-cards-section section-divider-left">{creditCards.offers}</td>
                  <td className="credit-cards-section">{creditCards.issuance}</td>
                  <td 
                    className="credit-cards-section section-divider-right"
                    style={{ color: '#27ae60' }}
                  >
                    {formatNumber(creditCards.utilization)}%
                  </td>
                  
                  <td className="sim-cards-section section-divider-left">{simCards.offers}</td>
                  <td className="sim-cards-section">{formatNumber(simCards.tariffPayments, 0)}</td>
                  <td 
                    className="sim-cards-section section-divider-right"
                    style={{ color: '#e67e22' }}
                  >
                    {formatNumber(simCards.tariffPaymentPercent)}%
                  </td>
                  
                  <td className="investments-section section-divider-left">{investments.offers}</td>
                  <td className="investments-section">{investments.accountOpening}</td>
                  <td 
                    className="investments-section section-divider-right"
                    style={{ color: '#9b59b6' }}
                  >
                    {formatNumber(investments.utilization)}%
                  </td>
                  
                  <td 
                    className="col-success-rate section-divider-both"
                    style={{ color: getSuccessRateColor(representative.successRate) }}
                  >
                    {representative.successRate ? `${representative.successRate}%` : '-'}
                  </td>

                  <td 
                    className={`conversation-cell section-divider-left ${hasConversationLink(representative.conversations, 1) ? 'has-link' : ''}`}
                    onClick={() => handleConversationClick(representative, 1)}
                    title={hasConversationLink(representative.conversations, 1) ? "Есть ссылка - клик для редактирования" : "Клик для добавления ссылки"}
                  >
                    1
                  </td>
                  <td 
                    className={`conversation-cell ${hasConversationLink(representative.conversations, 2) ? 'has-link' : ''}`}
                    onClick={() => handleConversationClick(representative, 2)}
                    title={hasConversationLink(representative.conversations, 2) ? "Есть ссылка - клик для редактирования" : "Клик для добавления ссылки"}
                  >
                    2
                  </td>
                  <td 
                    className={`conversation-cell section-divider-right ${hasConversationLink(representative.conversations, 3) ? 'has-link' : ''}`}
                    onClick={() => handleConversationClick(representative, 3)}
                    title={hasConversationLink(representative.conversations, 3) ? "Есть ссылка - клик для редактирования" : "Клик для добавления ссылки"}
                  >
                    3
                  </td>

                  <td 
                    className="col-training-date section-divider-both"
                    onClick={() => handleEditTrainingDate(representative)}
                    title="Кликните для редактирования даты"
                  >
                    {formatDate(representative.trainingCompletionDate)}
                  </td>

                  <td 
                    className="col-notes section-divider-both"
                    onClick={() => handleEditNotes(representative)}
                    title="Кликните для редактирования заметки"
                    style={{ cursor: 'pointer' }}
                  >
                    {getNotesPreview(representative.notes)}
                  </td>
                  
                  <td className="col-actions section-divider-left">
                    <button
                      className="template-btn"
                      onClick={() => handleGenerateTemplate(representative)}
                    >
                      📝 КРП
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => onRemove(representative.id)}
                    >
                      🗑️ Удалить
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Модальные окна */}
      {editingRep && editingField === 'trainingDate' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditTrainingDate
              representative={editingRep}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {editingRep && editingField === 'profileUrl' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditProfileUrl
              representative={editingRep}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {editingRep && editingField === 'notes' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditNotes
              representative={editingRep}
              onSave={handleSave}
              onCancel={handleCancelEdit}
            />
          </div>
        </div>
      )}

      {editingConversation && (
        <div className="modal-overlay">
          <div className="modal-content">
            <EditConversation
              representative={editingConversation.representative}
              conversationNumber={editingConversation.conversationNumber}
              onSave={handleConversationSave}
              onCancel={() => setEditingConversation(null)}
            />
          </div>
        </div>
      )}

      {templateRep && (
        <GenerateTemplateModal
          representative={templateRep}
          salesData={salesData[templateRep.id] || {}}
          onClose={() => setTemplateRep(null)}
        />
      )}
    </>
  );
};