'use client';

import PersonList from '@/presentation/components/PersonList';
import ItemList from '@/presentation/components/ItemList';
import ChargesList from '@/presentation/components/ChargesList';
import DiscountsList from '@/presentation/components/DiscountsList';
import SplitSummary from '@/presentation/components/SplitSummary';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/presentation/store';
import { resetBill, hydrate, updateShopName, updateCurrency } from '@/presentation/store/billSlice';
import { RotateCcw, Store, Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadState } from '@/application/services/persistence';
import packageInfo from '../../package.json';
import { useLanguage } from '@/presentation/context/LanguageContext';
import { CURRENCIES } from '@/presentation/utils/currencyUtils';

export default function Home() {
  const dispatch = useDispatch();
  const shopName = useSelector((state: RootState) => state.bill.shopName);
  const currency = useSelector((state: RootState) => state.bill.currency || 'IDR');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Always try to load from local storage on mount
    const savedData = loadState('local');
    if (savedData) {
      dispatch(hydrate(savedData));
    }
  }, [dispatch]);

  return (
    <main className="container" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <select
          value={currency}
          onChange={(e) => dispatch(updateCurrency(e.target.value))}
          style={{
            width: 'auto',
            padding: '0.5rem 1.75rem 0.5rem 0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          aria-label="Select Currency"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} ({c.symbol})
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          style={{
            width: 'auto',
            padding: '0.5rem 2rem 0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)'
          }}
          aria-label="Select Language"
        >
          <option value="id">Indonesia</option>
          <option value="en">English</option>
          <option value="ja">日本語</option>
        </select>

        <button
          onClick={toggleTheme}
          className="btn-secondary btn-icon"
          style={{
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            padding: 0,
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}
          aria-label="Toggle Dark Mode"
        >
          {mounted && theme === 'dark' ? <Sun size={18} style={{ color: '#f59e0b' }} /> : <Moon size={18} style={{ color: '#64748b' }} />}
        </button>
      </div>

      <header style={{ marginBottom: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '0.25rem'
        }}>
          <img
            src="/logo.png"
            alt="Enwari Logo"
            style={{
              width: '250px',
              objectFit: 'cover',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.02))',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            className="logo-img"
          />
        </div>

        <div style={{ maxWidth: '400px', margin: '-2.5rem auto 0', position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--card-bg)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-color)',
            transition: 'all 0.2s ease'
          }}>
            <Store size={20} style={{ color: 'var(--primary)', opacity: 0.8, marginRight: '0.75rem' }} />
            <input
              type="text"
              className="input-unstyled"
              placeholder={t('storeName')}
              value={shopName}
              onChange={(e) => dispatch(updateShopName(e.target.value))}
              style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-main)',
                width: '100%',
                lineHeight: '1.5'
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
          <RotateCcw size={18} /> {t('resetBill')}
        </button>
      </div>

      <footer style={{ marginTop: '5rem', padding: '2rem 0', textAlign: 'center', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>© 2026 Enwari</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>v{packageInfo.version}</p>
        <p style={{ marginTop: '0.5rem' }}>
          {t('help')}{' '}
          <a
            href="https://wa.me/6287855161565"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}
          >
            {t('contactWa')}
          </a>
        </p>
      </footer>
    </main>
  );
}
