import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { queryDocuments } from '@/lib/firestoreService';
import { FileText, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

const DynamicPage = ({ slug }) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      console.log(`[DynamicPage] Attempting to load page with slug: ${slug}`);
      try {
        // 1. First check local storage for manually created pages
        const savedPages = localStorage.getItem('shophub_local_pages');
        if (savedPages) {
          const localPages = JSON.parse(savedPages);
          const foundLocal = localPages.find(p => p.slug === slug);
          if (foundLocal) {
            console.log(`[DynamicPage] Found page in local storage`);
            setPage(foundLocal);
            setLoading(false);
            return;
          }
        }

        // 2. If not found locally, query Firestore for WooCommerce synced pages
        console.log(`[DynamicPage] Querying Firestore for synced page...`);
        const docs = await queryDocuments('pages', [
          { field: 'slug', operator: '==', value: slug }
        ]);

        if (docs && docs.length > 0) {
          console.log(`[DynamicPage] Found page in Firestore`);
          setPage(docs[0]);
        } else {
          console.log(`[DynamicPage] Page not found in any source`);
          setPage(null);
        }
      } catch (error) {
        console.error('[DynamicPage] Error fetching page:', error);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground space-y-4 w-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
        <p>Loading page content...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 w-full">
        <FileText className="w-16 h-16 text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you are looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Sanitize HTML but allow formatting tags and structure
  const sanitizedContent = page.content 
    ? DOMPurify.sanitize(page.content, {
        ADD_TAGS: ['iframe', 'style', 'script'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling']
      }) 
    : '<p>No content available.</p>';

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={`Learn more about ${page.title} on our site.`} />
      </Helmet>
      
      {/* Full width container without constraints */}
      <div className="w-full min-h-screen bg-background">
        <div 
          className="dynamic-html-content w-full"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
        />
      </div>
    </>
  );
};

export default DynamicPage;