import React from 'react';
import { applyFooterStyles } from '@/lib/footerBuilder';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Send, Search, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const FooterLivePreview = ({ settings, deviceView }) => {
  const styles = applyFooterStyles(settings.design);

  const getContainerClass = () => {
    switch (deviceView) {
      case 'mobile': return 'w-[375px] mx-auto border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300';
      case 'tablet': return 'w-[768px] mx-auto border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300';
      default: return 'w-full border shadow-xl rounded-b-lg overflow-hidden transition-all duration-300';
    }
  };

  const getGridClass = () => {
    if (deviceView === 'mobile') return 'grid-cols-1';
    if (deviceView === 'tablet') return 'grid-cols-2';
    return 'md:grid-cols-4'; // Desktop default base, colSpans override
  };

  const renderSection = (sec) => {
    const colSpanClass = deviceView === 'desktop' && sec.colSpan ? `md:col-span-${sec.colSpan}` : '';
    const fullWidth = sec.fullWidth ? 'col-span-full' : colSpanClass;

    switch (sec.type) {
      case 'about':
        return (
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <p className="custom-footer-text leading-relaxed">{sec.content}</p>
          </div>
        );
      case 'links':
        return (
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <ul className="space-y-3">
              {(sec.links || []).map((l, i) => (
                <li key={i}><a href={l.url} className="custom-footer-text block" onClick={e => e.preventDefault()}>{l.text}</a></li>
              ))}
            </ul>
          </div>
        );
      case 'contact':
        return (
          <div key={sec.id} className={fullWidth}>
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
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <p className="custom-footer-text mb-4">{sec.content}</p>
            {sec.hours && <p className="custom-footer-text font-medium border-t border-white/10 pt-4">{sec.hours}</p>}
          </div>
        );
      case 'newsletter':
        return (
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <p className="custom-footer-text mb-4">{sec.description}</p>
            <div className="flex w-full">
              <Input placeholder="Your email address" className="rounded-r-none bg-white/5 border-white/20 text-current placeholder:text-current/50 focus-visible:ring-0" />
              <Button className="rounded-l-none" style={{ backgroundColor: 'var(--footer-accent)', color: 'var(--footer-bg)' }}>
                {sec.buttonText || <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        );
      case 'search':
        return (
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <div className="flex w-full max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <Input placeholder={sec.placeholder || "Search..."} className="pl-10 rounded-r-none bg-white/5 border-white/20 text-current placeholder:text-current/50 focus-visible:ring-0" />
              </div>
              <Button className="rounded-l-none" style={{ backgroundColor: 'var(--footer-accent)', color: 'var(--footer-bg)' }}>
                {sec.buttonText || 'Search'}
              </Button>
            </div>
          </div>
        );
      case 'badges':
        return (
          <div key={sec.id} className={fullWidth}>
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
          <div key={sec.id} className={fullWidth}>
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
          <div key={sec.id} className={fullWidth}>
            <h4 className="custom-footer-title" style={{ color: 'var(--footer-accent)' }}>{sec.title}</h4>
            <div className="w-full bg-gray-200 rounded overflow-hidden" style={{ height: `${sec.height || 200}px` }}>
              {sec.mapUrl ? (
                <iframe title="map" src={sec.mapUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm bg-black/10">Map Preview Placeholder</div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-100 p-8 min-h-[600px] flex items-center justify-center overflow-auto rounded-lg">
      <div className={getContainerClass()} style={styles}>
        <footer className="custom-footer w-full">
          <div className="container mx-auto px-6">
            <div className={`grid gap-[var(--footer-gap)] ${getGridClass()}`}>
              {(settings.sections || []).map(renderSection)}
            </div>

            {settings.bottomBar?.show !== false && (
              <div className="custom-footer-bottom flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="custom-footer-text">{settings.bottomBar?.copyright}</p>
                {settings.bottomBar?.showSocial !== false && (
                  <div className="flex gap-4">
                    <a href="#" className="custom-footer-text hover:opacity-80" onClick={e => e.preventDefault()}><Facebook className="w-5 h-5" /></a>
                    <a href="#" className="custom-footer-text hover:opacity-80" onClick={e => e.preventDefault()}><Twitter className="w-5 h-5" /></a>
                    <a href="#" className="custom-footer-text hover:opacity-80" onClick={e => e.preventDefault()}><Instagram className="w-5 h-5" /></a>
                  </div>
                )}
              </div>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FooterLivePreview;