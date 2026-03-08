'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { progressApi } from '@/lib/api';

interface YouTubePlayerProps {
  videoId: string;
  startTime?: number;
  onProgress?: (currentTime: number) => void;
  onComplete?: () => void;
  videoDbId: number;
  isLocked?: boolean;
}

export default function YouTubePlayer({
  videoId,
  startTime = 0,
  onProgress,
  onComplete,
  videoDbId,
  isLocked = false,
}: YouTubePlayerProps) {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Save progress to backend
  const saveProgress = useCallback(async (currentTime: number, completed: boolean = false) => {
    try {
      await progressApi.updateProgress(videoDbId, Math.floor(currentTime), completed);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [videoDbId]);

  // Handle video completion (90% watched)
  const handleVideoProgress = useCallback(() => {
    // In a real implementation with YouTube IFrame API, we would:
    // 1. Get current time from player
    // 2. Check if video is completed (90% watched)
    // 3. Save progress periodically
    
    // For this implementation, we'll simulate progress tracking
    // In production, use the YouTube IFrame API
  }, []);

  useEffect(() => {
    if (isLocked) return;

    // Simulate progress tracking
    // In production, replace with actual YouTube Player API integration
    progressIntervalRef.current = setInterval(() => {
      handleVideoProgress();
    }, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isLocked, handleVideoProgress]);

  if (isLocked) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="mt-2 text-gray-600 font-medium">Complete previous lesson first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        ref={playerRef}
        src={`https://www.youtube.com/embed/${videoId}?start=${startTime}&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        onLoad={() => setIsReady(true)}
      />
    </div>
  );
}
