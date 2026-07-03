'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { autofillBill } from '../store/billSlice';
import { Camera, Loader2, X, RefreshCw, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();
  const { t } = useLanguage();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize camera stream
  const startCamera = async (deviceIndex: number, currentDevices: MediaDeviceInfo[] = devices) => {
    // Stop any existing stream first
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCameraError(null);
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      // If we have specific devices, use the selected one
      if (currentDevices.length > 0 && currentDevices[deviceIndex]) {
        constraints.video = {
          ...(constraints.video as object),
          deviceId: { exact: currentDevices[deviceIndex].deviceId },
        };
      } else {
        // Fallback: prefer back camera
        constraints.video = {
          ...(constraints.video as object),
          facingMode: 'environment',
        };
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      // Try fallback to any camera if specific constraint failed
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (fallbackErr: any) {
        setCameraError(
          t('cameraAccessError')
        );
      }
    }
  };

  // Enumerate video devices
  useEffect(() => {
    if (!isOpen) return;

    const getDevices = async () => {
      try {
        // Request initial permission to list labels
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
        initialStream.getTracks().forEach((t) => t.stop());
        
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
        setDevices(videoDevices);
        
        // Find environment/back camera to use as default if possible
        const backCameraIndex = videoDevices.findIndex(
          (d) => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment') || d.label.toLowerCase().includes('belakang')
        );
        const defaultIndex = backCameraIndex !== -1 ? backCameraIndex : 0;
        setCurrentDeviceIndex(defaultIndex);
        startCamera(defaultIndex, videoDevices);
      } catch (e) {
        // Enumerate devices failed or permission denied, start camera with defaults
        startCamera(0, []);
      }
    };

    getDevices();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const switchCamera = () => {
    if (devices.length <= 1) return;
    const nextIndex = (currentDeviceIndex + 1) % devices.length;
    setCurrentDeviceIndex(nextIndex);
    startCamera(nextIndex);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions matching actual video frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);

        // Stop stream to freeze camera
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(currentDeviceIndex);
  };

  const handleUsePhoto = async () => {
    if (!capturedImage) return;

    setLoading(true);
    try {
      const response = await fetch('/api/parse-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedImage }),
      });

      if (!response.ok) throw new Error('Gagal membaca nota');

      const data = await response.json();
      
      if (data) {
        dispatch(autofillBill(data));
        handleClose();
      }
    } catch (error) {
      console.error('Camera Autofill Error:', error);
      alert('Gagal membaca nota. Silakan ambil foto yang lebih jelas dan terang.');
      retakePhoto();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
    setDevices([]);
    setCameraError(null);
    onClose();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '450px',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: 'white'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
            {capturedImage ? 'Konfirmasi Foto' : 'Ambil Foto Nota'}
          </h3>
          <button 
            onClick={handleClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera viewport */}
        <div style={{
          position: 'relative',
          backgroundColor: '#0f172a',
          width: '100%',
          aspectRatio: '3/4',
          maxHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {cameraError && (
            <div style={{
              color: '#f87171',
              textAlign: 'center',
              padding: '2rem',
              fontSize: '0.9rem'
            }}>
              <p>{cameraError}</p>
            </div>
          )}

          {!cameraError && !capturedImage && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              {/* Overlay guides */}
              <div style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                right: '10%',
                bottom: '15%',
                border: '2px dashed rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.5)',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(15, 23, 42, 0.6)',
                  padding: '4px 10px',
                  borderRadius: '4px'
                }}>
                  {t('positionReceipt')}
                </div>
                {/* Neon scan line */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
                  boxShadow: '0 0 8px var(--primary)',
                  animation: 'scanAnimation 2.5s infinite linear'
                }} />
              </div>
            </>
          )}

          {capturedImage && (
            <img
              src={capturedImage}
              alt="Preview foto nota"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}

          {/* Hidden Canvas for capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* Loader Overlay */}
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              gap: '1rem',
              zIndex: 10
            }}>
              <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600 }}>{t('readingReceipt')}</p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{t('aiParsing')}</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls footer */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          backgroundColor: '#1e293b'
        }}>
          {!capturedImage ? (
            <>
              {devices.length > 1 && (
                <button
                  onClick={switchCamera}
                  disabled={loading}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Ganti Kamera"
                >
                  <RefreshCw size={18} />
                </button>
              )}
              
              <button
                onClick={capturePhoto}
                disabled={cameraError !== null}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  borderRadius: '9999px',
                  padding: '0.75rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.3)'
                }}
              >
                <Camera size={18} /> {t('takePhoto')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retakePhoto}
                disabled={loading}
                style={{
                  backgroundColor: 'transparent',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  flex: 1
                }}
              >
                {t('retake')}
              </button>
              <button
                onClick={handleUsePhoto}
                disabled={loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Check size={18} /> {t('usePhoto')}
              </button>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanAnimation {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>,
    document.body
  );
}
