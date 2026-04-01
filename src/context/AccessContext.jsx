import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';
import { listenToDocument, setDocument } from '@/lib/firestoreService';

const AccessContext = createContext();

export const useAccess = () => useContext(AccessContext);

const permissionSections = [{ id: 'dashboard', label: 'Dashboard' }, { id: 'products', label: 'Products' }];
const defaultRoles = [{ id: 'admin', name: '🧑‍💼 Admin', permissions: { dashboard: { view: true, edit: true, delete: true, publish: true }, products: { view: true, edit: true, delete: true, publish: true } }, isDefault: true }];

export const AccessProvider = ({ children }) => {
  const { user: currentUser, updateUser: updateCurrentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    const unsub = listenToDocument('settings', 'access', (data) => {
      if (data) {
        setUsers(data.users || []);
        setRoles(data.roles || defaultRoles);
        setActivityLogs(data.activityLogs || []);
      }
    });
    return () => unsub();
  }, []);

  const saveDataToFirestore = useCallback(async (path, data) => {
    await setDocument('settings', 'access', { [path]: data });
  }, []);

  const addLog = useCallback((action, user, details) => {
    const newLog = { id: Date.now(), action, user, details, timestamp: new Date().toISOString() };
    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    saveDataToFirestore('activityLogs', updatedLogs);
  }, [activityLogs, saveDataToFirestore]);

  const addUser = (userData) => {
    const updatedUsers = [...users, { ...userData, id: Date.now().toString() }];
    saveDataToFirestore('users', updatedUsers);
    toast({ title: 'User Created' });
  };

  const updateUser = (userId, updatedData) => {
    const updatedUsers = users.map(u => (u.id === userId ? { ...u, ...updatedData } : u));
    saveDataToFirestore('users', updatedUsers);
    toast({ title: 'User Updated' });
  };

  const deleteUsers = (userIds) => {
    saveDataToFirestore('users', users.filter(u => !userIds.includes(u.id)));
    toast({ variant: 'destructive', title: 'Users Deleted' });
  };

  const addRole = (roleData) => {
    saveDataToFirestore('roles', [...roles, { ...roleData, id: roleData.name.toLowerCase().replace(/\s+/g, '-'), permissions: {} }]);
  };

  const updateRole = (roleId, updatedData) => {
    saveDataToFirestore('roles', roles.map(r => (r.id === roleId ? { ...r, ...updatedData } : r)));
  };

  const deleteRole = (roleId) => {
    saveDataToFirestore('roles', roles.filter(r => r.id !== roleId));
  };

  const canAccess = useCallback((sectionId, permissionType) => {
    if (!currentUser || !currentUser.isAdmin) return false;
    if (currentUser.role === 'admin') return true;
    const userRoleData = roles.find(r => r.id === currentUser.role);
    if (!userRoleData) return false;
    return userRoleData.permissions[sectionId]?.[permissionType] === true;
  }, [currentUser, roles]);

  return <AccessContext.Provider value={{ users, roles, activityLogs, permissionSections, addUser, updateUser, deleteUsers, addRole, updateRole, deleteRole, canAccess, addLog }}>{children}</AccessContext.Provider>;
};