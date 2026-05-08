'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addPerson, removePerson } from '../store/billSlice';
import { UserPlus, UserMinus, User, Shuffle } from 'lucide-react';

export default function PersonList() {
  const [name, setName] = useState('');
  const people = useSelector((state: RootState) => state.bill.people);
  const dispatch = useDispatch();

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

  return (
    <div className="card">
      <h2 className="section-title"><User size={24} /> People</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
        Add friends who are sharing the bill.
      </p>
      
      <div className="flex" style={{ marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <input 
            type="text" 
            placeholder="Enter name..." 
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
            <span style={{ fontWeight: 600 }}>{person.name}</span>
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
            <p>No people added yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
