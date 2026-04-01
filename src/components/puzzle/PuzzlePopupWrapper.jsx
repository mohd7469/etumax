
import React, { useEffect, useRef } from 'react';
import { usePuzzlePopup } from '@/context/PuzzlePopupContext';
import PuzzlePopupModal from './PuzzlePopupModal';
import { useLocation } from 'react-router-dom';

const PuzzlePopupWrapper = ({ children }) => {
  const { 
    settings, 
    isInitializing, 
    openPopup, 
    isOpen, 
    hasSolved,
    timerEnabled,
    imageCyclingEnabled,
    timerDuration
  } = usePuzzlePopup();
  
  const location = useLocation();
  const timerRef = useRef(null);
  const exitIntentRef = useRef(null);
  const hasAttemptedShow = useRef(false);

  useEffect(() => {
    // Clean up timeouts/listeners on unmount or settings change
    const cleanup = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (exitIntentRef.current) {
        document.removeEventListener('mouseleave', exitIntentRef.current);
        exitIntentRef.current = null;
      }
    };

    // Don't do anything if initializing, already open, solved, or disabled
    if (isInitializing || isOpen || hasSolved || !settings.enabled) {
      cleanup();
      return;
    }

    // Check suppression (user checked "don't show again")
    const suppressed = localStorage.getItem('puzzlePopup_suppressed');
    if (suppressed) return;

    // Check frequency rules
    const lastShown = localStorage.getItem('puzzlePopup_lastShown');
    const now = Date.now();

    if (lastShown) {
      const timeSinceShown = now - parseInt(lastShown, 10);
      
      switch (settings.showFrequency) {
        case 'once_session':
          if (sessionStorage.getItem('puzzlePopup_shownThisSession')) return;
          break;
        case 'once_day':
          if (timeSinceShown < 24 * 60 * 60 * 1000) return;
          break;
        case 'once_week':
          if (timeSinceShown < 7 * 24 * 60 * 60 * 1000) return;
          break;
        case 'always':
        default:
          break;
      }
    }

    // Don't show on admin or checkout routes
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/checkout')) {
        return;
    }

    // Only set up trigger once
    if (!hasAttemptedShow.current) {
        hasAttemptedShow.current = true;
        
        const triggerType = settings.triggerType || 'delay';
        
        const triggerPopup = () => {
          openPopup();
          localStorage.setItem('puzzlePopup_lastShown', Date.now().toString());
          sessionStorage.setItem('puzzlePopup_shownThisSession', 'true');
        };

        if (triggerType === 'delay') {
          const delayMs = (Number(settings.delay) || 5) * 1000;
          timerRef.current = setTimeout(triggerPopup, delayMs);
        } else if (triggerType === 'exit-intent') {
          exitIntentRef.current = (e) => {
            if (e.clientY <= 0) {
              triggerPopup();
              document.removeEventListener('mouseleave', exitIntentRef.current);
            }
          };
          document.addEventListener('mouseleave', exitIntentRef.current);
        }
    }

    return cleanup;
  }, [isInitializing, settings.enabled, settings.delay, settings.triggerType, settings.showFrequency, isOpen, hasSolved, openPopup, location.pathname]);

  // Reset attempt flag if modal is closed manually so it might re-trigger if logic allows
  useEffect(() => {
    if (!isOpen) {
      hasAttemptedShow.current = false;
    }
  }, [isOpen]);

  if (isInitializing) return <>{children}</>;

  return (
    <>
      {children}
      <PuzzlePopupModal 
        timerSettings={{
          timerEnabled,
          imageCyclingEnabled,
          timerDuration
        }}
      />
    </>
  );
};

export default PuzzlePopupWrapper;
