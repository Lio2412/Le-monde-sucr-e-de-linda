import { useCallback, useEffect, useState, useRef } from 'react';

interface FullscreenAPI {
  requestFullscreen: string;
  exitFullscreen: string;
  fullscreenElement: string;
  fullscreenEnabled: string;
  fullscreenchange: string;
  fullscreenerror: string;
}

function getBrowserFullscreenAPI(): FullscreenAPI | null {
  if (typeof window === 'undefined') return null;

  const apis: FullscreenAPI[] = [
    {
      requestFullscreen: 'requestFullscreen',
      exitFullscreen: 'exitFullscreen',
      fullscreenElement: 'fullscreenElement',
      fullscreenEnabled: 'fullscreenEnabled',
      fullscreenchange: 'fullscreenchange',
      fullscreenerror: 'fullscreenerror'
    },
    {
      requestFullscreen: 'webkitRequestFullscreen',
      exitFullscreen: 'webkitExitFullscreen',
      fullscreenElement: 'webkitFullscreenElement',
      fullscreenEnabled: 'webkitFullscreenEnabled',
      fullscreenchange: 'webkitfullscreenchange',
      fullscreenerror: 'webkitfullscreenerror'
    },
    {
      requestFullscreen: 'mozRequestFullScreen',
      exitFullscreen: 'mozCancelFullScreen',
      fullscreenElement: 'mozFullScreenElement',
      fullscreenEnabled: 'mozFullScreenEnabled',
      fullscreenchange: 'mozfullscreenchange',
      fullscreenerror: 'mozfullscreenerror'
    },
    {
      requestFullscreen: 'msRequestFullscreen',
      exitFullscreen: 'msExitFullscreen',
      fullscreenElement: 'msFullscreenElement',
      fullscreenEnabled: 'msFullscreenEnabled',
      fullscreenchange: 'MSFullscreenChange',
      fullscreenerror: 'MSFullscreenError'
    }
  ];

  return apis.find(api => 
    document.documentElement[api.requestFullscreen as keyof HTMLElement] !== undefined
  ) || null;
}

export const useFullscreen = (ref: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const isEnabled = typeof document !== 'undefined' && document.fullscreenEnabled;

  const requestWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      } catch (err) {
        console.warn('Wake Lock request failed:', err);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      } catch (err) {
        console.warn('Wake Lock release failed:', err);
      }
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const newIsFullscreen = document.fullscreenElement === ref.current;
      setIsFullscreen(newIsFullscreen);
      
      if (newIsFullscreen) {
        requestWakeLock();
      } else {
        releaseWakeLock();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      releaseWakeLock();
    };
  }, [ref, requestWakeLock, releaseWakeLock]);

  const enterFullscreen = useCallback(async () => {
    try {
      if (!ref.current) {
        throw new Error('No element to make fullscreen');
      }
      await ref.current.requestFullscreen();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fullscreen error'));
    }
  }, [ref]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fullscreen error'));
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return {
    isFullscreen,
    isEnabled,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
    error,
  };
};

// Fonction utilitaire pour le Wake Lock
async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      await navigator.wakeLock.request('screen');
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
    }
  }
} 