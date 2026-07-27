'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addPerson, removePerson, updatePerson } from '../store/billSlice';
import { UserPlus, UserMinus, User, Shuffle, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function PersonList() {
  const [name, setName] = useState('');
  const people = useSelector((state: RootState) => state.bill.people);
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAdd = () => {
    if (name.trim()) {
      dispatch(addPerson(name.trim()));
      setName('');
    }
  };

  const handleRandom = () => {
    const randomNames = ['Budi', 'Ani', 'Caca', 'Dedi', 'Euis', 'Fandi'];
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + ' ' + Math.floor(Math.random() * 100);
    dispatch(addPerson(randomName));
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleStartEdit = (person: { id: string, name: string }) => {
    setEditingId(person.id);
    setEditName(person.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      dispatch(updatePerson({ id: editingId, name: editName.trim() }));
      setEditingId(null);
    }
  };

  return (
    <div className="card">
      <div 
        className="flex-between" 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        style={{ cursor: 'pointer', userSelect: 'none', marginBottom: isCollapsed ? '0' : '1.5rem' }}
      >
        <h2 className="section-title" style={{ marginBottom: 0 }}><User size={24} /> {t('people')}</h2>
        <div style={{ color: 'var(--text-muted)' }}>
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </div>

      {!isCollapsed && (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {t('addFriends')}
          </p>
          
          <div className="flex" style={{ marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flex: '1 1 200px' }}>
              <input 
                type="text" 
                placeholder={t('enterName')} 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <button className="btn-primary btn-icon" onClick={handleAdd} title="Add Person">
              <UserPlus size={18} />
            </button>
            <button className="btn-secondary btn-icon" onClick={handleRandom} title="Quick Add Random">
              <Shuffle size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {people.map((person) => (
              <div key={person.id} className="person-tag selected">
                {editingId === person.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      autoFocus
                      className="edit-input-inline"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                      style={{
                        width: `${Math.max(editName.length, 4)}ch`
                      }}
                    />
                    <button 
                      onClick={handleSaveEdit}
                      style={{ 
                        background: 'rgba(255,255,255,0.3)', 
                        border: 'none', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '28px', 
                        height: '28px', 
                        padding: 0,
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={16} />
                    </button>
                  </div>
                ) : (
                  <span 
                    style={{ fontWeight: 600, cursor: 'pointer' }} 
                    onClick={() => handleStartEdit(person)}
                  >
                    {person.name}
                  </span>
                )}
                <div 
                  onClick={() => dispatch(removePerson(person.id))}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '2px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  <UserMinus size={14} />
                </div>
              </div>
            ))}
            {people.length === 0 && (
              <div style={{ 
                width: '100%', 
                padding: '2rem', 
                textAlign: 'center', 
                border: '2px dashed var(--border-color)', 
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)'
              }}>
                <User size={32} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                <p>{t('noPeople')}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
