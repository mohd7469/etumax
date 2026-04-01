
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileLayout } from '@/context/MobileLayoutContext';

const MobileTopStrip = () => {
  const { settings, loading } = useMobileLayout();
  if (loading || !settings) return null;

  const { topStrip } = settings;

  return (
    <AnimatePresence>
      {topStrip.enabled && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: topStrip.height, opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{ 
            backgroundColor: topStrip.backgroundColor, 
            color: topStrip.textColor,
            paddingTop: topStrip.padding.top,
            paddingBottom: topStrip.padding.bottom
          }}
          className="flex items-center justify-center text-xs font-medium z-40 overflow-hidden shrink-0 lg:hidden w-full"
          dangerouslySetInnerHTML={{ __html: topStrip.content }}
        />
      )}
    </AnimatePresence>
  );
};

export default MobileTopStrip;
