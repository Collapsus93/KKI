import React, { useState } from 'react';
import { Representative } from '../../types';

interface Props {
  representative: Representative;
  onSave: (representative: Representative) => void;
  onCancel: () => void;
}

export const EditNotes: React.FC<Props> = ({
  representative,
  onSave,
  onCancel
}) => {
  const [notes, setNotes] = useState(representative.notes || '');

  const handleSave = () => {
    onSave({
      ...representative,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="edit-notes">
      <h4>Заметки: {representative.fullName}</h4>
      <div className="form-row">
        <div className="input-group" style={{ width: '100%' }}>
          <label>Заметки о представителе</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Введите заметки о представителе..."
            style={{ 
              width: '100%', 
              minHeight: '150px',
              padding: '10px',
              border: '1px solid #e1e5e9',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
              resize: 'vertical'
            }}
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