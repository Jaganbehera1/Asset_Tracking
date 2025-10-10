import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X } from 'lucide-react';
import { ErrorBoundary } from './ErrorBoundary';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const QRScannerContent: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const qrRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkCameraPermission = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          throw new Error('No camera found');
        }

        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        
        if (mounted) {
          setHasPermission(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setHasPermission(false);
          if ((err as Error).message === 'No camera found') {
            setError('No camera detected on your device');
          } else {
            setError('Camera access denied. Please grant camera permissions to use the QR scanner.');
          }
          setIsInitializing(false);
        }
      }
    };

    const initializeScanner = async () => {
      if (!qrReaderRef.current || !mounted || !hasPermission) {
        return;
      }

      try {
        if (qrRef.current) {
          await qrRef.current.stop();
        }

        const qrScanner = new Html5Qrcode("qr-reader", { 
          verbose: false
        });
        qrRef.current = qrScanner;

        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const cameraId = devices[0].id;
          
          await qrScanner.start(
            { deviceId: cameraId },
            {
              fps: 10,
              qrbox: {
                width: Math.min(qrReaderRef.current.clientWidth, 250),
                height: Math.min(qrReaderRef.current.clientWidth, 250),
              },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (mounted) {
                try {
                  onScan(decodedText);
                  qrScanner.stop().catch(console.error);
                } catch (error) {
                  console.error("Error processing QR code:", error);
                  setError("Failed to process QR code");
                }
              }
            },
            () => {} // Silence QR scanning errors
          );
          
          setError(null);
        } else {
          throw new Error('No cameras found');
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to start scanner:", err);
          setError("Failed to initialize camera. Please ensure your camera is not being used by another application.");
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    checkCameraPermission();

    if (hasPermission) {
      const timeoutId = setTimeout(() => {
        initializeScanner();
      }, 1000); // Increased timeout to ensure camera is ready
      return () => clearTimeout(timeoutId);
    }

    return () => {
      mounted = false;
      if (qrRef.current) {
        qrRef.current.stop().catch(console.error);
      }
    };
  }, [onScan, hasPermission]);

  const handleRetry = async () => {
    setError(null);
    setIsInitializing(true);
    setHasPermission(null);
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
    } catch (err) {
      setHasPermission(false);
      if ((err as Error).message === 'No camera found') {
        setError('No camera detected on your device');
      } else {
        setError('Camera access denied. Please grant camera permissions to use the QR scanner.');
      }
      setIsInitializing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Camera className="mr-2" /> Scan QR Code
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X />
          </button>
        </div>
        
        <div className="relative">
          {error ? (
            <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg mb-4">
              <p className="mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors w-full"
              >
                Retry Camera Access
              </button>
            </div>
          ) : null}
          
          {isInitializing ? (
            <div className="text-center p-4 bg-blue-50 rounded-lg mb-4">
              Initializing camera...
            </div>
          ) : null}
          
          <div 
            id="qr-reader" 
            ref={qrReaderRef}
            className="w-full rounded-lg overflow-hidden"
            style={{ minHeight: '300px' }}
          />
        </div>
      </div>
    </div>
  );
};

export const QRScanner: React.FC<QRScannerProps> = (props) => {
  return (
    <ErrorBoundary>
      <QRScannerContent {...props} />
    </ErrorBoundary>
  );
};