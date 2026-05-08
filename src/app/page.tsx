'use client';

import PersonList from '@/presentation/components/PersonList';
import ItemList from '@/presentation/components/ItemList';
import ChargesList from '@/presentation/components/ChargesList';
import DiscountsList from '@/presentation/components/DiscountsList';
import SplitSummary from '@/presentation/components/SplitSummary';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/presentation/store';
import { resetBill, hydrate, updateShopName } from '@/presentation/store/billSlice';
import { RotateCcw, Store } from 'lucide-react';
import { useEffect } from 'react';
import { loadState } from '@/application/services/persistence';

export default function Home() {
  const dispatch = useDispatch();
  const shopName = useSelector((state: RootState) => state.bill.shopName);

  useEffect(() => {
    // Always try to load from local storage on mount
    const savedData = loadState('local');
    if (savedData) {
      dispatch(hydrate(savedData));
    }
  }, [dispatch]);

  return (
    <main className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>Enjirou Split Bill</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginBottom: '2rem' }}>
          Fair and fast bill splitting for everyone
        </p>

        <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: 'white', 
            padding: '0.75rem 1.25rem', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-sm)',
            border: '2px solid #eef2ff',
            transition: 'all 0.2s ease'
          }}>
            <Store size={20} style={{ color: 'var(--primary)', opacity: 0.6, marginRight: '0.75rem' }} />
            <input 
              type="text" 
              placeholder="Store Name (Optional)" 
              value={shopName}
              onChange={(e) => dispatch(updateShopName(e.target.value))}
              style={{ 
                border: 'none', 
                padding: 0, 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#334155',
                width: '100%',
                outline: 'none',
                background: 'transparent'
              }} 
            />
          </div>
        </div>
      </header>

      <div className="grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <PersonList />
          <ItemList />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ChargesList />
          <DiscountsList />
          <SplitSummary />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
        <button className="btn-secondary" onClick={() => dispatch(resetBill())}>
          <RotateCcw size={18} /> Reset Entire Bill
        </button>
      </div>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© 2026 Enjirou Split Bill</p>
      </footer>
    </main>
  );
}
