import React, { useRef, useEffect } from 'react';

const WebcamStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startVideoStream = async () => {
      try {
        // Request video stream from webcam
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };

    startVideoStream();

    // Cleanup function to stop video stream on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className='flex w-1/2 mr-4'>
      <div className='relative w-full pb-[60%] rounded-2xl overflow-hidden'>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className='absolute object-cover w-full h-full rounded-2xl'
        />
      </div>
    </div>

  );
};

export default WebcamStream;
