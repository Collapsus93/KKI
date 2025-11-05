import React, { useState } from 'react';
import { Representative } from '../../types';

interface Props {
  onAdd: (representative: Representative) => void;
}

export const AddRepresentativeForm: React.FC<Props> = ({ onAdd }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [trainingDate, setTrainingDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Пожалуйста, заполните имя и фамилию');
      return;
    }

    const representative: Representative = {
      id: Date.now().toString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      // successRate не добавляем здесь - только через Excel
      trainingCompletionDate: trainingDate || undefined
    };

    onAdd(representative);
    setFirstName('');
    setLastName('');
    setTrainingDate('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="add-representative">
      <h3>➕ Добавить исполнителя</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Имя"
            onKeyPress={handleKeyPress}
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Фамилия"
            onKeyPress={handleKeyPress}
          />
        </div>
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
        <button type="submit">Добавить</button>
      </form>
      
    </div>
  );
};