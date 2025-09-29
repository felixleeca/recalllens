'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { ScanResult } from '@recalllens/core';

interface CameraScannerProps {
  onResult: (result: ScanResult) => void;
  isScanning: boolean;
}

export function CameraScanner({ onResult, isScanning }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  // Initialize barcode reader
  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // Use rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Check for torch support
        const track = mediaStream.getVideoTracks()[0];
        if (track && 'getCapabilities' in track) {
          const capabilities = track.getCapabilities();
          setTorchSupported(!!capabilities.torch);
        }
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (!stream) return;
    
    try {
      const track = stream.getVideoTracks()[0];
      if (track && 'applyConstraints' in track) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn } as any]
        });
        setTorchOn(!torchOn);
      }
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  }, [stream, torchOn]);

  // Scan for barcodes
  const scanBarcode = useCallback(async () => {
    if (!readerRef.current || !videoRef.current || !isScanning) return;

    try {
      const result = await readerRef.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const scanResult: ScanResult = {
              upc: result.getText(),
            };
            onResult(scanResult);
            stopCamera();
          }
        }
      );
    } catch (err) {
      console.error('Error scanning barcode:', err);
    }
  }, [isScanning, onResult, stopCamera]);

  // Start scanning when camera is ready
  useEffect(() => {
    if (stream && isScanning) {
      const timer = setTimeout(() => {
        scanBarcode();
      }, 1000); // Wait for camera to stabilize
      
      return () => clearTimeout(timer);
    }
  }, [stream, isScanning, scanBarcode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (error) {
    return (
      <div className="camera-container flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-lg mb-2">Camera Error</p>
          <p className="text-sm opacity-75">{error}</p>
          <button
            onClick={startCamera}
            className="mt-4 btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="camera-container flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">📷</div>
          <p className="text-lg mb-2">Camera Ready</p>
          <p className="text-sm opacity-75 mb-4">
            Click to start scanning
          </p>
          <button
            onClick={startCamera}
            className="btn btn-primary"
          >
            Start Camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
      />
      
      {/* Scan overlay */}
      <div className="camera-overlay">
        <div className="scan-frame">
          <div className="scan-corners scan-corner-tl"></div>
          <div className="scan-corners scan-corner-tr"></div>
          <div className="scan-corners scan-corner-bl"></div>
          <div className="scan-corners scan-corner-br"></div>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <p className="text-white text-shadow text-sm">
            Position barcode within the frame
          </p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {torchSupported && (
          <button
            onClick={toggleTorch}
            className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-colors"
          >
            {torchOn ? '💡' : '🔦'}
          </button>
        )}
        
        <button
          onClick={stopCamera}
          className="w-12 h-12 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-75 transition-colors"
        >
          ✕
        </button>
      </div>
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
