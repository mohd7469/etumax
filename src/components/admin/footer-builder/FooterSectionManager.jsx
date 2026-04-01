import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Plus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ContactSectionEditor from './ContactSectionEditor';
import StoreSectionEditor from './StoreSectionEditor';
import MapSectionEditor from './MapSectionEditor';
import NewsletterSectionEditor from './NewsletterSectionEditor';
import SearchSectionEditor from './SearchSectionEditor';
import BadgeSectionEditor from './BadgeSectionEditor';
import PaymentIconsSectionEditor from './PaymentIconsSectionEditor';
import { Input } from '@/components/ui/input';

const FooterSectionManager = ({ settings, onUpdateSettings }) => {
  const [editingId, setEditingId] = useState(null);

  const sections = settings.sections || [];

  const handleUpdateSection = (id, newSectionData) => {
    onUpdateSettings({
      ...settings,
      sections: sections.map(s => s.id === id ? newSectionData : s)
    });
  };

  const handleMoveSection = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === sections.length - 1)) return;
    const newSections = [...sections];
    const temp = newSections[index];
    newSections[index] = newSections[index + direction];
    newSections[index + direction] = temp;
    onUpdateSettings({ ...settings, sections: newSections });
  };

  const handleDeleteSection = (id) => {
    onUpdateSettings({
      ...settings,
      sections: sections.filter(s => s.id !== id)
    });
  };

  const handleAddSection = () => {
    const newId = `sec_${Date.now()}`;
    onUpdateSettings({
      ...settings,
      sections: [...sections, { id: newId, type: 'links', title: 'New Links', colSpan: 1, links: [] }]
    });
    setEditingId(newId);
  };

  const renderEditor = (section) => {
    switch (section.type) {
      case 'contact': return <ContactSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'store': return <StoreSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'map': return <MapSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'newsletter': return <NewsletterSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'search': return <SearchSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'badges': return <BadgeSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'payments': return <PaymentIconsSectionEditor section={section} onChange={(d) => handleUpdateSection(section.id, d)} />;
      case 'about': return (
        <div className="mt-4 p-4 border rounded bg-gray-50 space-y-4">
          <Input value={section.title || ''} onChange={(e) => handleUpdateSection(section.id, { ...section, title: e.target.value })} placeholder="Title" />
          <textarea className="w-full p-2 border rounded" rows={3} value={section.content || ''} onChange={(e) => handleUpdateSection(section.id, { ...section, content: e.target.value })} placeholder="Description..." />
        </div>
      );
      case 'links': return (
        <div className="mt-4 p-4 border rounded bg-gray-50 space-y-4">
          <Input value={section.title || ''} onChange={(e) => handleUpdateSection(section.id, { ...section, title: e.target.value })} placeholder="Title" />
          <div className="space-y-2">
            {(section.links || []).map((link, i) => (
              <div key={i} className="flex gap-2">
                <Input value={link.text} onChange={(e) => {
                  const nl = [...(section.links || [])]; nl[i].text = e.target.value; handleUpdateSection(section.id, { ...section, links: nl });
                }} placeholder="Link text" />
                <Input value={link.url} onChange={(e) => {
                  const nl = [...(section.links || [])]; nl[i].url = e.target.value; handleUpdateSection(section.id, { ...section, links: nl });
                }} placeholder="URL" />
                <Button variant="ghost" size="icon" onClick={() => {
                  const nl = section.links.filter((_, idx) => idx !== i); handleUpdateSection(section.id, { ...section, links: nl });
                }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => handleUpdateSection(section.id, { ...section, links: [...(section.links || []), { text: 'New', url: '#' }] })}>+ Add Link</Button>
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={section.id} className="overflow-hidden">
          <div className="flex items-center p-3 bg-white hover:bg-gray-50">
            <div className="flex-1 flex items-center gap-3">
              <Select value={section.type} onValueChange={(v) => handleUpdateSection(section.id, { ...section, type: v })}>
                <SelectTrigger className="w-[140px] h-8 text-xs font-medium"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="about">About / Text</SelectItem>
                  <SelectItem value="links">Links List</SelectItem>
                  <SelectItem value="contact">Contact Info</SelectItem>
                  <SelectItem value="store">Store Info</SelectItem>
                  <SelectItem value="map">Google Maps</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="search">Search Bar</SelectItem>
                  <SelectItem value="badges">Badges</SelectItem>
                  <SelectItem value="payments">Payment Icons</SelectItem>
                </SelectContent>
              </Select>
              <span className="font-semibold text-sm truncate">{section.title || 'Untitled Section'}</span>
              <span className="text-xs text-gray-500 border px-2 rounded-full">Col Span: {section.colSpan || 1}</span>
            </div>

            <div className="flex items-center gap-1">
              <div className="flex flex-col mr-2">
                <button disabled={index === 0} onClick={() => handleMoveSection(index, -1)} className="text-gray-400 hover:text-black disabled:opacity-30"><ChevronUp className="w-4 h-4" /></button>
                <button disabled={index === sections.length - 1} onClick={() => handleMoveSection(index, 1)} className="text-gray-400 hover:text-black disabled:opacity-30"><ChevronDown className="w-4 h-4" /></button>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingId(editingId === section.id ? null : section.id)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteSection(section.id)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          </div>

          {editingId === section.id && (
            <CardContent className="border-t bg-gray-50 p-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium">Column Span (Width):</label>
                <Select value={String(section.colSpan || 1)} onValueChange={(v) => handleUpdateSection(section.id, { ...section, colSpan: parseInt(v) })}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map(n => <SelectItem key={n} value={String(n)}>{n} Column{n > 1 ? 's' : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id={`fw-${section.id}`} checked={section.fullWidth || false} onChange={e => handleUpdateSection(section.id, { ...section, fullWidth: e.target.checked })} />
                  <label htmlFor={`fw-${section.id}`} className="text-sm font-medium">Full Width Row</label>
                </div>
              </div>
              {renderEditor(section)}
            </CardContent>
          )}
        </Card>
      ))}

      <Button onClick={handleAddSection} className="w-full border-dashed" variant="outline">
        <Plus className="w-4 h-4 mr-2" /> Add Footer Section
      </Button>
    </div>
  );
};

export default FooterSectionManager;