import React, { useState } from 'react';
import { Representative } from '../../types';

interface Props {
  representative: Representative;
  conversationNumber: 1 | 2 | 3;
  onSave: (representative: Representative) => void;
  onCancel: () => void;
}

export const EditConversation: React.FC<Props> = ({
  representative,
  conversationNumber,
  onSave,
  onCancel
}) => {
  const [conversationUrl, setConversationUrl] = useState(
    representative.conversations?.[`conv${conversationNumber}` as keyof typeof representative.conversations] || ''
  );

  const handleSave = () => {
    const updatedConversations = {
      ...representative.conversations,
      [`conv${conversationNumber}`]: conversationUrl.trim() || undefined
    };

    onSave({
      ...representative,
      conversations: updatedConversations
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className="edit-conversation">
      <h4>Беседа {conversationNumber}: {representative.fullName}</h4>
      <div className="form-row">
        <div className="input-group" style={{ width: '100%' }}>
          <label>Ссылка на запись беседы</label>
          <input
            type="url"
            value={conversationUrl}
            onChange={(e) => setConversationUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/recording"
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