import React from 'react';
import { useSeo } from '@/context/SeoContext';

const RobotsRenderer = () => {
  const { robotsTxt } = useSeo();

  return (
    <pre style={{ 
      wordWrap: 'break-word', 
      whiteSpace: 'pre-wrap', 
      fontFamily: 'monospace', 
      padding: '20px', 
      margin: 0,
      backgroundColor: '#ffffff',
      color: '#000000',
      lineHeight: '1.5'
    }}>
      {robotsTxt}
    </pre>
  );
};

export default RobotsRenderer;