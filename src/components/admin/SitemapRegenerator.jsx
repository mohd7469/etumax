
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RefreshCw, Download, FileCheck, Clock, AlertCircle, Globe } from 'lucide-react';
import { getDocument, setDocument } from '@/lib/firestoreService';
import { 
  generateSitemapIndex, 
  generateProductsSitemap, 
  generateCategoriesSitemap, 
  generatePagesSitemap, 
  generateRobotsTxt 
} from '@/lib/sitemapGenerator';
import { writeSitemapFiles } from '@/lib/sitemapFileWriter';

const SitemapRegenerator = () => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [lastGeneratedAt, setLastGeneratedAt] = useState(null);
  const [baseUrl, setBaseUrl] = useState('https://www.etumaxgulf.com');
  const [isFetchingConfig, setIsFetchingConfig] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfigAndStatus = async () => {
      setIsFetchingConfig(true);
      try {
        // Fetch base domain from settings
        const siteConfigDoc = await getDocument('settings', 'siteConfig');
        if (siteConfigDoc && siteConfigDoc.baseUrl) {
          setBaseUrl(siteConfigDoc.baseUrl);
        }
        
        // Fetch sitemap generation status
        const sitemapDoc = await getDocument('siteSettings', 'sitemap');
        if (sitemapDoc && sitemapDoc.lastGeneratedAt) {
          setLastGeneratedAt(sitemapDoc.lastGeneratedAt);
        }
      } catch (error) {
        console.error("Could not fetch config or sitemap status:", error);
      } finally {
        setIsFetchingConfig(false);
      }
    };
    fetchConfigAndStatus();
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // 1. Generate all strings with base domain
      const sitemapIndex = generateSitemapIndex(baseUrl);
      const sitemapProducts = await generateProductsSitemap(baseUrl);
      const sitemapCategories = await generateCategoriesSitemap(baseUrl);
      const sitemapPages = generatePagesSitemap(baseUrl);
      const robotsTxt = generateRobotsTxt(baseUrl);

      // 2. Prepare file map
      const files = {
        'sitemap_index.xml': sitemapIndex,
        'sitemap_products.xml': sitemapProducts,
        'sitemap_categories.xml': sitemapCategories,
        'sitemap_pages.xml': sitemapPages,
        'robots.txt': robotsTxt
      };

      // 3. Write files (downloads ZIP in frontend environment)
      const writeResult = await writeSitemapFiles(files);

      if (writeResult.success) {
        const timestamp = new Date().toISOString();
        
        // 4. Update Firestore
        await setDocument('siteSettings', 'sitemap', { 
          lastGeneratedAt: timestamp 
        });
        
        setLastGeneratedAt(timestamp);
        
        toast({
          title: "Sitemaps Generated!",
          description: "A ZIP file containing the new sitemaps has been downloaded. Extract and place them in your public directory.",
          variant: "default",
        });
      } else {
        throw new Error(writeResult.error || "Failed to write files");
      }
    } catch (error) {
      console.error("Sitemap regeneration error:", error);
      toast({
        title: "Generation Failed",
        description: "There was an error generating the sitemaps. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const formattedDate = lastGeneratedAt 
    ? new Date(lastGeneratedAt).toLocaleString() 
    : 'Never';

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <RefreshCw className="h-5 w-5" />
          Production Sitemap Generator
        </CardTitle>
        <CardDescription>
          Generate static XML sitemaps ready for search engine indexing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200">
          <Globe className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm w-full">
            <p className="font-medium mb-1">Target Base URL</p>
            {isFetchingConfig ? (
              <p className="animate-pulse">Loading configuration...</p>
            ) : (
              <p>Generating sitemaps for: <strong>{baseUrl}</strong></p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
          <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <p className="text-sm font-medium">Last Generated</p>
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium mb-1">Deployment Note</p>
            <p>Because this is a frontend application, clicking regenerate will download a ZIP file. You must extract this file and place the contents into your site's <code>/public</code> directory before deploying.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500"/> sitemap_index.xml</div>
          <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500"/> sitemap_products.xml</div>
          <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500"/> sitemap_categories.xml</div>
          <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500"/> sitemap_pages.xml</div>
          <div className="flex items-center gap-2"><FileCheck className="h-4 w-4 text-green-500"/> robots.txt</div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleRegenerate} 
          disabled={isRegenerating || isFetchingConfig}
          className="w-full sm:w-auto"
        >
          {isRegenerating ? (
            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><Download className="mr-2 h-4 w-4" /> Generate & Download Sitemaps</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SitemapRegenerator;
