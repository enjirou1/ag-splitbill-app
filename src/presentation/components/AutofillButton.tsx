'use client';

import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { autofillBill } from '../store/billSlice';
import { Camera, Loader2, Sparkles } from 'lucide-react';

export default function AutofillButton() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) throw new Error('Failed to parse receipt');

      const data = await response.ok ? await response.json() : null;
      
      if (data) {
        dispatch(autofillBill(data));
      }
    } catch (error) {
      console.error('Autofill Error:', error);
      alert('Failed to read receipt. Please try a clearer photo.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button 
        className="btn-secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          fontSize: '0.875rem',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderColor: '#bae6fd',
          color: '#0369a1'
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Reading...
          </>
        ) : (
          <>
            <Sparkles size={18} style={{ color: '#0ea5e9' }} />
            AI Scan Receipt
          </>
        )}
      </button>
    </div>
  );
}
