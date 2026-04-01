
import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import DOMPurify from 'dompurify';

const iconMap = {
  phone: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  address: MapPin,
  workingHours: Clock
};

const ContactInfoCards = ({ settingsCards = {} }) => {
  // Convert cards object to array, filter enabled, sort by order
  const displayCards = Object.entries(settingsCards)
    .map(([key, data]) => ({
      id: key,
      ...data
    }))
    .filter(card => card.enabled)
    .sort((a, b) => a.order - b.order);

  const getLink = (id, value) => {
    if (!value) return null;
    // Strip HTML before generating automatic links to prevent broken URLs
    const plainText = value.replace(/<[^>]*>/g, '');
    if (id === 'phone') return `tel:${plainText.replace(/[^\d+]/g, '')}`;
    if (id === 'whatsapp') return `https://wa.me/${plainText.replace(/[^\d+]/g, '')}`;
    if (id === 'email') return `mailto:${plainText.trim()}`;
    return null;
  };

  if (displayCards.length === 0) {
    return null; // Return nothing if all cards are disabled
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayCards.map((card) => {
        const IconComponent = iconMap[card.id] || Phone; // fallback icon
        const link = getLink(card.id, card.value);
        
        // Sanitize incoming HTML while preserving allowed tags
        const sanitizedHTML = DOMPurify.sanitize(card.value || '', {
          ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'br', 'a', 'p', 'span', 'u', 's'],
          ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style']
        });

        // Check if the user already provided their own <a> tag to avoid nesting anchors
        const hasAnchorTag = /<a[\s>]/i.test(card.value || '');

        return (
          <div key={card.id} className="contact-card flex flex-col items-center text-center p-6 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <IconComponent className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            {link && !hasAnchorTag ? (
              <a 
                href={link} 
                className="text-muted-foreground hover:text-primary transition-colors whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            ) : (
              <div 
                className="text-muted-foreground whitespace-pre-line [&_a]:text-primary [&_a]:hover:underline [&_a]:transition-colors"
                dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContactInfoCards;
