import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoupon } from '@/context/CouponContext';
import { useProducts } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash, Edit, X, Search, Ticket, ChevronsUpDown, Loader2, Save, Package } from 'lucide-react';
import { MultiSelect } from '@/components/ui/multi-select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const CouponModal = ({ isOpen, onClose, coupon, onSave }) => {
  const isNewCoupon = !coupon?.id;
  const { products, categories } = useProducts();
  const [formData, setFormData] = useState(
    coupon || {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      is_active: true,
      min_spend: null,
      valid_from: null,
      valid_to: null,
      usage_limit: null,
      product_ids: [],
      category_ids: [],
    }
  );

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const productOptions = products.map(p => ({ value: p.id, label: p.name }));
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }));

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-bold">{isNewCoupon ? 'Add New Coupon' : 'Edit Coupon'}</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="is_active" checked={formData.is_active} onCheckedChange={val => setFormData({ ...formData, is_active: val })} />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">Discount Type</Label>
                <Select value={formData.discount_type} onValueChange={val => setFormData({ ...formData, discount_type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount_value">Value</Label>
                <Input id="discount_value" type="number" step="0.01" value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })} required />
              </div>
            </div>
            <h3 className="text-lg font-semibold pt-4 border-t mt-4">Restrictions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_spend">Minimum Spend</Label>
                <Input id="min_spend" type="number" placeholder="No minimum" value={formData.min_spend || ''} onChange={e => setFormData({ ...formData, min_spend: e.target.value ? parseFloat(e.target.value) : null })} />
              </div>
              <div>
                <Label htmlFor="usage_limit">Usage Limit</Label>
                <Input id="usage_limit" type="number" placeholder="Unlimited" value={formData.usage_limit || ''} onChange={e => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value, 10) : null })} />
              </div>
              <div>
                <Label htmlFor="valid_from">Valid From</Label>
                <Input id="valid_from" type="date" value={formData.valid_from ? formData.valid_from.split('T')[0] : ''} onChange={e => setFormData({ ...formData, valid_from: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="valid_to">Valid To</Label>
                <Input id="valid_to" type="date" value={formData.valid_to ? formData.valid_to.split('T')[0] : ''} onChange={e => setFormData({ ...formData, valid_to: e.target.value })} />
              </div>
            </div>
            <h3 className="text-lg font-semibold pt-4 border-t mt-4">Applicability</h3>
            <div className="space-y-4">
              <div>
                <Label>Applicable Products</Label>
                <MultiSelect options={productOptions} selected={formData.product_ids || []} onChange={val => setFormData({ ...formData, product_ids: val })} placeholder="All products" />
              </div>
              <div>
                <Label>Applicable Categories</Label>
                <MultiSelect options={categoryOptions} selected={formData.category_ids || []} onChange={val => setFormData({ ...formData, category_ids: val })} placeholder="All categories" />
              </div>
            </div>
          </div>
          <div className="flex justify-end p-6 border-t bg-gray-50">
            <Button type="button" variant="ghost" className="mr-2" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Coupon</Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const BundleDiscountConfigurator = () => {
  const { bundleDiscounts, saveBundleDiscounts, coupons } = useCoupon();
  const { toast } = useToast();
  const [localDiscounts, setLocalDiscounts] = useState([]);

  React.useEffect(() => {
    setLocalDiscounts(bundleDiscounts.sort((a, b) => a.quantity - b.quantity));
  }, [bundleDiscounts]);

  const handleFieldChange = (id, field, value) => {
    setLocalDiscounts(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleAddNewRule = () => {
    const newRule = {
      id: `bundle_${Date.now()}`,
      quantity: '',
      discount: '',
      coupon: '',
      bestDeal: false,
    };
    setLocalDiscounts(prev => [...prev, newRule]);
  };

  const handleRemoveRule = (id) => {
    setLocalDiscounts(prev => prev.filter(d => d.id !== id));
  };



  const handleSave = () => {
    // Validation
    for (const discount of localDiscounts) {
      if (!discount.quantity || !discount.discount || !discount.coupon) {
        toast({ variant: 'destructive', title: 'Incomplete Rule', description: 'Please fill all fields for each bundle rule.' });
        return;
      }
    }
    saveBundleDiscounts(localDiscounts);
    toast({ title: 'Bundle discounts saved successfully! 🎉' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quantity-Based Discounts</CardTitle>
        <CardDescription>
          Configure automatic discounts for bulk purchases. These will appear on the product page.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {localDiscounts.map((discount, index) => (
            <motion.div key={discount.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-3 p-4 border rounded-lg bg-slate-50">
              <div className="flex-grow">
                <Label>Item Quantity</Label>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={discount.quantity}
                  onChange={e => handleFieldChange(discount.id, 'quantity', parseInt(e.target.value, 10) || '')}
                />
              </div>
              <div className="flex-grow">
                <Label>Discount %</Label>
                <Input
                  type="number"
                  placeholder="e.g., 10"
                  value={discount.discount}
                  onChange={e => handleFieldChange(discount.id, 'discount', parseInt(e.target.value, 10) || '')}
                />
              </div>
              <div className="flex-grow">
                <Label>Coupon Code to Apply</Label>
                <Select
                  value={discount.coupon}
                  onValueChange={val => handleFieldChange(discount.id, 'coupon', val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Coupon" />
                  </SelectTrigger>
                  <SelectContent>
                    {coupons.filter(c => c.is_active).map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} ({c.discount_value}% Off)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id={`bestDeal-${discount.id}`}
                  checked={discount.bestDeal}
                  onCheckedChange={val => handleFieldChange(discount.id, 'bestDeal', val)}
                />
                <Label htmlFor={`bestDeal-${discount.id}`}>Best Deal</Label>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(discount.id)}><Trash className="h-4 w-4 text-red-500" /></Button>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={handleAddNewRule}><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
          <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
};


export default function AdminCoupons() {
  const { coupons, addCoupon, updateCoupon, deleteCoupons, isLoading } = useCoupon();
  const { toast } = useToast();
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCoupon, setEditingCoupon] = useState(null);

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [coupons, searchQuery]);

  const handleSave = async (couponData) => {
    try {
      if (couponData.id) {
        await updateCoupon(couponData.id, couponData);
        toast({ title: 'Coupon Updated!', description: `Coupon "${couponData.code}" has been saved.` });
      } else {
        await addCoupon(couponData);
        toast({ title: 'Coupon Created!', description: `Coupon "${couponData.code}" is now live.` });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: error.message });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) return;
    try {
      await deleteCoupons(selectedCoupons);
      toast({ title: `${selectedCoupons.length} coupons deleted.` });
      setSelectedCoupons([]);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Delete Failed', description: error.message });
    }
  };

  const handleSelectAll = (checked) => setSelectedCoupons(checked ? filteredCoupons.map(c => c.id) : []);
  const handleSelectCoupon = (id, checked) => setSelectedCoupons(prev => checked ? [...prev, id] : prev.filter(cId => cId !== id));

  const isAllSelected = selectedCoupons.length > 0 && selectedCoupons.length === filteredCoupons.length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Coupons</h1>
        <Button onClick={() => setEditingCoupon({})}><Plus className="mr-2 h-4 w-4" /> Add New Coupon</Button>
      </div>

      <BundleDiscountConfigurator />

      <Card>
        <CardHeader>
          <CardTitle>Manage Coupon Codes</CardTitle>
          <CardDescription>Create and manage individual discount codes for your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search by code..." className="pl-10" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={selectedCoupons.length === 0}>Delete Selected</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete {selectedCoupons.length} coupons.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto border">
            <table className="w-full text-left min-w-max">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="p-4 w-12"><Checkbox onCheckedChange={handleSelectAll} checked={isAllSelected} /></th>
                  <th className="p-4 font-semibold">Code</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Value</th>
                  <th className="p-4 font-semibold">Usage</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Expires</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="8" className="text-center p-8"><Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-600" /></td></tr>
                ) : filteredCoupons.map(coupon => (
                  <tr key={coupon.id} className="border-b last:border-none hover:bg-gray-50">
                    <td className="p-4"><Checkbox onCheckedChange={checked => handleSelectCoupon(coupon.id, checked)} checked={selectedCoupons.includes(coupon.id)} /></td>
                    <td className="p-4 font-mono font-bold text-purple-700">{coupon.code}</td>
                    <td className="p-4 capitalize">{coupon.discount_type}</td>
                    <td className="p-4">{coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `AED ${coupon.discount_value}`}</td>
                    <td className="p-4">{coupon.usage_count || 0} / {coupon.usage_limit || '∞'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {coupon.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">{coupon.valid_to ? new Date(coupon.valid_to).toLocaleDateString() : 'Never'}</td>
                    <td className="p-4">
                      <Button variant="outline" size="sm" onClick={() => setEditingCoupon(coupon)}><Edit className="h-4 w-4 mr-2" /> Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCoupons.length === 0 && !isLoading && <div className="text-center py-16 text-gray-500">No coupons found.</div>}
        </CardContent>
      </Card>

      {editingCoupon && <CouponModal isOpen={!!editingCoupon} onClose={() => setEditingCoupon(null)} coupon={editingCoupon} onSave={handleSave} />}
    </motion.div>
  );
}