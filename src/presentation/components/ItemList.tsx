'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addItem, updateItem, removeItem } from '../store/billSlice';
import { ShoppingBag, Plus, Trash2, CheckCircle2, User } from 'lucide-react';

export default function ItemList() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('1');
  
  const items = useSelector((state: RootState) => state.bill.items);
  const people = useSelector((state: RootState) => state.bill.people);
  const dispatch = useDispatch();

  const handleAddItem = () => {
    if (name.trim() && price) {
      dispatch(addItem({
        name: name.trim(),
        price: parseFloat(price),
        quantity: parseInt(qty),
        assignedTo: []
      }));
      setName('');
      setPrice('');
      setQty('1');
    }
  };

  const toggleAssignment = (itemId: string, personId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const assignedTo = item.assignedTo.includes(personId)
      ? item.assignedTo.filter(id => id !== personId)
      : [...item.assignedTo, personId];

    dispatch(updateItem({ ...item, assignedTo }));
  };

  return (
    <div className="card">
      <h2 className="section-title"><ShoppingBag size={24} /> Items</h2>
      
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '0.75rem', 
        marginBottom: '2rem' 
      }}>
        <div style={{ flex: '2 1 200px' }}>
          <input type="text" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 100px' }}>
          <input 
            type="number" 
            placeholder="Price" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)} 
            onFocus={(e) => e.target.select()}
          />
        </div>
        <div style={{ flex: '0 1 70px' }}>
          <input 
            type="number" 
            placeholder="Qty" 
            value={qty} 
            onChange={(e) => setQty(e.target.value)} 
            onFocus={(e) => e.target.select()}
          />
        </div>
        <button className="btn-primary btn-icon" onClick={handleAddItem} title="Add Item">
          <Plus size={20} />
        </button>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
        {items.map((item) => (
          <div key={item.id} className="item-row">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{item.name}</span>
                <span className="badge" style={{ marginLeft: '12px', background: '#eff6ff', color: '#3b82f6' }}>x{item.quantity}</span>
              </div>
              <div className="flex" style={{ gap: '1rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                  Rp {(item.price * item.quantity).toLocaleString()}
                </span>
                <div 
                  onClick={() => dispatch(removeItem(item.id))}
                  style={{ 
                    padding: '6px', 
                    borderRadius: '8px', 
                    color: 'var(--danger)', 
                    cursor: 'pointer',
                    background: '#fff1f2',
                    display: 'flex'
                  }}
                >
                  <Trash2 size={16} />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {people.map(person => (
                <div 
                  key={person.id} 
                  className={`person-tag ${item.assignedTo.includes(person.id) ? 'selected' : ''}`}
                  style={{ cursor: 'pointer', fontSize: '0.75rem' }}
                  onClick={() => toggleAssignment(item.id, person.id)}
                >
                  {item.assignedTo.includes(person.id) ? <CheckCircle2 size={12} /> : <User size={12} />}
                  {person.name}
                </div>
              ))}
              {people.length === 0 && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Add people to split this item
                </span>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            background: '#f8fafc', 
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-color)'
          }}>
            <ShoppingBag size={40} style={{ opacity: 0.1, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>No items yet. Add manually or use OCR.</p>
          </div>
        )}
      </div>
    </div>
  );
}
