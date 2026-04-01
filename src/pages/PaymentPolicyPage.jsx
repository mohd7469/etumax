import React from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { usePolicyPage } from '@/hooks/usePolicyPage';
import { Loader2 } from 'lucide-react';

const PaymentPolicyPage = () => {
  const { page, loading } = usePolicyPage('payment-policy');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const cleanContent = DOMPurify.sanitize(page?.content || '');

  return (
    <div className="min-h-screen bg-background pt-12 pb-24">
      <Helmet>
        <title>{page?.title || 'Payment Policy'} - Store</title>
        <meta name="description" content="Information regarding accepted payment methods and secure transactions." />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-border p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-8 pb-4 border-b border-border">
            {page?.title || 'Payment Policy'}
          </h1>
          
          <div 
            className="policy-content"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentPolicyPage;