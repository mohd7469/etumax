
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const PuzzlePopupContext = createContext();

export const usePuzzlePopup = () => {
  const context = useContext(PuzzlePopupContext);
  if (!context) {
    throw new Error('usePuzzlePopup must be used within a PuzzlePopupProvider');
  }
  return context;
};

const defaultSettings = {
  enabled: false,
  triggerType: 'delay',
  delay: 5,
  title: 'Solve the Puzzle & Win!',
  description: 'Put the image back together to reveal your secret discount code.',
  images: ['https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=500&auto=format&fit=crop'],
  couponCode: 'PUZZLE15',
  discountType: 'percentage',
  discountValue: 15,
  puzzleType: 'sliding',
  difficulty: 3,
  timeLimit: 60,
  timerEnabled: false,
  imageCyclingEnabled: false,
  backgroundColor: '#ffffff',
  textColor: '#000000',
  buttonColor: '#8B5CF6',
  fontFamily: 'Inter',
  animationStyle: 'spring',
  showFrequency: 'once_session',
  successTitle: 'Congratulations!',
  successMessage: 'You solved it! Here is your reward:',
  buttonText: 'Shop Now',
  allowReshuffle: true,
  allowHint: true
};

export const PuzzlePopupProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSolved, setHasSolved] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [isInitializing, setIsInitializing] = useState(true);

  // Timer specific state
  const [timerDuration, setTimerDuration] = useState(60);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [imageCyclingEnabled, setImageCyclingEnabled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [timerValue, setTimerValue] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Load settings from Firestore
  useEffect(() => {
    const unsubscribe = listenToDocument('puzzlePopupSettings', 'default', (data) => {
      if (data) {
        const validData = { ...data };
        
        // Migrate legacy single image to images array
        if (validData.image && (!validData.images || validData.images.length === 0)) {
          validData.images = [validData.image];
          delete validData.image; // Cleanup old field
        }
        
        if (!validData.images || !Array.isArray(validData.images) || validData.images.length === 0) {
          validData.images = defaultSettings.images;
        }

        setSettings((prev) => ({ ...prev, ...validData }));
      }
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync timer state with loaded settings
  useEffect(() => {
    if (!isInitializing) {
      const dur = settings.timeLimit || 60;
      setTimerDuration(dur);
      setTimerValue(dur);
      setTimerEnabled(!!settings.timerEnabled);
      setImageCyclingEnabled(!!settings.imageCyclingEnabled);
    }
  }, [settings.timeLimit, settings.timerEnabled, settings.imageCyclingEnabled, isInitializing]);

  const saveSettings = async (newSettings) => {
    try {
      await setDocument('puzzlePopupSettings', 'default', newSettings);
      return true;
    } catch (error) {
      console.error("Error saving puzzle popup settings:", error);
      throw error;
    }
  };

  const updateTimerSettings = useCallback((newTimerSettings) => {
    setSettings(prev => ({ ...prev, ...newTimerSettings }));
  }, []);

  const resetTimer = useCallback(() => {
    setTimerValue(timerDuration);
  }, [timerDuration]);

  const incrementImageIndex = useCallback(() => {
    if (settings.images && settings.images.length > 0) {
      setCurrentImageIndex(prev => (prev + 1) % settings.images.length);
    }
  }, [settings.images]);

  const getTimerColor = useCallback((current, max) => {
    const ratio = current / max;
    if (ratio > 0.5) return 'var(--timer-success)';
    if (ratio > 0.25) return 'var(--timer-warning)';
    return 'var(--timer-danger)';
  }, []);

  const closePopup = useCallback((dontShowAgain = false) => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem('puzzlePopup_suppressed', 'true');
    }
  }, []);

  const openPopup = useCallback(() => {
    setIsOpen(true);
  }, []);

  const markSolved = useCallback(() => {
    setHasSolved(true);
    setTimerRunning(false);
    localStorage.setItem('puzzlePopup_solved', 'true');
  }, []);

  const value = {
    isOpen, setIsOpen,
    hasSolved, setHasSolved,
    settings, setSettings,
    isInitializing,
    closePopup, openPopup, markSolved, saveSettings,
    timerDuration, setTimerDuration,
    timerEnabled, setTimerEnabled,
    imageCyclingEnabled, setImageCyclingEnabled,
    currentImageIndex, setCurrentImageIndex,
    timerValue, setTimerValue,
    timerRunning, setTimerRunning,
    updateTimerSettings, resetTimer, incrementImageIndex, getTimerColor
  };

  return (
    <PuzzlePopupContext.Provider value={value}>
      {children}
    </PuzzlePopupContext.Provider>
  );
};
