'use client';

import PersonList from '@/presentation/components/PersonList';
import ItemList from '@/presentation/components/ItemList';
import ChargesList from '@/presentation/components/ChargesList';
import SplitSummary from '@/presentation/components/SplitSummary';

import { useDispatch } from 'react-redux';
import { resetBill } from '@/presentation/store/billSlice';
import { RotateCcw } from 'lucide-react';

export default function Home() {
  const dispatch = useDispatch();

  return (
    <main className="container">
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 className="title" style={{ marginBottom: '0.5rem' }}>Enjirou Split Bill</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
          Fair and fast bill splitting for everyone
        </p>
      </header>

      <div className="grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <PersonList />
          <ChargesList />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <ItemList />
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
