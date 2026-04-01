
import React, { useState, useEffect } from 'react';
import { listenToCollection, updateDocument, deleteDocument } from '@/lib/firestoreService';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Mail, Phone, Calendar, Archive, Trash2, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';
import AdminContactPageSettings from '@/components/admin/AdminContactPageSettings';

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800'
};

const AdminContactForms = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = listenToCollection('contactSubmissions', (data) => {
      // Sort newest first
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setSubmissions(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleOpenDetails = async (submission) => {
    setSelectedSubmission(submission);
    setAdminNotes(submission.notes || '');
    setIsModalOpen(true);

    // Auto-mark as read if it's new/unread
    if (!submission.isRead) {
      await updateDocument('contactSubmissions', submission.id, {
        isRead: true,
        status: submission.status === 'new' ? 'read' : submission.status
      });
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSubmission) return;
    try {
      await updateDocument('contactSubmissions', selectedSubmission.id, { notes: adminNotes });
      toast({ title: 'Notes saved successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save notes' });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDocument('contactSubmissions', id, { status: newStatus });
      toast({ title: `Status updated to ${newStatus}` });
      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to update status' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission permanently?')) return;
    try {
      await deleteDocument('contactSubmissions', id);
      toast({ title: 'Submission deleted' });
      setIsModalOpen(false);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to delete submission' });
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = 
      (sub.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.phone || '').includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' 
      ? true 
      : statusFilter === 'unread' 
        ? !sub.isRead 
        : sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const unreadCount = submissions.filter(s => !s.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contact Forms</h1>
          <p className="text-muted-foreground mt-1">Manage customer inquiries and contact page content</p>
        </div>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="messages" className="relative">
            Messages
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings">Contact Page Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-6 mt-6">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or subject..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Submissions</SelectItem>
                <SelectItem value="unread">Unread Only</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center p-12 bg-card rounded-xl border border-border">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No submissions found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-6 py-4 font-medium">Sender</th>
                      <th className="px-6 py-4 font-medium">Subject</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredSubmissions.map((sub) => (
                      <tr 
                        key={sub.id} 
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${!sub.isRead ? 'bg-primary/5 font-medium' : ''}`}
                        onClick={() => handleOpenDetails(sub)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {!sub.isRead && <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />}
                            <div>
                              <div className={`text-foreground ${!sub.isRead ? 'font-semibold' : ''}`}>{sub.fullName}</div>
                              <div className="text-muted-foreground text-xs">{sub.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="line-clamp-1 max-w-[200px] lg:max-w-[300px]">{sub.subject}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                          {format(new Date(sub.createdAt), 'MMM d, yyyy h:mm a')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenDetails(sub); }}>
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Details Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              {selectedSubmission && (
                <>
                  <DialogHeader>
                    <div className="flex justify-between items-start pr-6">
                      <div>
                        <DialogTitle className="text-xl">{selectedSubmission.subject}</DialogTitle>
                        <DialogDescription className="mt-1">
                          From: {selectedSubmission.fullName}
                        </DialogDescription>
                      </div>
                      <Badge variant="outline" className={`capitalize ${statusColors[selectedSubmission.status]}`}>
                        {selectedSubmission.status}
                      </Badge>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-y border-border my-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${selectedSubmission.email}`} className="text-primary hover:underline">{selectedSubmission.email}</a>
                    </div>
                    {selectedSubmission.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${selectedSubmission.phone}`} className="text-primary hover:underline">{selectedSubmission.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(selectedSubmission.createdAt), 'PPP p')}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Message</h4>
                      <div className="bg-muted/30 p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedSubmission.message}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-muted-foreground uppercase tracking-wider">Admin Notes</h4>
                      <Textarea 
                        placeholder="Add internal notes here..." 
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" variant="secondary" onClick={handleSaveNotes}>Save Notes</Button>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="mt-6 flex-col sm:flex-row gap-2 border-t pt-4">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(selectedSubmission.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      {selectedSubmission.status !== 'archived' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedSubmission.id, 'archived')}
                        >
                          <Archive className="h-4 w-4 mr-2" /> Archive
                        </Button>
                      )}
                      {selectedSubmission.status !== 'replied' && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateStatus(selectedSubmission.id, 'replied')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Mark Replied
                        </Button>
                      )}
                    </div>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AdminContactPageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContactForms;
