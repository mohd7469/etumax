import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { premiumHeaderPresets, defaultAdvancedHeaderSettings } from '@/lib/headerBuilder';

const HeaderStylePresets = ({ currentPreset, onSelectPreset }) => {
  const presetsList = Object.values(premiumHeaderPresets);

  const handleSelect = (presetId) => {
    const selected = premiumHeaderPresets[presetId];
    onSelectPreset({
      ...defaultAdvancedHeaderSettings,
      preset: presetId,
      design: { ...selected.design },
      topBar: { ...selected.topBar },
      logo: { ...selected.logo },
      search: { ...selected.search },
      nav: { ...selected.nav },
      icons: { ...selected.icons },
      elements: [...selected.elements],
      enabled: true
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {presetsList.map((preset) => (
        <Card
          key={preset.id}
          className={`cursor-pointer overflow-hidden transition-all border-2 ${currentPreset === preset.id ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300'}`}
          onClick={() => handleSelect(preset.id)}
        >
          <div className="w-full flex flex-col bg-gray-100 h-24">
            {preset.topBar.show && (
              <div className="h-2 w-full" style={{ backgroundColor: preset.topBar.bg }}></div>
            )}
            <div
              className="flex-1 flex items-center px-4"
              style={{
                backgroundColor: preset.design.bg,
                color: preset.design.text,
                borderBottom: `1px solid ${preset.design.border}`,
                gap: preset.design.gap
              }}
            >
              {preset.elements.map((el, i) => {
                if (el === 'logo') return <div key={i} className="font-bold text-[10px]" style={{ flex: preset.logo.align === 'center' ? '1' : 'none', textAlign: preset.logo.align }}>{preset.logo.text}</div>;
                if (el === 'search' && preset.search.show) return <div key={i} className={`h-4 border rounded ${preset.search.width === 'full' ? 'flex-1' : 'w-16'}`} style={{ borderColor: preset.design.border }}></div>;
                if (el === 'nav') return <div key={i} className="flex gap-2" style={{ flex: preset.nav.align === 'center' ? '1' : 'none', justifyContent: preset.nav.align === 'center' ? 'center' : 'flex-start' }}><div className="h-1 w-4 bg-current opacity-50"></div><div className="h-1 w-4 bg-current opacity-50"></div></div>;
                if (el === 'icons') return <div key={i} className="flex gap-1 ml-auto"><div className="h-3 w-3 rounded-full bg-current opacity-60"></div><div className="h-3 w-3 rounded-full bg-current opacity-60"></div></div>;
                return null;
              })}
            </div>
          </div>
          <CardContent className="p-3 bg-white flex justify-between items-center">
            <span className="font-medium text-xs text-gray-900">{preset.name}</span>
            {currentPreset === preset.id && <Check className="w-4 h-4 text-primary" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HeaderStylePresets;