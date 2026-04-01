
import { useState, useEffect } from 'react';
import { listenToDocument } from '@/lib/firestoreService';
import { policyStarterContent } from '@/lib/policyStarterContent';

export const usePolicyPage = (slug) => {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to the specific policy document
    const unsubscribe = listenToDocument('pages', `policy-${slug}`, (data) => {
      if (data) {
        setPage(data);
      } else {
        // Fallback to starter content if not found in database
        setPage({
          ...policyStarterContent[slug],
          slug,
          status: 'publish'
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [slug]);

  return { page, loading };
};
