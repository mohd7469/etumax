import React, { useState } from 'react';
import { useSeo } from '@/context/SeoContext';
import { X, Globe, Twitter, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';

const SeoDebugPanel = () => {
  const { debugMeta } = useSeo();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show in DEV mode
  if (!import.meta.env.DEV) return null;

  if (!debugMeta) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-black text-white px-3 py-2 rounded-lg text-xs font-mono shadow-xl border border-gray-700 hover:bg-gray-900 transition-all opacity-70 hover:opacity-100"
      >
        SEO Debug
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50 bg-black text-white w-64 rounded-lg shadow-xl border border-gray-700 font-sans">
        <div className="flex justify-between items-center p-2 border-b border-gray-800">
          <span className="text-xs font-bold text-green-400">SEO Debug</span>
          <div className="flex gap-1">
             <button onClick={() => setIsMinimized(false)}><ChevronUp className="w-3 h-3" /></button>
             <button onClick={() => setIsOpen(false)}><X className="w-3 h-3" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-zinc-950 text-white w-[400px] max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl border border-zinc-800 font-sans text-sm animate-in slide-in-from-bottom-5">
      
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-900 sticky top-0">
        <div className="flex items-center gap-2">
           <AlertCircle className="w-4 h-4 text-green-500" />
           <span className="font-bold">SEO Debugger</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsMinimized(true)} className="hover:bg-zinc-800 p-1 rounded"><ChevronDown className="w-4 h-4" /></button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-zinc-800 p-1 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        
        {/* Open Graph Preview */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
            <Globe className="w-3 h-3" /> Open Graph / Facebook
          </h4>
          <div className="bg-zinc-100 text-black rounded-lg overflow-hidden border border-zinc-300">
            {debugMeta.image ? (
              <div className="aspect-[1.91/1] w-full bg-gray-200 relative overflow-hidden">
                <img src={debugMeta.image} alt="OG Preview" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="aspect-[1.91/1] w-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="p-3 bg-zinc-50">
              <div className="text-xs text-gray-500 uppercase truncate mb-1">{new URL(debugMeta.url).hostname}</div>
              <div className="font-bold text-sm leading-tight mb-1 line-clamp-2">{debugMeta.title}</div>
              <div className="text-xs text-gray-600 line-clamp-2">{debugMeta.description}</div>
            </div>
          </div>
        </div>

        {/* Twitter Preview */}
        <div>
           <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
            <Twitter className="w-3 h-3" /> Twitter Card (Large)
          </h4>
          <div className="bg-black text-white rounded-xl overflow-hidden border border-zinc-800">
            {debugMeta.image && (
               <div className="aspect-[2/1] w-full bg-zinc-900 relative">
                 <img src={debugMeta.image} alt="Twitter Preview" className="w-full h-full object-cover" />
               </div>
            )}
            <div className="p-3">
               <div className="text-sm font-bold truncate mb-0.5">{debugMeta.title}</div>
               <div className="text-xs text-gray-400 line-clamp-2">{debugMeta.description}</div>
               <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                 <Globe className="w-3 h-3" /> {new URL(debugMeta.url).hostname}
               </div>
            </div>
          </div>
        </div>

        {/* Raw Data */}
        <div>
          <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Meta Tags Source</h4>
          <div className="bg-zinc-900 rounded p-2 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
{`<title>${debugMeta.title}</title>
<meta name="description" content="${debugMeta.description?.substring(0, 50)}..." />
<meta property="og:image" content="${debugMeta.image}" />
<meta property="og:url" content="${debugMeta.url}" />
<meta name="twitter:card" content="${debugMeta.card}" />`}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeoDebugPanel;