import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
interface GameInfo {
  title: string;
  description: string;
  image?: string;
}

export const CameraComponent: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cameraStream: MediaStream | null = null;
    let cancelled = false;
    async function setupCamera() {
      setIsLoading(true);

      // Check if a browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support camera access');
        setIsLoading(false);
        return;
      }

      try {
        // Start with basic video constraints
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Use front camera on mobile devices
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        cameraStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Add a success handler
        videoRef.current?.addEventListener('loadedmetadata', () => {
          setIsLoading(false);
        });
      } catch (err) {
        console.error('Camera error:', err);
        if (err instanceof DOMException) {
          switch (err.name) {
            case 'NotFoundError':
              setError('No camera found on this device');
              break;
            case 'NotAllowedError':
              setError(
                'Camera access was denied. Please check your browser permissions',
              );
              break;
            case 'NotReadableError':
              setError('Camera is already in use by another application');
              break;
            default:
              setError(`Camera error: ${err.message}`);
          }
        } else {
          setError(`Unexpected error: ${String(err)}`);
        }
        setIsLoading(false);
      }
    }
    setupCamera();

    return () => {
      cancelled = true;
      cameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="text-gray-600">Loading camera...</div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Please try:
            <ul className="list-disc ml-5">
              <li>Checking if your camera is connected</li>
              <li>Allowing camera access in your browser settings</li>
              <li>Closing other applications that might be using the camera</li>
              <li>Refreshing the page</li>
            </ul>
          </p>
        </div>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full rounded shadow-lg"
        style={{ display: error ? 'none' : 'block' }}
      />
    </div>
  );
};

export const BarcodeScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<string | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null); // Store game information
  const [scanner, setScanner] = useState<BrowserMultiFormatReader | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  useEffect(() => {
    const initScanner = async () => {
      const multiFormatReader = new BrowserMultiFormatReader();
      setScanner(multiFormatReader);
    };

    initScanner();
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera not supported');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
        scanBarcode();
      }
    } catch (err) {
      console.error(err);
      setError('Error accessing camera: ' + err);
    }
  };

  const scanBarcode = () => {
    if (scanner && videoRef.current) {
      scanner.decodeFromVideoDevice(
        null,
        videoRef.current,
        async (result, err) => {
          if (result) {
            setResult(result.getText());
            await fetchGameInfo(result.getText()); // Fetch game info using the scanned barcode
            stopCamera(); // Close the camera after scanning
          }
          if (err) {
            // Handle error or ignore if no result yet
          }
        },
      );
    }
  };

  const fetchGameInfo = async (barcode: string) => {
    try {
      const response = await fetch(
        `https://api.example.com/boardgame/${barcode}`,
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setGameInfo(data); // Set the game information
    } catch (error) {
      console.error('Error fetching game info:', error);
      setError('Failed to fetch game information');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop()); // Stop all tracks
      videoRef.current.srcObject = null; // Clear the video source
      setIsCameraActive(false); // Update camera status
    }
  };

  return (
    <div>
      <button onClick={startCamera} disabled={isCameraActive}>
        Start Camera
      </button>
      {error && <div>{error}</div>}
      <video ref={videoRef} autoPlay playsInline />
      {result && (
        <div>
          <h2>Barcode Result:</h2>
          <p>{result}</p>
        </div>
      )}
      {gameInfo && (
        <div>
          <h2>Game Information:</h2>
          <p>
            <strong>Title:</strong> {gameInfo.title}
          </p>
          <p>
            <strong>Description:</strong> {gameInfo.description}
          </p>
          {gameInfo.image && <img src={gameInfo.image} alt={gameInfo.title} />}
        </div>
      )}
    </div>
  );
};
