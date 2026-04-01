
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const StoreManagementModal = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    storeUrl: '',
    consumerKey: '',
    consumerSecret: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.storeUrl || !formData.consumerKey || !formData.consumerSecret) {
      toast({ variant: 'destructive', title: 'Error', description: 'All fields are required.' });
      return;
    }
    
    try {
      new URL(formData.storeUrl);
    } catch (_) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid store URL.' });
      return;
    }

    onSave({
      id: `store_${Date.now()}`,
      ...formData
    });
    
    setFormData({ name: '', storeUrl: '', consumerKey: '', consumerSecret: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add WooCommerce Store</DialogTitle>
          <DialogDescription>
            Enter the details and API credentials for your WooCommerce store.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., My Main Store" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeUrl">Store URL</Label>
            <Input id="storeUrl" name="storeUrl" type="url" value={formData.storeUrl} onChange={handleChange} placeholder="https://yourstore.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consumerKey">Consumer Key</Label>
            <Input id="consumerKey" name="consumerKey" value={formData.consumerKey} onChange={handleChange} placeholder="ck_..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="consumerSecret">Consumer Secret</Label>
            <Input id="consumerSecret" name="consumerSecret" type="password" value={formData.consumerSecret} onChange={handleChange} placeholder="cs_..." />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Add Store</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StoreManagementModal;
