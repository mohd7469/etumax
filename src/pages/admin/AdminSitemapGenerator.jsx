
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { RefreshCw, Download, FileText, Globe } from 'lucide-react';
import { getSitemapMetadata, saveSitemapMetadata, formatSitemapDate } from '@/lib/sitemapStorage';
import { 
  generateSitemapIndex, 
  generateProductsSitemap, 
  generateCategoriesSitemap, 
  generatePagesSitemap, 
  downloadSitemapFile 
} from '@/lib/sitemapGenerator';
import { useProducts } from '@/context/ProductContext';
import { useIntegrations } from '@/context/IntegrationContext';

const AdminSitemapGenerator = () => {
  const [metadata, setMetadata] = useState(null);
  const { products, categories } = useProducts();
  const { syncedPages } = useIntegrations();

  useEffect(() => {
    const data = getSitemapMetadata();
    if (data) setMetadata(data);
  }, []);

  const handleGenerate = async () => {
    try {
      const pXml = await generateProductsSitemap();
      const cXml = await generateCategoriesSitemap();
      const pgXml = generatePagesSitemap();
      const iXml = generateSitemapIndex();

      const stats = {
        productCount: products?.length || 0,
        categoryCount: categories?.length || 0,
        pageCount: syncedPages?.filter(p => p.showOnStore)?.length || 0,
        sizes: {
          products: pXml.length,
          categories: cXml.length,
          pages: pgXml.length,
          index: iXml.length
        }
      };

      const savedMeta = saveSitemapMetadata(new Date().toISOString(), stats);
      setMetadata(savedMeta);

      toast({
        title: "Sitemaps Generated Successfully",
        description: `Indexed ${stats.productCount} products, ${stats.categoryCount} categories, and ${stats.pageCount} pages.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message
      });
    }
  };

  const handleDownloadZip = async () => {
    try {
      const pXml = await generateProductsSitemap();
      const cXml = await generateCategoriesSitemap();
      const pgXml = generatePagesSitemap();
      const iXml = generateSitemapIndex();

      const success = await downloadSitemapFile({
        index: iXml,
        products: pXml,
        categories: cXml,
        pages: pgXml
      });

      if (success) {
        toast({ title: "ZIP Downloaded", description: "All sitemaps bundled successfully." });
      } else {
        throw new Error("Failed to create ZIP file");
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Download Failed", description: error.message });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sitemap Generator
          </CardTitle>
          <CardDescription>
            Generate static XML sitemaps for search engines (Google, Bing, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 border">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Last Generated</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold">{formatSitemapDate(metadata?.lastGenerated)}</span>
                {metadata && <Badge variant="secondary">Active</Badge>}
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleGenerate} className="flex-1 md:flex-none gap-2">
                <RefreshCw className="w-4 h-4" /> Generate Sitemaps
              </Button>
            </div>
          </div>

          {metadata && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Products Indexed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metadata.productCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Categories Indexed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metadata.categoryCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Pages Indexed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{metadata.pageCount}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Download className="w-5 h-5" /> Download Sitemaps
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={handleDownloadZip} className="bg-primary text-primary-foreground">
                Download All (ZIP)
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-200">
            <strong>Note:</strong> Sitemaps are generated statically and can be uploaded to your hosting root or served dynamically. Access your main index via <code>{typeof window !== 'undefined' ? window.location.origin : ''}/sitemap_index.xml</code>.
            <br/><br/>
            Sitemaps auto-update their metadata silently when you modify products or categories. <a href="#" onClick={(e) => { e.preventDefault(); handleGenerate(); }} className="underline font-bold text-blue-900">Regenerate</a>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSitemapGenerator;
