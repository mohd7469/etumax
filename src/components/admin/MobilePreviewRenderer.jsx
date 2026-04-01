
import React, { useState, useEffect } from 'react';
import { Smartphone, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

class PreviewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Preview Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-600 rounded flex flex-col items-center justify-center text-center text-sm">
          <AlertTriangle className="w-6 h-6 mb-2" />
          <p className="font-bold mb-1">Render Error</p>
          <p className="text-xs opacity-80 break-words">{this.state.error?.message || "Invalid HTML syntax"}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeHtmlRenderer = ({ html, className }) => {
  return (
    <PreviewErrorBoundary>
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: html || '' }} 
      />
    </PreviewErrorBoundary>
  );
};

const MobilePreviewRenderer = ({ 
  headerCode, 
  bodyCode, 
  footerCode, 
  toggles 
}) => {
  const [loading, setLoading] = useState(true);

  // Simulate a brief loading state when props change to provide visual feedback
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [headerCode, bodyCode, footerCode, toggles]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
        <Smartphone className="w-4 h-4" />
        Live Mobile Preview
      </div>

      <div className="w-[375px] h-[812px] bg-white rounded-[2.5rem] border-[12px] border-black shadow-2xl shadow-black/20 overflow-hidden relative flex flex-col shrink-0">
        {/* Mobile Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-3xl z-[60]"></div>
        
        {loading ? (
          <div className="flex flex-col h-full p-4 space-y-4 pt-10">
            {toggles.header && <Skeleton className="h-16 w-full rounded-md" />}
            {toggles.body && (
              <div className="flex-1 space-y-4 py-4">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            )}
            {toggles.footer && <Skeleton className="h-20 w-full rounded-md mt-auto" />}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-white flex flex-col pt-6 custom-scrollbar">
            
            {toggles.header && (
              <div className="shrink-0 w-full">
                <SafeHtmlRenderer html={headerCode} />
              </div>
            )}
            
            {toggles.body && (
              <div className="flex-1 w-full relative">
                {bodyCode ? (
                  <SafeHtmlRenderer html={bodyCode} className="min-h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm italic p-4 text-center border-y border-dashed border-gray-200 bg-gray-50">
                    Empty Body Area
                  </div>
                )}
              </div>
            )}

            {toggles.footer && (
              <div className="shrink-0 w-full mt-auto">
                <SafeHtmlRenderer html={footerCode} />
              </div>
            )}

            {!toggles.header && !toggles.body && !toggles.footer && (
               <div className="flex items-center justify-center h-full text-gray-400 text-sm italic p-4 text-center">
                 All sections are hidden.
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePreviewRenderer;
