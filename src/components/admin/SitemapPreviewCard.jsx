
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, ExternalLink, FileCode2 } from 'lucide-react';
import CodeEditorWithSyntaxHighlight from './CodeEditorWithSyntaxHighlight';
import { format } from 'date-fns';
import { downloadSitemapFile } from '@/lib/sitemapGeneratorV2';
import { useToast } from '@/components/ui/use-toast';

const SitemapPreviewCard = ({ 
  title, 
  type, 
  content, 
  timestamp, 
  onRegenerate,
  filename 
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate rough size in KB
  const sizeKb = content ? (new Blob([content]).size / 1024).toFixed(2) : '0.00';

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      await onRegenerate(type);
      toast({ title: 'Success', description: `${title} regenerated.` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to regenerate.', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    downloadSitemapFile(filename, content);
  };

  const handleViewInBrowser = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // We intentionally don't revoke here immediately as the new tab needs to read it
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          <div className="text-xs text-muted-foreground flex flex-col items-end">
            <span>{sizeKb} KB</span>
            <span>{timestamp ? format(new Date(timestamp), 'PP p') : 'Never generated'}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow pb-2">
        {content ? (
          <div className="h-[200px] rounded-md overflow-hidden border">
            <CodeEditorWithSyntaxHighlight 
              code={content} 
              onChange={() => {}} // Read only
              language="xml" 
              height="200px"
            />
          </div>
        ) : (
          <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md bg-muted/30">
            <p className="text-sm text-muted-foreground">Not generated yet</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2 flex flex-wrap gap-2 justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRegenerate} 
          disabled={isGenerating}
          className="flex-1 min-w-[120px]"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </Button>
        
        <div className="flex gap-2 flex-1 justify-end min-w-[140px]">
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleViewInBrowser}
            disabled={!content}
            title="View in new tab"
            className="px-2"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={handleDownload}
            disabled={!content}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SitemapPreviewCard;
