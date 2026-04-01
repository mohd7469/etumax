import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccess } from '@/context/AccessContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash, Edit, X, Eye, EyeOff, Key, Mail, Shield, UserPlus, Users, Activity } from 'lucide-react';

const UserModal = ({ user, onClose, onSave }) => {
  const { roles } = useAccess();
  const [formData, setFormData] = useState(user || { name: '', email: '', password: '', role: 'customer', status: 'active' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToastAction = (description) => {
    toast({ title: 'Feature Demo', description });
  };

  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: -20 }}
        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{user ? 'Edit User' : 'Create User'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
          <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
          <Input name="password" type="password" placeholder={user ? "New Password (optional)" : "Password"} value={formData.password} onChange={handleChange} required={!user} />

          <Select name="role" value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
            <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
            <SelectContent>
              {roles.map(role => <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Checkbox id="status" checked={formData.status === 'active'} onCheckedChange={(checked) => handleSelectChange('status', checked ? 'active' : 'inactive')} />
            <label htmlFor="status" className="text-sm font-medium">User is Active</label>
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {user && (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => handleToastAction('Password reset link sent!')}><Key className="mr-2 h-4 w-4" /> Reset Password</Button>
                  <Button type="button" variant="outline" onClick={() => handleToastAction('Credentials re-sent via email!')}><Mail className="mr-2 h-4 w-4" /> Resend Credentials</Button>
                </div>
              )}
            </div>
            <Button type="submit">{user ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const RoleModal = ({ role, onClose, onSave }) => {
  const { permissionSections } = useAccess();
  const [formData, setFormData] = useState(role || { name: '', permissions: {} });

  const handlePermissionChange = (sectionId, perm, value) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [sectionId]: {
          ...prev.permissions[sectionId],
          [perm]: value,
        },
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: -20 }} className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{role ? 'Edit Role' : 'Create Role'}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-6 w-6" /></Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="name" placeholder="Role Name (e.g., Manager)" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={role?.isDefault} />
          <ScrollArea className="h-96 pr-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold">Module</th>
                  <th className="text-center p-2 font-semibold">View</th>
                  <th className="text-center p-2 font-semibold">Edit</th>
                  <th className="text-center p-2 font-semibold">Delete</th>
                  <th className="text-center p-2 font-semibold">Publish</th>
                </tr>
              </thead>
              <tbody>
                {permissionSections.map(section => (
                  <tr key={section.id} className="border-b">
                    <td className="p-2 font-medium">{section.label}</td>
                    {['view', 'edit', 'delete', 'publish'].map(perm => (
                      <td key={perm} className="text-center p-2">
                        <Checkbox checked={!!formData.permissions?.[section.id]?.[perm]} onCheckedChange={(val) => handlePermissionChange(section.id, perm, val)} disabled={role?.isDefault} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
          <div className="flex justify-end pt-4">
            {!role?.isDefault && <Button type="submit">{role ? 'Save Changes' : 'Create Role'}</Button>}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const UsersTab = () => {
  const { users, roles, addUser, updateUser, deleteUsers, canAccess } = useAccess();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});
  const { toast } = useToast();

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleBulkAction = (action) => {
    if (selectedUsers.length === 0) {
      toast({ variant: 'destructive', title: 'No users selected' });
      return;
    }
    if (action === 'delete') {
      deleteUsers(selectedUsers);
    } else if (action === 'suspend' || action === 'activate') {
      selectedUsers.forEach(id => updateUser(id, { status: action }));
      toast({ title: `Users ${action}d` });
    }
    setSelectedUsers([]);
  };

  const canEdit = canAccess('access-manager', 'edit');
  const canDelete = canAccess('access-manager', 'delete');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Create, edit, and manage all user accounts.</CardDescription>
          </div>
          {canEdit && <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}><UserPlus className="mr-2 h-4 w-4" />Create User</Button>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button variant="outline" onClick={() => handleBulkAction('activate')}>Activate Selected</Button>
          <Button variant="outline" onClick={() => handleBulkAction('suspend')}>Suspend Selected</Button>
          {canDelete && <Button variant="destructive" onClick={() => handleBulkAction('delete')}>Delete Selected</Button>}
        </div>
        <ScrollArea className="h-[60vh]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-2 w-10"><Checkbox onCheckedChange={(checked) => setSelectedUsers(checked ? users.map(u => u.id) : [])} /></th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Password</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Last Login</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-2"><Checkbox checked={selectedUsers.includes(user.id)} onCheckedChange={(checked) => setSelectedUsers(prev => checked ? [...prev, user.id] : prev.filter(id => id !== user.id))} /></td>
                  <td className="p-2">{user.name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2 flex items-center">
                    <span>{showPasswords[user.id] ? user.password : '••••••••'}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => setShowPasswords(prev => ({ ...prev, [user.id]: !prev[user.id] }))}>
                      {showPasswords[user.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </td>
                  <td className="p-2">{roles.find(r => r.id === user.role)?.name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-2">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</td>
                  <td className="p-2 text-right">
                    {canEdit && <Button variant="ghost" size="icon" onClick={() => { setEditingUser(user); setIsModalOpen(true); }}><Edit className="h-4 w-4" /></Button>}
                    {canDelete && <Button variant="ghost" size="icon" onClick={() => deleteUsers([user.id])}><Trash className="h-4 w-4" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </CardContent>
      <AnimatePresence>
        {isModalOpen && <UserModal user={editingUser} onClose={() => setIsModalOpen(false)} onSave={handleSaveUser} />}
      </AnimatePresence>
    </Card>
  );
};

const RolesTab = () => {
  const { roles, addRole, updateRole, deleteRole, canAccess } = useAccess();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  const handleSaveRole = (roleData) => {
    if (editingRole) {
      updateRole(editingRole.id, roleData);
    } else {
      addRole(roleData);
    }
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const canEdit = canAccess('access-manager', 'edit');
  const canDelete = canAccess('access-manager', 'delete');

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>Define user roles and their specific permissions.</CardDescription>
          </div>
          {canEdit && <Button onClick={() => { setEditingRole(null); setIsModalOpen(true); }}><Shield className="mr-2 h-4 w-4" />Create Role</Button>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {roles.map(role => (
          <div key={role.id} className="p-4 border rounded-lg flex justify-between items-center">
            <span className="font-semibold">{role.name}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setEditingRole(role); setIsModalOpen(true); }}><Edit className="mr-2 h-4 w-4" />{role.isDefault ? 'View' : 'Edit'} Permissions</Button>
              {!role.isDefault && canDelete && <Button variant="destructive" onClick={() => deleteRole(role.id)}><Trash className="mr-2 h-4 w-4" />Delete</Button>}
            </div>
          </div>
        ))}
      </CardContent>
      <AnimatePresence>
        {isModalOpen && <RoleModal role={editingRole} onClose={() => setIsModalOpen(false)} onSave={handleSaveRole} />}
      </AnimatePresence>
    </Card>
  );
};

const ActivityLogTab = () => {
  const { activityLogs } = useAccess();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Logs</CardTitle>
        <CardDescription>Track all user and system actions within the Access Manager.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] border rounded-md p-4 bg-gray-50">
          {activityLogs.map(log => (
            <div key={log.id} className="text-sm mb-2 border-b pb-2">
              <span className="font-semibold">{log.user}</span> {log.action}: <span className="text-gray-600">{log.details}</span>
              <div className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const AdminAccessManager = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Access Manager</h1>
      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
          <TabsTrigger value="roles"><Shield className="mr-2 h-4 w-4" />Roles & Permissions</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="mr-2 h-4 w-4" />Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="roles" className="mt-4"><RolesTab /></TabsContent>
        <TabsContent value="logs" className="mt-4"><ActivityLogTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAccessManager;