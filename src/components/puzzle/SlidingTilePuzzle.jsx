
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, HelpCircle, FileImage as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SlidingTilePuzzle = ({ 
  size = 3, 
  imageUrl, 
  onSolve, 
  allowReshuffle = true, 
  allowHint = true,
  timerEnabled = false,
  timerValue = 60,
  timerDuration = 60,
  resetTimer,
  incrementImageIndex,
  getTimerColor
}) => {
  const [tiles, setTiles] = useState([]);
  const [isSolved, setIsSolved] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [moves, setMoves] = useState(0);

  const totalTiles = size * size;

  const initializePuzzle = useCallback((shuffle = true) => {
    let initialTiles = Array.from({ length: totalTiles }, (_, i) => i);
    
    if (shuffle) {
      let currentEmptyIndex = totalTiles - 1;
      let board = [...initialTiles];
      
      for (let i = 0; i < 150; i++) {
        const neighbors = [];
        const row = Math.floor(currentEmptyIndex / size);
        const col = currentEmptyIndex % size;
        
        if (row > 0) neighbors.push(currentEmptyIndex - size); // top
        if (row < size - 1) neighbors.push(currentEmptyIndex + size); // bottom
        if (col > 0) neighbors.push(currentEmptyIndex - 1); // left
        if (col < size - 1) neighbors.push(currentEmptyIndex + 1); // right
        
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
        
        // Swap
        [board[currentEmptyIndex], board[randomNeighbor]] = [board[randomNeighbor], board[currentEmptyIndex]];
        currentEmptyIndex = randomNeighbor;
      }
      
      initialTiles = board;
    }
    
    setTiles(initialTiles);
    setIsSolved(false);
    setMoves(0);
    setShowHint(false);
  }, [size, totalTiles]);

  // Handle initialization and resetting on image change
  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle, imageUrl]);

  // Handle countdown logic when timer hits zero
  useEffect(() => {
    if (timerEnabled && timerValue === 0) {
      initializePuzzle(true);
      if (incrementImageIndex) incrementImageIndex();
      if (resetTimer) resetTimer();
    }
  }, [timerValue, timerEnabled, initializePuzzle, incrementImageIndex, resetTimer]);

  const handleTileClick = (index) => {
    if (isSolved) return;

    const emptyIndex = tiles.indexOf(totalTiles - 1);
    
    const row = Math.floor(index / size);
    const col = index % size;
    const emptyRow = Math.floor(emptyIndex / size);
    const emptyCol = emptyIndex % size;

    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      
      const won = newTiles.every((val, i) => val === i);
      if (won) {
        setIsSolved(true);
        if (onSolve) onSolve();
      }
    }
  };

  const tileSize = 100 / size;

  return (
    <div className="flex flex-col items-center w-full">
      {timerEnabled && timerDuration > 0 && !isSolved && (
        <div className="w-full max-w-[300px] mb-4">
          <div 
            className="flex justify-between items-end mb-1.5 px-1" 
            style={{ color: getTimerColor ? getTimerColor(timerValue, timerDuration) : 'var(--timer-success)' }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">Time Left</span>
            <span className={`text-xl font-black font-mono leading-none ${timerValue <= 10 ? 'animate-pulse-low-time' : ''}`}>
              {Math.floor(timerValue / 60)}:{(timerValue % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full transition-all duration-1000 ease-linear rounded-full"
              style={{
                width: `${(timerValue / timerDuration) * 100}%`,
                backgroundColor: getTimerColor ? getTimerColor(timerValue, timerDuration) : 'var(--timer-success)'
              }}
            />
          </div>
        </div>
      )}

      <div 
        className="relative bg-gray-200 rounded-md overflow-hidden shadow-inner border border-gray-300"
        style={{ 
          width: '100%', 
          aspectRatio: '1/1',
          maxWidth: '300px'
        }}
      >
        {!imageUrl && (
           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400">
             <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
             <span className="text-sm font-medium">No Image Provided</span>
           </div>
        )}

        {tiles.map((tileValue, index) => {
          const isEmpty = tileValue === totalTiles - 1;
          if (isEmpty && !isSolved) return null;

          const row = Math.floor(index / size);
          const col = index % size;
          
          const targetRow = Math.floor(tileValue / size);
          const targetCol = tileValue % size;

          return (
            <motion.div
              key={tileValue}
              layout
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={() => handleTileClick(index)}
              className={`absolute cursor-pointer border border-white/30 transition-opacity ${isSolved ? 'opacity-100 border-none z-20' : 'opacity-100 hover:opacity-90 z-10'}`}
              style={{
                width: `${tileSize}%`,
                height: `${tileSize}%`,
                top: `${row * tileSize}%`,
                left: `${col * tileSize}%`,
                backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
                backgroundColor: !imageUrl ? `hsl(${(tileValue * 30) % 360}, 70%, 50%)` : 'transparent',
                backgroundSize: `${size * 100}% ${size * 100}%`,
                backgroundPosition: `${targetCol * (100 / (size - 1))}% ${targetRow * (100 / (size - 1))}%`,
              }}
            >
              {(showHint || !imageUrl) && !isSolved && !isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-lg drop-shadow-md">
                  {tileValue + 1}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center justify-between w-full max-w-[300px] mt-4">
        <div className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
          Moves: <span className="text-gray-900">{moves}</span>
        </div>
        <div className="flex gap-2">
          {allowHint && !isSolved && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowHint(!showHint)}
              className="h-8 px-3"
              title="Toggle Hint"
            >
              <HelpCircle className="w-4 h-4 mr-1.5" />
              {showHint ? 'Hide Hint' : 'Hint'}
            </Button>
          )}
          {allowReshuffle && !isSolved && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                initializePuzzle();
                if (resetTimer) resetTimer();
              }}
              className="h-8 px-3"
              title="Reshuffle"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidingTilePuzzle;
