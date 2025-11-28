'use client';

import React, { useEffect, useRef } from 'react';

interface VideoAnalyzerProps {
  file: File;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ file }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && file) {
      const url = URL.createObjectURL(file);
      videoRef.current.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  return (
    <div>
      <h3>Video Preview</h3>
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', maxWidth: '600px' }}
      />
    </div>
  );
};

export default VideoAnalyzer;
