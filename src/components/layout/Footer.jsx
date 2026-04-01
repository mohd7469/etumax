import React from 'react';
import { Send, Facebook, Twitter, Instagram, Youtube, MapPin, Phone, Mail, Search, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useDesign } from '@/context/DesignContext';
import { useAppInit } from '@/context/AppInitContext';
import { Link } from 'react-router-dom';
import { applyFooterStyles } from '@/lib/footerBuilder';

const Footer = ({ navigateTo }) => {
  const { toast } = useToast();
  const { footerSettings, advancedFooterSettings } = useDesign();
  const { storeSettings } = useAppInit();

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    toast({ title: 'Subscribed! 🎉', description: 'Thanks for subscribing to our newsletter!' });
    e.target.reset();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = e.target.search.value;
    if (q) navigateTo('search', { query: q });
  };

  const policyLinks = (
    <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 text-xs opacity-80 mt-4 md:mt-0">
      <Link to="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
      <Link to="/terms-conditions" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link>
      <Link to="/refund-policy" className="hover:opacity-100 transition-opacity">Refund Policy</Link>
      <Link to="/contact" className="hover:opacity-100 transition-opacity">Contact US</Link>
      <Link to="/shipping-policy" className="hover:opacity-100 transition-opacity">Shipping Policy</Link>
      <Link to="/payment-policy" className="hover:opacity-100 transition-opacity">Payment Policy</Link>
    </div>
  );

  if (advancedFooterSettings && advancedFooterSettings.enabled) {
    const styles = applyFooterStyles(advancedFooterSettings.design);
    const sections = advancedFooterSettings.sections || [];
    const bb = advancedFooterSettings.bottomBar || {};

    const renderSection = (sec) => {
      const colClass = sec.fullWidth ? 'col-span-1 md:col-span-full' : `col-span-1 md:col-span-${sec.colSpan || 1}`;

      switch (sec.type) {
        case 'about':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <p className="custom-footer-text leading-relaxed">{sec.content}</p>
            </div>
          );
        case 'links':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <ul className="space-y-3">
                {(sec.links || []).map((l, i) => (
                  <li key={i}>
                    <Link to={l.url} className="custom-footer-text block hover:opacity-80 transition-opacity">
                      {l.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        case 'contact':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <ul className="space-y-4 custom-footer-text">
                {sec.address && <li className="flex items-start gap-3"><MapPin className="w-5 h-5 shrink-0" /> <span>{sec.address}</span></li>}
                {sec.phone && <li className="flex items-center gap-3"><Phone className="w-5 h-5 shrink-0" /> <span>{sec.phone}</span></li>}
                {sec.email && <li className="flex items-center gap-3"><Mail className="w-5 h-5 shrink-0" /> <span>{sec.email}</span></li>}
              </ul>
            </div>
          );
        case 'store':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <p className="custom-footer-text mb-4">{sec.content}</p>
              {sec.hours && <p className="custom-footer-text font-medium border-t border-white/10 pt-4">{sec.hours}</p>}
            </div>
          );
        case 'newsletter':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <p className="custom-footer-text mb-4">{sec.description}</p>
              <form onSubmit={handleNewsletterSubmit} className="flex w-full">
                <Input type="email" required placeholder="Your email address" className="rounded-r-none bg-white/5 border-white/20 text-current placeholder:text-current/50 focus-visible:ring-0" />
                <Button type="submit" className="rounded-l-none" style={{ backgroundColor: 'var(--footer-accent)', color: 'var(--footer-bg)' }}>
                  {sec.buttonText || <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          );
        case 'search':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <form onSubmit={handleSearch} className="flex w-full max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <Input name="search" required placeholder={sec.placeholder || "Search..."} className="pl-10 rounded-r-none bg-white/5 border-white/20 text-current placeholder:text-current/50 focus-visible:ring-0" />
                </div>
                <Button type="submit" className="rounded-l-none" style={{ backgroundColor: 'var(--footer-accent)', color: 'var(--footer-bg)' }}>
                  {sec.buttonText || 'Search'}
                </Button>
              </form>
            </div>
          );
        case 'badges':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <div className="flex flex-wrap gap-2">
                {(sec.badges || []).map((b, i) => (
                  <div key={i} className="flex items-center gap-2 border border-white/20 bg-white/5 px-3 py-1.5 rounded-md text-sm">
                    {b.imageUrl ? <img src={b.imageUrl} alt={b.text} className="h-6 w-auto" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                    <span>{b.text}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'payments':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <div className="flex flex-wrap gap-3">
                {sec.icons?.visa && <div className="px-2 py-1 bg-white rounded text-blue-900 font-bold text-xs">VISA</div>}
                {sec.icons?.mastercard && <div className="px-2 py-1 bg-white rounded text-red-600 font-bold text-xs">MC</div>}
                {sec.icons?.paypal && <div className="px-2 py-1 bg-white rounded text-blue-600 font-bold text-xs">PayPal</div>}
                {sec.icons?.amex && <div className="px-2 py-1 bg-white rounded text-blue-400 font-bold text-xs">AMEX</div>}
                {sec.icons?.applepay && <div className="px-2 py-1 bg-black text-white border border-gray-600 rounded font-bold text-xs">Pay</div>}
              </div>
            </div>
          );
        case 'map':
          return (
            <div key={sec.id} className={colClass}>
              <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
              <div className="w-full bg-gray-200 rounded overflow-hidden" style={{ height: `${sec.height || 200}px` }}>
                {sec.mapUrl ? (
                  <iframe title="map" src={sec.mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">Map Data Missing</div>
                )}
              </div>
            </div>
          );
        default: return null;
      }
    };

    const displayCopyright = bb.copyright || `© ${new Date().getFullYear()} ${storeSettings?.storeName || 'Store'}. All Rights Reserved.`;

    return (
      <footer className="custom-footer w-full" style={styles}>
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[var(--footer-gap)]">
            {sections.map(renderSection)}
          </div>
          {bb.show !== false && (
            <div className="custom-footer-bottom flex flex-col items-center md:items-start gap-4 text-center md:text-left">
              <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="custom-footer-text">{displayCopyright}</p>
                {bb.showSocial !== false && (
                  <div className="flex gap-4">
                    <a href="#" className="custom-footer-text hover:opacity-80 transition-opacity"><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="custom-footer-text hover:opacity-80 transition-opacity"><Twitter className="w-5 h-5" /></a>
                    <a href="#" className="custom-footer-text hover:opacity-80 transition-opacity"><Instagram className="w-5 h-5" /></a>
                  </div>
                )}
              </div>
              <div className="w-full pt-2 custom-footer-text border-t border-white/5">
                {policyLinks}
              </div>
            </div>
          )}
        </div>
      </footer>
    );
  }

  const displayLogoText = footerSettings.logoText || storeSettings?.storeName || 'Store';
  const displayCopyrightText = footerSettings.copyrightText || `© ${new Date().getFullYear()} ${storeSettings?.storeName || 'Store'}. All Rights Reserved.`;
  const socialIcons = { facebook: <Facebook className="h-5 w-5" />, twitter: <Twitter className="h-5 w-5" />, instagram: <Instagram className="h-5 w-5" />, youtube: <Youtube className="h-5 w-5" /> };

  return (
    <footer style={{ backgroundColor: footerSettings.backgroundColor, color: footerSettings.textColor }} className="pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4 lg:col-span-1">
            <h3 className="text-2xl font-bold">{displayLogoText}</h3>
            <p style={{ color: footerSettings.linkColor }}>{footerSettings.aboutText}</p>
            <div className="flex space-x-4">
              {footerSettings.showSocialIcons && footerSettings.socialLinks.map((social) => (
                social.url && (
                  <a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" style={{ color: footerSettings.textColor }}>
                    {socialIcons[social.platform]}
                  </a>
                )
              ))}
            </div>
          </div>

          {footerSettings.linkColumns.map((column, index) => (
            <div key={index} className="space-y-4">
              <p className="font-semibold uppercase tracking-wider">{column.title}</p>
              <ul className="space-y-2">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.url} style={{ color: footerSettings.linkColor }} className="hover:opacity-80 transition-opacity">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {footerSettings.showNewsletter && (
            <div className="space-y-4 lg:col-span-1">
              <p className="font-semibold uppercase tracking-wider">Stay up to date</p>
              <form onSubmit={handleNewsletterSubmit} className="flex">
                <Input type="email" placeholder="Enter your email" required className="flex-grow rounded-l-md border-0 focus:ring-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: footerSettings.textColor }} />
                <Button type="submit" size="icon" className="rounded-r-md bg-purple-600 hover:bg-purple-700"><Send className="h-5 w-5" /></Button>
              </form>
              <Link to={'/track-order'} style={{ color: footerSettings.linkColor }} className="hover:opacity-80 transition-opacity mt-4 block">Track Your Order</Link>
            </div>
          )}
        </div>
        
        <div className="mt-12 pt-8 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-center md:text-left" style={{ color: footerSettings.linkColor }}>{displayCopyrightText}</p>
            {policyLinks}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;