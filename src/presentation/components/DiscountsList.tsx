'use client';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { addDiscount, removeDiscount, updateDiscount } from '../store/billSlice';
import { Tag, Plus, Trash2, Info, Check, Save } from 'lucide-react';
import { useState } from 'react';
import { formatThousand, parseThousand } from './numberUtils';
import { useLanguage } from '../context/LanguageContext';

export default function DiscountsList() {
  const bill = useSelector((state: RootState) => state.bill);
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('fixed');
  const [minPurchase, setMinPurchase] = useState('');
  const [maxDiscount, setMaxDiscount] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<{
    name: string,
    value: string,
    type: 'percentage' | 'fixed',
    minPurchase?: string,
    maxDiscount?: string
  } | null>(null);

  const handleStartEdit = (discount: any) => {
    setEditingId(discount.id);
    setEditFields({
      name: discount.name,
      value: discount.value.toString(),
      type: discount.type,
      minPurchase: discount.minPurchase?.toString() || '',
      maxDiscount: discount.maxDiscount?.toString() || ''
    });
  };

  const handleSaveEdit = () => {
    if (editingId && editFields) {
      dispatch(updateDiscount({
        id: editingId,
        name: editFields.name,
        value: parseFloat(editFields.value) || 0,
        type: editFields.type,
        minPurchase: editFields.minPurchase ? parseFloat(editFields.minPurchase) : undefined,
        maxDiscount: editFields.maxDiscount ? parseFloat(editFields.maxDiscount) : undefined,
      }));
      setEditingId(null);
      setEditFields(null);
    }
  };

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
      <h2 className="section-title"><Tag size={24} /> {t('discounts')}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div className="flex" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '2 1 150px' }}>
            <label className="input-label">{t('voucherName')}</label>
            <input type="text" placeholder="e.g. COUPON 50%" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div style={{ flex: '1 1 100px' }}>
            <label className="input-label">{t('value')}</label>
            <input
              type="text"
              placeholder={t('value')}
              value={formatThousand(value)}
              onChange={(e) => setValue(parseThousand(e.target.value))}
            />
          </div>
          <div style={{ flex: '1 1 145px' }}>
            <label className="input-label">{t('type')}</label>
            <select value={type} onChange={(e) => setType(e.target.value as any)}>
              <option value="fixed">{t('fixed')}</option>
              <option value="percentage">{t('percentage')}</option>
            </select>
          </div>
        </div>

        <div className="flex" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 150px' }}>
            <label className="input-label">{t('minPurchase')}</label>
            <input
              type="text"
              placeholder="e.g. 100.000"
              value={formatThousand(minPurchase)}
              onChange={(e) => setMinPurchase(parseThousand(e.target.value))}
            />
          </div>
          {type === 'percentage' && (
            <div style={{ flex: '1 1 150px' }}>
              <label className="input-label">{t('maxDiscount')}</label>
              <input
                type="text"
                placeholder="e.g. 200.000"
                value={formatThousand(maxDiscount)}
                onChange={(e) => setMaxDiscount(parseThousand(e.target.value))}
              />
            </div>
          )}
          <div style={{ alignSelf: 'flex-end' }}>
            <button className="btn-primary" onClick={handleAddDiscount} style={{ height: '48px', width: '100%' }}>
              <Plus size={20} /> {t('addDiscount')}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {bill.discounts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem' }}>
            {t('noDiscounts')}
          </p>
        ) : (
          bill.discounts.map(discount => (
            <div key={discount.id} className="flex-between" style={{ padding: '1rem', background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
              {editingId === discount.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      autoFocus
                      value={editFields?.name}
                      onChange={(e) => setEditFields(prev => prev ? { ...prev, name: e.target.value } : null)}
                      placeholder={t('voucherName')}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      value={formatThousand(editFields?.value || '')}
                      onChange={(e) => setEditFields(prev => prev ? { ...prev, value: parseThousand(e.target.value) } : null)}
                      placeholder={t('value')}
                      style={{ width: '80px' }}
                    />
                    <select
                      value={editFields?.type}
                      onChange={(e) => setEditFields(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      style={{ width: '100px' }}
                    >
                      <option value="fixed">Rp</option>
                      <option value="percentage">%</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formatThousand(editFields?.minPurchase || '')}
                      onChange={(e) => setEditFields(prev => prev ? { ...prev, minPurchase: parseThousand(e.target.value) } : null)}
                      placeholder={t('minPurchase')}
                      style={{ flex: 1, fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      value={formatThousand(editFields?.maxDiscount || '')}
                      onChange={(e) => setEditFields(prev => prev ? { ...prev, maxDiscount: parseThousand(e.target.value) } : null)}
                      placeholder={t('maxDiscount')}
                      style={{ flex: 1, fontSize: '0.8rem' }}
                    />
                    <button className="btn-primary" onClick={handleSaveEdit} style={{ height: '40px', width: '40px', borderRadius: '50%', padding: 0 }}>
                      <Save size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', cursor: 'pointer', flex: 1, minWidth: 0 }} onClick={() => handleStartEdit(discount)}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{discount.name}</span>
                    {(discount.minPurchase || discount.maxDiscount) && (
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', alignItems: 'center' }}>
                        {discount.minPurchase && (
                          <span>Min: Rp {discount.minPurchase.toLocaleString()}</span>
                        )}
                        {discount.minPurchase && discount.maxDiscount && <span style={{ opacity: 0.5 }}>•</span>}
                        {discount.maxDiscount && (
                          <span>Max: Rp {discount.maxDiscount.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex" style={{ gap: '1rem', flexShrink: 0 }}>
                    <span
                      onClick={() => handleStartEdit(discount)}
                      style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      {discount.type === 'percentage' ? `${discount.value}%` : `Rp ${discount.value.toLocaleString()}`}
                    </span>
                    <button
                      onClick={() => dispatch(removeDiscount(discount.id))}
                      className="btn-delete"
                      title="Hapus Diskon"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
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
