
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, CheckCircle2, Gift, Loader2 } from 'lucide-react';
import { usePuzzlePopup } from '@/context/PuzzlePopupContext';
import SlidingTilePuzzle from './SlidingTilePuzzle';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

const PuzzlePopupModal = () => {
  const { 
    isOpen, closePopup, settings, hasSolved, markSolved,
    timerValue, setTimerValue, timerRunning, setTimerRunning,
    resetTimer, incrementImageIndex, getTimerColor, currentImageIndex,
    timerEnabled, imageCyclingEnabled, timerDuration
  } = usePuzzlePopup();
  
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageState, setImageState] = useState({ loading: true, error: false });
  const { toast } = useToast();

  // Handle image selection (respecting cycling logic)
  useEffect(() => {
    if (isOpen && !hasSolved) {
      if (imageCyclingEnabled && settings.images && settings.images.length > 0) {
        setCurrentImage(settings.images[currentImageIndex % settings.images.length]);
      } else {
        let selectedImage = 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=500&auto=format&fit=crop';
        
        const imagesList = settings.images && settings.images.length > 0 
          ? settings.images 
          : (settings.image ? [settings.image] : [selectedImage]);
          
        if (imagesList.length > 0) {
          const randomIndex = Math.floor(Math.random() * imagesList.length);
          selectedImage = imagesList[randomIndex];
        }
        
        setCurrentImage(selectedImage);
      }
    }
  }, [isOpen, hasSolved, settings.images, settings.image, imageCyclingEnabled, currentImageIndex]);

  // Load selected image
  useEffect(() => {
    if (isOpen && !hasSolved && currentImage) {
      setImageState({ loading: true, error: false });
      const img = new Image();
      img.src = currentImage;
      
      img.onload = () => {
        setImageState({ loading: false, error: false });
      };
      
      img.onerror = () => {
        console.error("Failed to load puzzle image:", currentImage);
        setImageState({ loading: false, error: true });
      };
    }
  }, [isOpen, hasSolved, currentImage]);

  // Pause/Resume timer based on visibility
  useEffect(() => {
    if (isOpen && !hasSolved && timerEnabled) {
      setTimerRunning(true);
    } else {
      setTimerRunning(false);
    }
    
    return () => setTimerRunning(false);
  }, [isOpen, hasSolved, timerEnabled, setTimerRunning]);

  // Timer Tick Logic
  useEffect(() => {
    let interval;
    if (timerRunning && !hasSolved && timerEnabled) {
      interval = setInterval(() => {
        setTimerValue(prev => {
          if (prev <= 0) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, hasSolved, timerEnabled, setTimerValue]);

  const handleClose = () => {
    closePopup(dontShowAgain);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(settings.couponCode);
      setCopied(true);
      toast({
        title: "Success",
        description: "Coupon copied to clipboard!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast({
        title: "Error",
        description: "Failed to copy coupon code.",
        variant: "destructive"
      });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-6 puzzle-popup-overlay">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <div className="relative z-10 flex flex-col items-center gap-4 w-full max-w-md">
          {/* Puzzle Image Preview - shown above the modal when playing */}
          {!hasSolved && !imageState.loading && !imageState.error && currentImage && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="hidden sm:block"
            >
              <div className="bg-white p-2 rounded-xl shadow-xl flex flex-col items-center">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Target Image</p>
                <img 
                  src={currentImage} 
                  alt="Puzzle Target" 
                  className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg border border-gray-200"
                />
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full overflow-hidden flex flex-col"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors z-20 text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Decorative Header */}
            <div 
              className="h-2 w-full" 
              style={{ backgroundColor: settings.buttonColor || 'var(--primary)' }}
            />

            <div className="p-6 md:p-8 flex flex-col items-center text-center min-h-[400px]">
              
              {!hasSolved ? (
                // Game View
                <motion.div 
                  key="game"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full flex flex-col items-center flex-1"
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: settings.textColor }}>{settings.title}</h2>
                    <p className="text-sm text-gray-500">{settings.description}</p>
                  </div>

                  {/* Mobile-only preview image */}
                  {!imageState.loading && !imageState.error && currentImage && (
                    <div className="sm:hidden mb-4 flex flex-col items-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Target Image</p>
                      <img 
                        src={currentImage} 
                        alt="Puzzle Target" 
                        className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm"
                      />
                    </div>
                  )}

                  {imageState.loading ? (
                    <div className="w-full max-w-[300px] aspect-square flex flex-col items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                      <p className="text-sm text-gray-500">Loading puzzle...</p>
                    </div>
                  ) : (
                    <SlidingTilePuzzle 
                      size={settings.difficulty || 3}
                      imageUrl={imageState.error ? null : currentImage}
                      allowReshuffle={settings.allowReshuffle}
                      allowHint={settings.allowHint}
                      timerEnabled={timerEnabled}
                      timerValue={timerValue}
                      timerDuration={timerDuration}
                      resetTimer={resetTimer}
                      incrementImageIndex={incrementImageIndex}
                      getTimerColor={getTimerColor}
                      onSolve={() => {
                        setTimerRunning(false);
                        setTimeout(markSolved, 1000);
                      }}
                    />
                  )}
                </motion.div>
              ) : (
                // Success View
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center py-4 flex-1 justify-center"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Gift className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ color: settings.textColor }}>{settings.successTitle}</h2>
                  <p className="text-gray-600 mb-6">{settings.successMessage}</p>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Your Code</p>
                    <div 
                      className="flex items-center justify-center gap-3 cursor-pointer group/copy"
                      onClick={handleCopy}
                      title="Click to copy"
                    >
                      <span className="text-2xl font-black text-gray-900 tracking-wider group-hover/copy:text-primary transition-colors">
                        {settings.couponCode}
                      </span>
                      <button 
                        className="p-2 bg-white border shadow-sm rounded-md group-hover/copy:bg-gray-100 transition-colors flex items-center justify-center"
                        aria-label="Copy code"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500 group-hover/copy:text-primary" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    onClick={() => { handleClose(); }}
                    className="w-full py-6 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all text-white"
                    style={{ 
                      backgroundColor: settings.buttonColor || 'var(--primary)',
                    }}
                    asChild
                  >
                    <Link to="/products">{settings.buttonText}</Link>
                  </Button>
                </motion.div>
              )}

              {/* Footer Options */}
              <div className="mt-6 flex items-center justify-center space-x-2 w-full">
                <Checkbox 
                  id="dontShow" 
                  checked={dontShowAgain} 
                  onCheckedChange={setDontShowAgain} 
                />
                <label 
                  htmlFor="dontShow" 
                  className="text-xs text-gray-500 cursor-pointer select-none"
                >
                  Don't show this again
                </label>
              </div>
              
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PuzzlePopupModal;
