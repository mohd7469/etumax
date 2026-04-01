
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RefreshCw, Expand, Shrink, History, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useDesign } from '@/context/DesignContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeaderFooterCodeEditor from '@/components/admin/HeaderFooterCodeEditor';
import { Badge } from '@/components/ui/badge';

const CodeEditor = ({ value, onChange, lineCount }) => {
  const lineNumbersRef = useRef(null);
  const textareaRef = useRef(null);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex font-mono text-sm border rounded-lg overflow-hidden bg-[#282c34] text-gray-300 h-96">
      <div ref={lineNumbersRef} className="w-12 text-right pr-4 pt-3 text-gray-500 select-none overflow-y-hidden">
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onScroll={handleScroll}
        className="flex-1 p-3 bg-transparent resize-none focus:outline-none leading-normal tracking-wide"
        spellCheck="false"
      />
    </div>
  );
};

const AdminCustomCss = () => {
  const { toast } = useToast();
  const { customCss, saveCustomCss, customCssHistory, revertCustomCss, headerFooterCode, saveHeaderFooterCode } = useDesign();
  const [localCss, setLocalCss] = useState(customCss);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isValidCss, setIsValidCss] = useState(true);
  const [lineCount, setLineCount] = useState(1);
  const [livePreview, setLivePreview] = useState(false);

  useEffect(() => {
    setLocalCss(customCss);
    setLineCount(customCss.split('\n').length);
  }, [customCss]);

  const handleCssChange = (e) => {
    const newCss = e.target.value;
    setLocalCss(newCss);
    setLineCount(newCss.split('\n').length);
    validateCss(newCss);
    
    // Live preview: inject immediately as user types
    if (livePreview) {
      const styleEl = document.getElementById('custom-css-live-preview');
      if (styleEl) {
        styleEl.textContent = newCss;
      }
    }
  };

  const validateCss = (css) => {
    if (!css.trim()) {
      setIsValidCss(true);
      return;
    }
    const s = document.createElement('style');
    s.innerHTML = `body { --test-prop: 1; } @media { body { --test-prop: 2; } } ${css}`;
    document.body.appendChild(s);
    const sheet = s.sheet;
    let isValid = true;
    try {
      if (sheet.cssRules.length === 0 && css.trim().length > 0) {
        if ((css.match(/{/g) || []).length !== (css.match(/}/g) || []).length) {
          isValid = false;
        }
      }
    } catch (e) {
      isValid = false;
    }
    document.body.removeChild(s);
    setIsValidCss(isValid);
  };

  const handleSaveCss = () => {
    if (!isValidCss) {
      toast({
        variant: 'destructive',
        title: 'Invalid CSS',
        description: 'Please fix the errors in your CSS before saving.',
      });
      return;
    }
    
    console.log('[AdminCustomCss] Saving custom CSS to Firestore');
    saveCustomCss(localCss);
    
    toast({
      title: 'Custom CSS Saved! ✨',
      description: 'Your styles have been applied across the site.',
    });
  };

  const handleResetCss = () => {
    setLocalCss('');
    saveCustomCss('');
    toast({
      variant: 'destructive',
      title: 'CSS Reset',
      description: 'All custom CSS has been cleared.',
    });
  };

  const handleRevertCss = (versionTimestamp) => {
    revertCustomCss(versionTimestamp);
    toast({
      title: 'CSS Reverted',
      description: `Restored version from ${new Date(versionTimestamp).toLocaleString()}.`,
    });
  };

  const toggleLivePreview = () => {
    const newLivePreview = !livePreview;
    setLivePreview(newLivePreview);
    
    if (newLivePreview) {
      // Create live preview style element
      let styleEl = document.getElementById('custom-css-live-preview');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'custom-css-live-preview';
        styleEl.setAttribute('data-description', 'Live Preview CSS (not saved)');
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = localCss;
      
      toast({
        title: 'Live Preview Enabled',
        description: 'Changes will appear immediately as you type.',
      });
    } else {
      // Remove live preview style element
      const styleEl = document.getElementById('custom-css-live-preview');
      if (styleEl) {
        styleEl.remove();
      }
      
      toast({
        title: 'Live Preview Disabled',
        description: 'Click "Save & Apply CSS" to see your changes.',
      });
    }
  };

  const editorContainerClass = isFullScreen
    ? "fixed inset-0 z-50 bg-background p-4 flex flex-col"
    : "relative";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Custom Code & CSS</h1>
      </div>

      <Tabs defaultValue="css" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="css">Custom CSS</TabsTrigger>
          <TabsTrigger value="header-footer">Header & Footer Code</TabsTrigger>
        </TabsList>

        <TabsContent value="css" className="space-y-6">
          <div className="flex justify-between items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Button 
                variant={livePreview ? "default" : "outline"} 
                onClick={toggleLivePreview}
                size="sm"
              >
                <Eye className="h-4 w-4 mr-2" />
                {livePreview ? 'Live Preview ON' : 'Live Preview OFF'}
              </Button>
              {livePreview && (
                <Badge variant="secondary" className="animate-pulse">
                  Changes visible in real-time
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleResetCss}><RefreshCw className="h-4 w-4 mr-2" />Reset CSS</Button>
              <Button onClick={handleSaveCss} disabled={!isValidCss}><Save className="h-4 w-4 mr-2" />Save & Apply CSS</Button>
            </div>
          </div>

          <div className={editorContainerClass}>
            <Card className="flex-1 flex flex-col shadow-sm border rounded-xl">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>CSS Editor</CardTitle>
                    <CardDescription>Add your custom styles here. They will be applied globally.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(!isFullScreen)}>
                    {isFullScreen ? <Shrink className="h-5 w-5" /> : <Expand className="h-5 w-5" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1">
                  <CodeEditor value={localCss} onChange={handleCssChange} lineCount={lineCount} />
                </div>
                <div className="flex items-center justify-between pt-3 pb-1 text-sm">
                  {isValidCss ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span>CSS looks good!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600 font-medium">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Potential syntax error detected.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm border rounded-xl bg-blue-50/50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-base">💡 Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2 text-gray-700">
              <p>• Use <code className="bg-white px-2 py-0.5 rounded text-xs">!important</code> to override existing styles</p>
              <p>• Target elements with classes like <code className="bg-white px-2 py-0.5 rounded text-xs">.product-card</code></p>
              <p>• Enable Live Preview to see changes as you type</p>
              <p>• Example: <code className="bg-white px-2 py-0.5 rounded text-xs">.btn &#123; background: red !important; &#125;</code></p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border rounded-xl">
            <CardHeader>
              <CardTitle>Revision History</CardTitle>
              <CardDescription>Revert to a previously saved version of your CSS.</CardDescription>
            </CardHeader>
            <CardContent>
              {customCssHistory.length > 0 ? (
                <div className="space-y-2">
                  {customCssHistory.map((version) => (
                    <div key={version.timestamp} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">Saved on {new Date(version.timestamp).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 truncate max-w-md mt-0.5">{version.css.substring(0, 100)}...</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleRevertCss(version.timestamp)} className="ml-3 flex-shrink-0">
                        <History className="h-4 w-4 mr-2" /> Revert
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-6 bg-gray-50/50 rounded-lg border border-dashed">No saved versions yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header-footer">
          <HeaderFooterCodeEditor
            initialCode={headerFooterCode}
            onSave={saveHeaderFooterCode}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdminCustomCss;
