import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, Plus, GripVertical, Trash2, Edit, X, Code, FileText, Map } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCheckout } from '@/context/CheckoutContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemType = 'FIELD';

const DraggableField = ({ field, index, moveField, openEditModal, removeField, toggleFieldEnabled }) => {
  const ref = React.useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemType,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) {
        return;
      }
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => ({ id: field.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <li
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId}
      className="flex items-center justify-between p-2 bg-white rounded-lg border"
    >
      <div className="flex items-center gap-3 flex-grow">
        <div ref={preview} className="cursor-grab p-1">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        {field.id.startsWith('custom') ? <Code className="h-4 w-4 text-gray-500" /> : <FileText className="h-4 w-4 text-gray-500" />}
        <span className="font-medium flex-grow">{field.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={field.enabled} onCheckedChange={(checked) => toggleFieldEnabled(field.id, checked)} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:bg-gray-100" onClick={() => openEditModal(field)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeField(field.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  );
};

const EditFieldModal = ({ field, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState(null);
  const [optionsString, setOptionsString] = useState('');

  useEffect(() => {
    if (field) {
      setFormData(field);
      if (['dropdown', 'radio', 'checkbox'].includes(field.type) && Array.isArray(field.options)) {
        setOptionsString(field.options.map(opt => opt.label).join(','));
      } else {
        setOptionsString('');
      }
    } else {
      setFormData(null);
    }
  }, [field]);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleOptionsChange = (e) => {
    setOptionsString(e.target.value);
  };

  const handleSave = () => {
    let finalData = { ...formData };
    if (['dropdown', 'radio'].includes(finalData.type)) {
      finalData.options = optionsString.split(',').map(opt => opt.trim()).filter(Boolean).map(opt => ({ value: opt.toLowerCase().replace(/\s+/g, '-'), label: opt }));
    }
    onSave(finalData);
    onClose();
  };

  if (!isOpen || !formData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold">Edit Field</h2>
              <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type || ''} onValueChange={v => handleChange('type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="password">Password</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="tel">Phone</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="dropdown">Dropdown</SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                      <SelectItem value="checkbox">Checkbox</SelectItem>
                      <SelectItem value="html">HTML Block</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Name</Label>
                  <Input value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} placeholder="field_name" />
                </div>
                <div>
                  <Label>Label</Label>
                  <Input value={formData.label || ''} onChange={e => handleChange('label', e.target.value)} placeholder="Field Label" />
                </div>
                <div>
                  <Label>Placeholder</Label>
                  <Input value={formData.placeholder || ''} onChange={e => handleChange('placeholder', e.target.value)} placeholder="Placeholder Text" />
                </div>
                <div>
                  <Label>Default Value</Label>
                  <Input value={formData.defaultValue || ''} onChange={e => handleChange('defaultValue', e.target.value)} placeholder="Default Value" />
                </div>
                <div>
                  <Label>Class</Label>
                  <Input value={formData.class || ''} onChange={e => handleChange('class', e.target.value)} placeholder="form-row-wide" />
                </div>
                <div className="md:col-span-2">
                  <Label>Validation</Label>
                  <Input value={(formData.validation || []).join(',')} onChange={e => handleChange('validation', e.target.value.split(',').map(s => s.trim()))} placeholder="e.g., email, phone" />
                </div>
                {['dropdown', 'radio'].includes(formData.type) && (
                  <div className="md:col-span-2">
                    <Label>Options</Label>
                    <Input value={optionsString} onChange={handleOptionsChange} placeholder="Comma-separated values, e.g. Option 1, Option 2" />
                  </div>
                )}
                {formData.type === 'html' && (
                  <div className="md:col-span-2">
                    <Label>HTML Content</Label>
                    <Textarea value={formData.htmlContent || ''} onChange={e => handleChange('htmlContent', e.target.value)} placeholder="Enter your custom HTML here" rows={6} />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Checkbox id="required" checked={formData.required || false} onCheckedChange={v => handleChange('required', v)} />
                  <Label htmlFor="required">Required</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="enabled" checked={formData.enabled || false} onCheckedChange={v => handleChange('enabled', v)} />
                  <Label htmlFor="enabled">Enabled</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="displayInEmails" checked={formData.displayInEmails || false} onCheckedChange={v => handleChange('displayInEmails', v)} />
                  <Label htmlFor="displayInEmails">Display in Emails</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="displayInOrderDetails" checked={formData.displayInOrderDetails || false} onCheckedChange={v => handleChange('displayInOrderDetails', v)} />
                  <Label htmlFor="displayInOrderDetails">Display in Order Detail Pages</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <Button variant="ghost" onClick={onClose} className="mr-2">Cancel</Button>
              <Button onClick={handleSave}>Save & Close</Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const AdminCheckout = () => {
  const { toast } = useToast();
  const { settings, saveSettings } = useCheckout();
  const [localSettings, setLocalSettings] = useState(JSON.parse(JSON.stringify(settings)));
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    setLocalSettings(JSON.parse(JSON.stringify(settings)));
  }, [settings]);

  const handleSave = () => {
    saveSettings(localSettings);
    toast({
      title: "Settings Saved! ✅",
      description: "Your checkout changes have been successfully saved.",
    });
  };

  const handleFieldChange = (updatedField) => {
    const updatedFields = localSettings.checkoutFields.map(field =>
      field.id === updatedField.id ? updatedField : field
    );
    setLocalSettings(prev => ({ ...prev, checkoutFields: updatedFields }));
  };

  const toggleFieldEnabled = (fieldId, checked) => {
    const updatedFields = localSettings.checkoutFields.map(field =>
      field.id === fieldId ? { ...field, enabled: checked } : field
    );
    const field = localSettings.checkoutFields.find(f => f.id === fieldId);
    setLocalSettings(prev => ({ ...prev, checkoutFields: updatedFields }));
    toast({ title: `Field '${field.label}' ${checked ? 'enabled' : 'disabled'}` });
  };

  const moveField = (dragIndex, hoverIndex) => {
    const dragField = localSettings.checkoutFields[dragIndex];
    const updatedFields = [...localSettings.checkoutFields];
    updatedFields.splice(dragIndex, 1);
    updatedFields.splice(hoverIndex, 0, dragField);
    setLocalSettings(prev => ({ ...prev, checkoutFields: updatedFields }));
  };

  const addNewField = () => {
    const newField = { id: `custom_${Date.now()}`, type: 'text', name: `custom_field_${localSettings.checkoutFields.length}`, label: 'New Custom Field', placeholder: '', defaultValue: '', class: 'form-row-wide', validation: [], required: false, enabled: true, displayInEmails: true, displayInOrderDetails: true, options: [] };
    setLocalSettings(prev => ({ ...prev, checkoutFields: [...prev.checkoutFields, newField] }));
    toast({ title: 'New Field Added', description: 'Configure your new custom field.' })
  };

  const removeField = (fieldId) => {
    setLocalSettings(prev => ({ ...prev, checkoutFields: prev.checkoutFields.filter(f => f.id !== fieldId) }));
    toast({ variant: 'destructive', title: 'Field Removed' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Checkout Settings</h1>
        <Button onClick={handleSave} className="bg-gray-800 hover:bg-gray-900 text-white">
          <Save className="h-4 w-4 mr-2" />Save Settings
        </Button>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Checkout Fields</CardTitle>
                <CardDescription>Customize and reorder fields on the checkout page.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {localSettings.checkoutFields.map((field, index) => (
                    <DraggableField
                      key={field.id}
                      index={index}
                      field={field}
                      moveField={moveField}
                      openEditModal={setEditingField}
                      removeField={removeField}
                      toggleFieldEnabled={toggleFieldEnabled}
                    />
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-4" onClick={addNewField}>
                  <Plus className="h-4 w-4 mr-2" />Add Field
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Enable or disable available payment gateways.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label htmlFor="card-switch" className="font-medium">Credit/Debit Card</Label>
                  <Switch
                    id="card-switch"
                    checked={localSettings.enableCreditCard}
                    onCheckedChange={val => setLocalSettings(prev => ({ ...prev, enableCreditCard: val }))}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label htmlFor="cod-switch" className="font-medium">Cash on Delivery</Label>
                  <Switch
                    id="cod-switch"
                    checked={localSettings.enableCashOnDelivery}
                    onCheckedChange={val => setLocalSettings(prev => ({ ...prev, enableCashOnDelivery: val }))}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Map className="w-5 h-5 text-purple-600" /> Google Maps</CardTitle>
                <CardDescription>Enable location picker on the checkout page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <Label htmlFor="map-switch" className="font-medium">Enable Google Maps</Label>
                  <Switch
                    id="map-switch"
                    checked={localSettings.enableGoogleMaps}
                    onCheckedChange={val => setLocalSettings(prev => ({ ...prev, enableGoogleMaps: val }))}
                    className="data-[state=checked]:bg-purple-600"
                  />
                </div>
                <div>
                  <Label htmlFor="map-api-key">Google Maps API Key</Label>
                  <Input
                    id="map-api-key"
                    type="password"
                    placeholder="Enter your API Key"
                    value={localSettings.googleMapsApiKey}
                    onChange={e => setLocalSettings(prev => ({ ...prev, googleMapsApiKey: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-2">The API key is required to use Google Maps features.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DndProvider>

      <EditFieldModal
        field={editingField}
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        onSave={handleFieldChange}
      />
    </motion.div>
  );
};

export default AdminCheckout;