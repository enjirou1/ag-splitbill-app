'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addDiscount, removeDiscount } from '../store/billSlice';
import { Tag, Plus, Trash2, Info } from 'lucide-react';
import { useState } from 'react';

export default function DiscountsList() {
  const bill = useSelector((state: RootState) => state.bill);
  const dispatch = useDispatch();
  
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('fixed');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');

  const handleAddDiscount = () => {
    if (name.trim() && value) {
      dispatch(addDiscount({
        name: name.trim(),
        value: parseFloat(value),
        type: type,
        minPurchase: minPurchase ? parseFloat(minPurchase) : undefined,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : undefined,
      }));
      setName('');
      setValue('');
      setMinPurchase('');
      setMaxDiscount('');
    }
  };

  return (
    <div className="card">
      <h2 className="section-title"><Tag size={24} /> Discounts</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div className="flex" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 150px' }}>
            <label className="input-label">Voucher Name</label>
            <input type="text" placeholder="e.g. SHOPEE50" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label className="input-label">Value</label>
            <input type="number" placeholder="Value" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 120px' }}>
            <label className="input-label">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="fixed">Fixed (Rp)</option>
              <option value="percentage">Percent (%)</option>
            </select>
          </div>
        </div>

        <div className="flex" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label className="input-label">Min. Purchase (Optional)</label>
            <input type="number" placeholder="e.g. 100000" value={minPurchase} onChange={(e) => setMinPurchase(e.target.value)} />
          </div>
          {type === 'percentage' && (
            <div style={{ flex: '1 1 150px' }}>
              <label className="input-label">Max. Discount (Optional)</label>
              <input type="number" placeholder="e.g. 200000" value={maxDiscount} onChange={(e) => setMaxDiscount(e.target.value)} />
            </div>
          )}
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={handleAddDiscount} style={{ height: '48px', width: '100%' }}>
              <Plus size={20} /> Add Discount
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {bill.discounts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
            No discounts applied yet.
          </p>
        ) : (
          bill.discounts.map(discount => (
            <div key={discount.id} className="flex-between" style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontWeight: 700, color: '#334155' }}>{discount.name}</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge">
                    {discount.type === 'percentage' ? `${discount.value}%` : `Rp ${discount.value.toLocaleString()}`}
                  </span>
                  {discount.minPurchase && (
                    <span className="badge" style={{ background: '#ecfdf5', color: '#059669' }}>
                      Min: Rp {discount.minPurchase.toLocaleString()}
                    </span>
                  )}
                  {discount.maxDiscount && (
                    <span className="badge" style={{ background: '#fff7ed', color: '#ea580c' }}>
                      Max: Rp {discount.maxDiscount.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div
                onClick={() => dispatch(removeDiscount(discount.id))}
                style={{ color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', background: '#fef2f2' }}
              >
                <Trash2 size={18} />
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .input-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          display: block;
          margin-bottom: 0.375rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
      `}</style>
    </div>
  );
}
