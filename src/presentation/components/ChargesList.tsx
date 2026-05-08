'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { updateTax, updateServiceCharge, addExtraCharge, removeExtraCharge, updateExtraCharge } from '../store/billSlice';
import { Percent, Receipt, Plus, Trash2, CheckCircle2, Save } from 'lucide-react';
import { useState } from 'react';

export default function ChargesList() {
  const bill = useSelector((state: RootState) => state.bill);
  const dispatch = useDispatch();
  const [extraName, setExtraName] = useState('');
  const [extraValue, setExtraValue] = useState('');
  const [extraType, setExtraType] = useState<'percentage' | 'fixed'>('fixed');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{name: string, value: string, type: 'percentage' | 'fixed'} | null>(null);

  const handleStartEdit = (charge: any) => {
    setEditingId(charge.id);
    setEditFields({
      name: charge.name,
      value: charge.value.toString(),
      type: charge.type
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editFields) {
      dispatch(updateExtraCharge({
        id: editingId,
        name: editFields.name,
        value: parseFloat(editFields.value) || 0,
        type: editFields.type
      }));
      setEditingId(null);
      setEditFields(null);
    }
  };

  const handleAddExtra = () => {
    if (extraName.trim() && extraValue) {
      dispatch(addExtraCharge({
        name: extraName.trim(),
        value: parseFloat(extraValue),
        type: extraType
      }));
      setExtraName('');
      setExtraValue('');
    }
  };

  return (
    <div className="card">
      <h2 className="section-title"><Receipt size={24} /> Taxes & Charges</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ flex: '1 1 150px', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Tax
          </label>
          <div className="flex flex-nowrap" style={{ background: 'white', borderRadius: 'var(--radius-sm)', border: '2px solid #eef2ff', paddingRight: '0.75rem' }}>
            <input
              type="number"
              value={bill.tax}
              style={{ border: 'none', background: 'transparent', flex: 1 }}
              onChange={(e) => dispatch(updateTax(parseFloat(e.target.value) || 0))}
              onFocus={(e) => e.target.select()}
            />
            <Percent size={18} style={{ color: 'var(--primary)', opacity: 0.5, flexShrink: 0 }} />
          </div>
        </div>
        <div style={{ flex: '1 1 150px', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Service Charge
          </label>
          <div className="flex flex-nowrap" style={{ background: 'white', borderRadius: 'var(--radius-sm)', border: '2px solid #eef2ff', paddingRight: '0.75rem' }}>
            <input
              type="number"
              value={bill.serviceCharge}
              style={{ border: 'none', background: 'transparent', flex: 1 }}
              onChange={(e) => dispatch(updateServiceCharge(parseFloat(e.target.value) || 0))}
              onFocus={(e) => e.target.select()}
            />
            <Percent size={18} style={{ color: 'var(--primary)', opacity: 0.5, flexShrink: 0 }} />
          </div>
        </div>
      </div>

      <div style={{ paddingTop: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', color: '#475569' }}>Extra Charges</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: '2 1 150px' }}>
            <input type="text" placeholder="e.g. Delivery" value={extraName} onChange={(e) => setExtraName(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 80px' }}>
            <input
              type="number"
              placeholder="Value"
              value={extraValue}
              onChange={(e) => setExtraValue(e.target.value)}
              onFocus={(e) => e.target.select()}
            />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <select value={extraType} onChange={(e) => setExtraType(e.target.value as any)}>
              <option value="fixed">Fixed (Rp)</option>
              <option value="percentage">Percent (%)</option>
            </select>
          </div>
          <button className="btn-primary btn-icon" onClick={handleAddExtra}>
            <Plus size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {bill.extraCharges.map(charge => (
            <div key={charge.id} className="flex-between" style={{ padding: '0.75rem 1rem', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              {editingId === charge.id ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '1rem', alignItems: 'center' }}>
                  <input 
                    autoFocus
                    value={editFields?.name} 
                    onChange={(e) => setEditFields(prev => prev ? {...prev, name: e.target.value} : null)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="number"
                    value={editFields?.value} 
                    onChange={(e) => setEditFields(prev => prev ? {...prev, value: e.target.value} : null)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                    style={{ width: '80px' }}
                  />
                  <select 
                    value={editFields?.type} 
                    onChange={(e) => setEditFields(prev => prev ? {...prev, type: e.target.value as any} : null)}
                    style={{ width: '100px' }}
                  >
                    <option value="fixed">Rp</option>
                    <option value="percentage">%</option>
                  </select>
                  <button 
                    className="btn-primary btn-icon" 
                    onClick={handleSaveEdit} 
                    style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                  >
                    <Save size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <span style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => handleStartEdit(charge)}>
                    {charge.name}
                  </span>
                  <div className="flex">
                    <span style={{ fontWeight: 700, color: 'var(--primary)', cursor: 'pointer' }} onClick={() => handleStartEdit(charge)}>
                      {charge.type === 'percentage' ? `${charge.value}%` : `Rp ${charge.value.toLocaleString()}`}
                    </span>
                    <div
                      onClick={() => dispatch(removeExtraCharge(charge.id))}
                      style={{ color: 'var(--danger)', cursor: 'pointer', display: 'flex', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
