import React, { useState } from 'react';
import { Representative } from '../../types';

interface Props {
  representative: Representative;
  onSave: (representative: Representative) => void;
  onCancel: () => void;
}

export const EditProfileUrl: React.FC<Props> = ({
  representative,
  onSave,
  onCancel
}) => {
  const [profileUrl, setProfileUrl] = useState(representative.profileUrl || '');

  const handleSave = () => {
    onSave({
      ...representative,
      profileUrl: profileUrl.trim() || undefined
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="edit-profile-url">
      <h4>Ссылка на профиль: {representative.fullName}</h4>
      <div className="form-row">
        <div className="input-group" style={{ width: '100%' }}>
          <label>URL профиля представителя</label>
          <input
            type="url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/profile/ivanov"
            style={{ width: '100%' }}
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