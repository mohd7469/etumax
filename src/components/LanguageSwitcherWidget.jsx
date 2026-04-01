
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { allLanguages } from '@/lib/languages';
import { Globe, Loader2, Check } from 'lucide-react';
import { translateToLanguage, isTranslating } from '@/lib/GoogleTranslateManager';
import { cn } from '@/lib/utils';

const LanguageSwitcherWidget = ({ inline = false, customColor }) => {
  const { languageSettings, selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (languageSettings?.enabled && Array.isArray(languageSettings?.availableLanguages)) {
      const languagesToShow = allLanguages.filter((l) =>
        languageSettings.availableLanguages.includes(l.code)
      );
      setAvailableLanguages(languagesToShow?.length > 0 ? languagesToShow : allLanguages);
    } else {
      setAvailableLanguages(allLanguages);
    }
  }, [languageSettings]);

  const normalize = (code) => (code || '').toLowerCase().replace('_', '-');
  const selectedNorm = normalize(selectedLanguage || 'en');

  const currentLangObj = useMemo(() => {
    const fromAvailable =
      availableLanguages?.find((l) => normalize(l?.code) === selectedNorm) ||
      availableLanguages?.find((l) => normalize(l?.code)?.startsWith(selectedNorm)) ||
      availableLanguages?.[0];

    return (
      fromAvailable ||
      allLanguages?.find((l) => normalize(l?.code) === selectedNorm) ||
      allLanguages?.find((l) => normalize(l?.code)?.startsWith(selectedNorm)) ||
      allLanguages[0]
    );
  }, [availableLanguages, selectedNorm]);

  const changeLanguage = useCallback(
    async (langCode) => {
      if (isLoading || isTranslating()) return;
      
      setIsLoading(true);
      await translateToLanguage(langCode);
      setSelectedLanguage(langCode);
      setIsLoading(false);
      setIsOpen(false);
    },
    [setSelectedLanguage, isLoading]
  );

  if (!languageSettings?.enabled && !inline) {
    return null;
  }

  if (availableLanguages.length <= 1) {
    return null;
  }

  const renderFlag = (flag) => {
    if (!flag) return <Globe className="w-5 h-5" />;
    return <span className="text-xl leading-none select-none drop-shadow-sm">{flag}</span>;
  };

  const getWidgetTriggerContent = (lang) => {
    const showFlags = languageSettings?.showFlags ?? true;
    const showNames = languageSettings?.showNames ?? true;

    if (inline) {
      return (
        <span className="flex items-center gap-1.5" style={{ color: customColor }}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {showFlags ? renderFlag(lang?.flag) : <Globe className="w-5 h-5" />}
              {showNames && (
                <span className="text-sm font-medium uppercase tracking-wider">
                  {lang?.code?.substring(0, 3)}
                </span>
              )}
            </>
          )}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2.5">
        {showFlags && renderFlag(lang?.flag)}
        {showNames && (
          <span className="font-medium text-sm">
            {lang?.nativeName || lang?.name || 'Language'}
          </span>
        )}
        {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-1 opacity-60" />}
      </span>
    );
  };

  const renderDropdownItem = (lang) => {
    const isSelected = normalize(lang.code) === selectedNorm;
    
    return (
      <button
        type="button"
        role="menuitem"
        disabled={isLoading}
        onClick={() => changeLanguage(lang.code)}
        className={cn(
          "w-full text-left px-4 py-2.5 transition-all flex items-center gap-3 group relative rounded-md",
          isSelected 
            ? "bg-primary/10 text-primary font-semibold" 
            : "hover:bg-accent hover:text-accent-foreground text-foreground",
          isLoading ? "cursor-wait opacity-50" : "cursor-pointer"
        )}
      >
        <span className="flex items-center justify-center w-8 h-8 shrink-0 transition-transform group-hover:scale-110">
          {renderFlag(lang.flag)}
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm">{lang.name}</span>
          {lang.nativeName && (
            <span className={cn("text-xs mt-0.5", isSelected ? "text-primary/80" : "text-muted-foreground")}>
              {lang.nativeName}
            </span>
          )}
        </div>
        {isSelected && (
          <Check className="w-4 h-4 ml-auto text-primary" />
        )}
      </button>
    );
  };

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const position = languageSettings?.position || 'bottom-right';
  const widgetStyle = languageSettings?.widgetStyle || 'dropdown';
  const dropdownDirection = position?.startsWith('top') ? 'top-full mt-2' : 'bottom-full mb-2';

  if (inline) {
    return (
      <div className="relative inline-block" ref={dropdownRef}>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setIsOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
            isOpen ? "bg-accent text-accent-foreground" : "hover:bg-accent/50 text-foreground",
            isLoading && "opacity-50 cursor-wait"
          )}
          aria-label="Select Language"
          aria-expanded={isOpen}
        >
          {getWidgetTriggerContent(currentLangObj)}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute top-full right-0 mt-2 w-56 max-h-[70vh] overflow-y-auto bg-popover text-popover-foreground rounded-xl shadow-2xl border border-border z-[100] scrollbar-hide p-1.5"
              role="menu"
            >
              {availableLanguages.map((lang) => (
                <li key={lang.code} role="presentation">
                  {renderDropdownItem(lang)}
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("fixed z-[100]", positionClasses[position])} ref={dropdownRef}>
      {widgetStyle === 'dropdown' ? (
        <div className="relative">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => setIsOpen((v) => !v)}
            aria-label="Change Language"
            className={cn(
              "flex items-center gap-2 bg-background/95 text-foreground backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-border transition-all min-h-[48px]",
              isLoading ? "opacity-70 cursor-wait" : "hover:bg-background hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {getWidgetTriggerContent(currentLangObj)}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.ul
                initial={{ opacity: 0, y: position?.startsWith('top') ? -10 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: position?.startsWith('top') ? -10 : 10 }}
                className={cn(
                  "absolute w-60 max-h-[70vh] overflow-y-auto bg-popover text-popover-foreground rounded-2xl shadow-2xl border border-border scrollbar-hide p-2",
                  dropdownDirection,
                  position?.includes('right') ? 'right-0' : 'left-0'
                )}
                role="menu"
              >
                <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                  Select Language
                </div>
                {availableLanguages.map((lang) => (
                  <li key={lang.code} role="presentation">
                    {renderDropdownItem(lang)}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 bg-background/90 text-foreground backdrop-blur-md p-2 rounded-3xl shadow-xl border border-border max-w-sm justify-center">
          {availableLanguages.map((lang) => (
            <button
              type="button"
              key={lang.code}
              disabled={isLoading}
              onClick={() => changeLanguage(lang.code)}
              className={cn(
                "px-3 py-2 rounded-2xl transition-all flex items-center gap-2",
                normalize(lang.code) === selectedNorm 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-accent text-foreground",
                isLoading && "opacity-50 cursor-wait"
              )}
              title={lang.name}
            >
              {renderFlag(lang.flag)}
              <span className="text-sm font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcherWidget;
