import React, { useState } from 'react';
import { Representative } from '../../types';

interface Props {
  representative: Representative;
  onSave: (representative: Representative) => void;
  onCancel: () => void;
}

export const EditTrainingDate: React.FC<Props> = ({
  representative,
  onSave,
  onCancel
}) => {
  const [trainingDate, setTrainingDate] = useState(representative.trainingCompletionDate || '');

  const handleSave = () => {
    onSave({
      ...representative,
      trainingCompletionDate: trainingDate || undefined
    });
  };

  return (
    <div className="edit-training-date">
      <h4>Дата подготовки: {representative.fullName}</h4>
      <div className="form-row">
        <div className="input-group">
          <label>Дата завершения подготовки</label>
          <input
            type="date"
            value={trainingDate}
            onChange={(e) => setTrainingDate(e.target.value)}
          />
        </div>
      </div>
      <div className="form-actions">
        <button onClick={handleSave}>Сохранить</button>
        <button onClick={onCancel} className="cancel-btn">Отмена</button>
      </div>
    </div>
  );
};