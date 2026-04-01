import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { premiumPresets, defaultAdvancedFooterSettings } from '@/lib/footerBuilder';

const FooterStylePresets = ({ currentPreset, onSelectPreset }) => {
  const presetsList = Object.values(premiumPresets);

  const handleSelect = (presetId) => {
    const selected = premiumPresets[presetId];
    onSelectPreset({
      ...defaultAdvancedFooterSettings,
      preset: presetId,
      design: { ...selected.design },
      sections: [...selected.sections],
      enabled: true
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {presetsList.map((preset) => (
        <Card
          key={preset.id}
          className={`cursor-pointer overflow-hidden transition-all border-2 ${currentPreset === preset.id ? 'border-primary shadow-md' : 'border-transparent hover:border-gray-300'}`}
          onClick={() => handleSelect(preset.id)}
        >
          <div
            className="h-24 w-full p-4 flex flex-col justify-between"
            style={{ backgroundColor: preset.design.bg, color: preset.design.text }}
          >
            <div className="flex gap-2">
              <div className="w-1/4 h-2 rounded opacity-50" style={{ backgroundColor: preset.design.accent || 'currentColor' }}></div>
              <div className="w-1/4 h-2 rounded bg-current opacity-50"></div>
              <div className="w-1/4 h-2 rounded bg-current opacity-50"></div>
              <div className="w-1/4 h-2 rounded bg-current opacity-50"></div>
            </div>
            <div className="flex justify-between items-center border-t pt-2 mt-auto" style={{ borderColor: preset.design.borderColor }}>
              <div className="w-1/3 h-1.5 rounded bg-current opacity-30"></div>
              <div className="w-1/4 h-1.5 rounded bg-current opacity-30"></div>
            </div>
          </div>
          <CardContent className="p-3 bg-white flex justify-between items-center">
            <span className="font-medium text-sm text-gray-900">{preset.name}</span>
            {currentPreset === preset.id && <Check className="w-4 h-4 text-primary" />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FooterStylePresets;