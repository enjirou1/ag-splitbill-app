'use client';

import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { autofillBill } from '../store/billSlice';
import { Camera, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import CameraModal from './CameraModal';

export default function AutofillButton() {
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMenuOpen(false);
    try {
      const base64 = await convertToBase64(file);
      
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) throw new Error('Gagal membaca nota');

      const data = await response.json();
      
      if (data) {
        dispatch(autofillBill(data));
      }
    } catch (error) {
      console.error('Autofill Error:', error);
      alert('Gagal membaca nota. Silakan coba unggah foto yang lebih jelas.');
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

  const triggerGalleryUpload = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };

  const triggerCamera = () => {
    setMenuOpen(false);
    setCameraOpen(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Hidden Gallery Input */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <button 
        className="btn-secondary"
        onClick={() => setMenuOpen(!menuOpen)}
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
            Membaca...
          </>
        ) : (
          <>
            <Sparkles size={18} style={{ color: '#0ea5e9' }} />
            AI Scan Nota
          </>
        )}
      </button>

      {/* Dropdown Menu Backdrop Overlay */}
      {menuOpen && (
        <div 
          onClick={() => setMenuOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 90,
            background: 'transparent'
          }}
        />
      )}

      {/* Dropdown Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 6px)',
          background: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-md)',
          zIndex: 100,
          minWidth: '180px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeIn 0.15s ease'
        }}>
          <button
            onClick={triggerCamera}
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.875rem',
              justifyContent: 'flex-start'
            }}
            className="dropdown-item-hover"
          >
            <Camera size={16} style={{ color: 'var(--primary)' }} />
            Ambil Foto
          </button>
          
          <button
            onClick={triggerGalleryUpload}
            style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderRadius: 0,
              color: 'var(--text-main)',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '0.875rem',
              justifyContent: 'flex-start',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)'
            }}
            className="dropdown-item-hover"
          >
            <ImageIcon size={16} style={{ color: 'var(--primary)' }} />
            Pilih dari Galeri
          </button>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal 
        isOpen={cameraOpen} 
        onClose={() => setCameraOpen(false)} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .dropdown-item-hover:hover {
          background-color: var(--secondary) !important;
          color: var(--primary) !important;
        }
      `}} />
    </div>
  );
}
