import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rings, TailSpin, InfinitySpin, Bars, Puff, Circles, ThreeDots } from 'react-loader-spinner';
import { useLoading } from '@/context/LoadingContext';
import { useDesign } from '@/context/DesignContext';

const loaderComponents = {
  Rings: (props) => <Rings {...props} />,
  TailSpin: (props) => <TailSpin {...props} />,
  InfinitySpin: (props) => <InfinitySpin {...props} />,
  Bars: (props) => <Bars {...props} />,
  Puff: (props) => <Puff {...props} />,
  Circles: (props) => <Circles {...props} />,
  ThreeDots: (props) => <ThreeDots {...props} />,
};

const WebsiteLoader = ({ isInitial = false }) => {
  const { isLoading } = useLoading();
  const { loaderSettings } = useDesign();
  const [showLoader, setShowLoader] = useState(isInitial || isLoading);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setShowLoader(false);
    } else {
      // Use a default delay if loaderSettings are not yet loaded
      const delay = loaderSettings?.delay ?? 0.5;
      timer = setTimeout(() => {
        setShowLoader(false);
      }, delay * 500);
    }
    return () => clearTimeout(timer);
  }, [isLoading, loaderSettings?.delay]);

  // Use default settings if they are not yet loaded
  const settings = loaderSettings || {
    enabled: false,
    delay: 0.04,
    style: 'Rings',
    color: '#8B5CF6',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    size: 80,
  };

  if (!settings.enabled && !isInitial) {
    return null;
  }

  const LoaderComponent = loaderComponents[settings.style] || Rings;

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ backgroundColor: settings.backgroundColor }}
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
        >
          <LoaderComponent
            height={settings.size}
            width={settings.size}
            color={settings.color}
            ariaLabel={`${settings.style}-loader`}
            visible={true}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WebsiteLoader;