'use client';

import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { calculateSplit } from '@/application/use-cases/CalculateSplit';
import { exportToPDF } from '@/infrastructure/pdf/PDFExport';
import { FileDown, Calculator, ChevronDown, ChevronUp, Share2, Send } from 'lucide-react';
import { ShareService } from '@/application/services/ShareService';
import { useState } from 'react';

export default function SplitSummary() {
  const bill = useSelector((state: RootState) => state.bill);
  const results = calculateSplit(bill);
  const [expanded, setExpanded] = useState<string | null>(null);

  const subtotal = bill.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxAmount = (subtotal * bill.tax) / 100;
  const serviceChargeAmount = (subtotal * bill.serviceCharge) / 100;
  const extraChargesAmount = bill.extraCharges.reduce((acc, charge) => {
    if (charge.type === 'percentage') return acc + (subtotal * charge.value) / 100;
    return acc + charge.value;
  }, 0);

  const totalDiscount = results.reduce((acc, res) => acc + res.discountAmount, 0);

  const grandTotal = Math.round(subtotal + taxAmount + serviceChargeAmount + extraChargesAmount - totalDiscount);

  const handleExport = () => {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();

    // Using dots/dashes for filename compatibility while keeping the requested look
    const timestamp = `${d}-${m}-${y}`;
    const shopPart = bill.shopName ? ` ${bill.shopName}` : '';
    const filename = `Split Bill${shopPart} ${timestamp}.pdf`;

    exportToPDF(bill, results, filename);
  };

  return (
    <div className="card" id="pdf-content">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <h2 className="section-title"><Calculator size={24} /> Split Summary</h2>
        <div className="flex" style={{ gap: '0.5rem', flex: '1 1 auto', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" style={{ flex: '1 1 auto' }} onClick={() => ShareService.share('Split Bill Summary', ShareService.formatGlobalSummary(bill, results))}>
            <Share2 size={18} /> <span className="hide-mobile">Share</span>
          </button>
          <button className="btn-secondary" style={{ flex: '1 1 auto' }} onClick={handleExport}>
            <FileDown size={18} /> <span className="hide-mobile">Export</span>
          </button>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
      }} className="summary-total-card">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Grand Total
        </p>
        <h3 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Rp {grandTotal.toLocaleString()}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {results.map((res) => (
          <div key={res.personId} style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            background: 'white',
            transition: 'all 0.3s ease'
          }}>
            <div
              className="flex-between"
              style={{
                padding: '1.25rem',
                background: expanded === res.personId ? 'var(--secondary)' : 'white',
                cursor: 'pointer',
                borderLeft: expanded === res.personId ? '4px solid var(--primary)' : '4px solid transparent'
              }}
              onClick={() => setExpanded(expanded === res.personId ? null : res.personId)}
            >
              <div>
                <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#334155' }}>{res.personName}</span>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{res.items.length} items selected</p>
              </div>
              <div className="flex" style={{ gap: '1rem' }}>
                <div
                  style={{
                    color: 'var(--primary)',
                    padding: '0.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(59, 130, 246, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    ShareService.share(`Split for ${res.personName}`, ShareService.formatPersonSummary(res));
                  }}
                  title="Share breakdown"
                  className="share-btn-hover"
                >
                  <Send size={16} />
                </div>
                <div className="flex" style={{ gap: '1.25rem' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary)' }}>Rp {res.total.toLocaleString()}</span>
                  <div style={{ color: 'var(--text-muted)' }}>
                    {expanded === res.personId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>
            </div>

            {expanded === res.personId && (
              <div style={{ padding: '1.5rem', background: '#fafafa', borderTop: '1px solid var(--border-color)', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ marginBottom: '1rem' }}>
                  {res.items.map((item, idx) => (
                    <div key={idx} className="flex-between" style={{ fontSize: '0.9375rem', padding: '0.5rem 0', borderBottom: '1px dashed #e2e8f0' }}>
                      <span style={{ color: '#64748b' }}>{item.name}</span>
                      <span style={{ fontWeight: 600 }}>Rp {item.splitPrice.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                  <div className="flex-between" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Subtotal</span>
                    <span>Rp {res.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex-between" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    <span>Tax & Service Charge</span>
                    <span>Rp {Math.round(res.taxAmount + res.serviceChargeAmount).toLocaleString()}</span>
                  </div>
                  {res.discountAmount > 0 && (
                    <div className="flex-between" style={{ fontSize: '0.8125rem', color: 'var(--danger)', marginBottom: '0.25rem' }}>
                      <span>Discounts</span>
                      <span>- Rp {Math.floor(res.discountAmount).toLocaleString()}</span>
                    </div>
                  )}
                  {res.extraChargesAmount > 0 && (
                    <div className="flex-between" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      <span>Extra Charges</span>
                      <span>Rp {res.extraChargesAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex-between" style={{ fontSize: '0.9375rem', color: 'var(--text-main)', fontWeight: 700, marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <span>Total Share</span>
                    <span style={{ color: 'var(--primary)' }}>Rp {res.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
