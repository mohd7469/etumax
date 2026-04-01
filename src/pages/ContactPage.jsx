import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Mail, Phone, MapPin, Sparkles } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfoCards from '@/components/contact/ContactInfoCards';
import { listenToDocument } from '@/lib/firestoreService';

const fallbackSettings = {
  heading: 'Get in Touch',
  subtitle:
    "We'd love to hear from you. Send us your question and our team will get back to you.",
  cards: {
    phone: { enabled: true, title: 'Phone', value: '+1 (555) 123-4567', order: 1 },
    whatsapp: { enabled: true, title: 'WhatsApp', value: '+1 (555) 987-6543', order: 2 },
    email: { enabled: true, title: 'Email', value: 'support@example.com', order: 3 },
    address: {
      enabled: true,
      title: 'Address',
      value: '123 Commerce St, Suite 100\nNew York, NY 10001',
      order: 4,
    },
  },
};

const quickHighlights = [
  {
    icon: Phone,
    title: 'Fast Response',
    text: 'Our support team is ready to help you quickly.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Support',
    text: 'Chat with us easily for instant assistance.',
  },
  {
    icon: Mail,
    title: 'Reliable Communication',
    text: 'Email us anytime for product and order queries.',
  },
];

const ContactPage = () => {
  const [pageSettings, setPageSettings] = useState(fallbackSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToDocument('settings', 'contactPageSettings', (data) => {
      if (data) {
        setPageSettings({
          heading: data.heading || fallbackSettings.heading,
          subtitle: data.subtitle || fallbackSettings.subtitle,
          cards: data.cards || fallbackSettings.cards,
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{pageSettings.heading} - Store</title>
        <meta name="description" content={pageSettings.subtitle} />
      </Helmet>

      {/* Compact Hero Section */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="absolute inset-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1681917800123-e9a2bcd9c46c?auto=format&fit=crop&q=80&w=2000"
            alt="Contact Us Background"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4 py-10 md:px-6 md:py-14 lg:py-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4" />
              Contact Us
            </div>

            <h1 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl lg:text-5xl">
              {pageSettings.heading}
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
              {pageSettings.subtitle}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickHighlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="rounded-xl border border-border/60 bg-background/80 p-4 text-left shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground md:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground md:text-sm">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-10 md:px-6 md:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-10">
          {/* Left Column */}
          <div className="lg:col-span-5">
            <div className="overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div className="border-b border-border/60 bg-gradient-to-r from-primary/8 via-primary/5 to-transparent px-5 py-5 md:px-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground md:text-2xl">
                  Contact Information
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Reach us through your preferred channel. We’re here to help with
                  orders, support, and general inquiries.
                </p>
              </div>

              <div className="p-4 md:p-5">
                {!loading ? (
                  <div className="[&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-4 sm:[&>div]:grid-cols-2">
                    <ContactInfoCards settingsCards={pageSettings.cards} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-pulse">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-32 rounded-2xl border border-border/50 bg-muted/60"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-[24px] border border-border/60 bg-card shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
              <div className="border-b border-border/60 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-5 py-5 md:px-6">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-foreground md:text-2xl">
                  Send a Message
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Fill out the form below and our team will get back to you as soon as
                  possible.
                </p>
              </div>

              <div className="p-4 md:p-5 lg:p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;