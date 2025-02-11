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

  const fullscreenElement = ref.current as HTMLElement & {
    requestFullscreen?: () => Promise<void>;
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  const isFullscreenSupported = Boolean(fullscreenElement && fullscreenElement.requestFullscreen);

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
      console.log('useFullscreen - Fullscreen state changed, document.fullscreenElement:', document.fullscreenElement);
      setIsFullscreen(Boolean(document.fullscreenElement));
      
      if (document.fullscreenElement === ref.current) {
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
    if (!ref.current) {
      console.warn('useFullscreen - Cannot enter fullscreen, ref.current is null');
      return;
    }

    if (!isFullscreenSupported) {
      console.warn('useFullscreen - Fullscreen API not supported on this element');
      return;
    }

    try {
      console.log('useFullscreen - Requesting fullscreen on ref.current:', ref.current);
      await fullscreenElement.requestFullscreen();
    } catch (err) {
      console.error('useFullscreen - Error requesting fullscreen:', err);
      setError(err as Error);
    }
  }, [ref, isFullscreenSupported, fullscreenElement]);

  const exitFullscreen = useCallback(async () => {
    if (!document.exitFullscreen) {
      console.warn('useFullscreen - Fullscreen API not supported');
      return;
    }

    try {
      console.log('useFullscreen - Exiting fullscreen');
      await document.exitFullscreen();
    } catch (err) {
      console.error('useFullscreen - Error exiting fullscreen:', err);
      setError(err as Error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!isEnabled || !isFullscreenSupported) {
      console.warn('useFullscreen - Fullscreen is not supported');
      return;
    }

    if (isFullscreen) {
      console.log('useFullscreen - Exiting fullscreen');
      exitFullscreen();
    } else {
      console.log('useFullscreen - Entering fullscreen, containerRef:', ref);
      enterFullscreen();
    }
  }, [isFullscreen, isEnabled, isFullscreenSupported, exitFullscreen, enterFullscreen]);

  return {
    isFullscreen,
    isEnabled: isEnabled && isFullscreenSupported,
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