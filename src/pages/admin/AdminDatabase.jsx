import React, { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileUp, Database, Package, ShoppingCart, Star, Users, Palette, Settings, Image as ImageIcon, FileText, Link as LinkIcon, Tags } from 'lucide-react';
import { useDatabase } from '@/context/DatabaseContext';

const DataStatCard = ({ icon, title, count, description }) => (
  <div className="flex items-center p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
    {icon}
    <div className="ml-3">
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-600">{count} {description || 'items'}</p>
    </div>
  </div>
);

const AdminDatabase = () => {
  const { getWebsiteData, exportData, importData } = useDatabase();
  const fileInputRef = useRef(null);

  const dataStats = useMemo(() => {
    const data = getWebsiteData();
    return {
      products: data.products.length,
      orders: data.orders.length,
      reviews: data.reviews.length,
      customers: data.customers.length,
      media: data.mediaItems.length,
      pages: data.pages.length,
      categories: data.categories.length,
      roles: data.access.roles.length,
      syncedProducts: data.integrations.syncedProducts.length,
      connectedStores: data.integrations.stores.length,
    };
  }, [getWebsiteData]);

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      importData(file);
    }
  };

  const iconClass = "w-6 h-6 text-purple-600";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Database Management</h1>
          <p className="text-gray-600 mt-1">Manage, export, and import your entire website's dataset.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".js"
            onChange={handleFileChange}
          />
          <Button variant="outline" onClick={handleImportClick}>
            <FileUp className="mr-2 h-4 w-4" /> Import Data
          </Button>
          <Button onClick={exportData}>
            <FileDown className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-6 h-6" />
            Data Overview
          </CardTitle>
          <CardDescription>A summary of all local and integrated data that will be included in the export.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <DataStatCard icon={<Package className={iconClass} />} title="Local Products" count={dataStats.products} />
            <DataStatCard icon={<Package className={`${iconClass} text-blue-600`} />} title="Synced Products" count={dataStats.syncedProducts} />
            <DataStatCard icon={<ShoppingCart className={iconClass} />} title="Orders" count={dataStats.orders} />
            <DataStatCard icon={<Star className={iconClass} />} title="Reviews" count={dataStats.reviews} />
            <DataStatCard icon={<Users className={iconClass} />} title="Customers" count={dataStats.customers} />
            <DataStatCard icon={<ImageIcon className={iconClass} />} title="Media" count={dataStats.media} />
            <DataStatCard icon={<FileText className={iconClass} />} title="Pages" count={dataStats.pages} />
            <DataStatCard icon={<Tags className={iconClass} />} title="Categories" count={dataStats.categories} />
            <DataStatCard icon={<Users className={iconClass} />} title="User Roles" count={dataStats.roles} />
            <DataStatCard icon={<LinkIcon className={`${iconClass} text-blue-600`} />} title="Connected Stores" count={dataStats.connectedStores} description="stores" />
          </div>
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-semibold text-blue-800">What's included?</p>
            <p className="text-sm text-blue-700 mt-1">
              The export file contains all essential website data, including local and synced products, orders, media, user data (without sensitive info), and all design and configuration settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md" role="alert">
        <p className="font-bold">Important Note on Server-Side Operations</p>
        <p>This tool creates a downloadable JavaScript file containing your website's data. For security reasons, direct server-side file creation is not performed. You can use the exported file for backups or to migrate your data.</p>
      </div>
    </motion.div>
  );
};

export default AdminDatabase;