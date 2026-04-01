import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const BadgeSectionEditor = ({ section, onChange }) => {
  const badges = section.badges || [];

  const updateBadge = (index, key, value) => {
    const newBadges = [...badges];
    newBadges[index][key] = value;
    onChange({ ...section, badges: newBadges });
  };

  const addBadge = () => {
    onChange({ ...section, badges: [...badges, { text: 'New Badge', imageUrl: '' }] });
  };

  const removeBadge = (index) => {
    onChange({ ...section, badges: badges.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 mt-4 p-4 border rounded-md bg-gray-50">
      <div className="space-y-2">
        <Label>Section Title</Label>
        <Input 
          value={section.title || ''} 
          onChange={(e) => onChange({ ...section, title: e.target.value })} 
        />
      </div>
      <div className="space-y-4">
        <Label>Badges / Certifications</Label>
        {badges.map((badge, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Input 
              placeholder="Badge Text" 
              value={badge.text || ''} 
              onChange={(e) => updateBadge(i, 'text', e.target.value)} 
            />
            <Input 
              placeholder="Image URL (optional)" 
              value={badge.imageUrl || ''} 
              onChange={(e) => updateBadge(i, 'imageUrl', e.target.value)} 
            />
            <Button variant="ghost" size="icon" onClick={() => removeBadge(i)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addBadge}>+ Add Badge</Button>
      </div>
    </div>
  );
};

export default BadgeSectionEditor;