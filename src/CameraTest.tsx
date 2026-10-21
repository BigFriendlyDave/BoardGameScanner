import React, { useRef, useState } from 'react';

const CameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Camera stream obtained successfully');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={startCamera}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Start Camera
      </button>

      {errorMsg && <div className="text-red-500 mb-4">Error: {errorMsg}</div>}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full max-w-md border rounded"
      />
    </div>
  );
};

export default CameraTest;
