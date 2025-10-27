import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Search, Trash2, Mail, Shield, ShieldOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  created_at: string | null;
}

const UserManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      toast.error('Vennligst skriv inn et søkeord');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
        .limit(20);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Kunne ikke søke etter brukere');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async (userId: string) => {
    try {
      // Note: This requires calling Supabase Admin API from an edge function
      toast.info('Passordtilbakestilling må implementeres via edge function');
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Kunne ikke sende passordtilbakestilling');
    }
  };

  const handleToggleAdminRole = async (userId: string, currentlyAdmin: boolean) => {
    try {
      if (currentlyAdmin) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;
        toast.success('Admin-rolle fjernet');
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;
        toast.success('Admin-rolle tildelt');
      }

      // Refresh user list
      searchUsers();
    } catch (error) {
      console.error('Error toggling admin role:', error);
      toast.error('Kunne ikke endre admin-rolle');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // First delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', selectedUser.user_id);

      if (profileError) throw profileError;

      toast.success('Bruker slettet');
      setShowDeleteDialog(false);
      setSelectedUser(null);
      searchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Kunne ikke slette bruker');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Brukerhåndtering</h2>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Søk etter brukernavn eller navn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
        />
        <Button onClick={searchUsers} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Søk
        </Button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {user.display_name || user.username || 'Ukjent'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Registrert: {user.created_at ? new Date(user.created_at).toLocaleDateString('nb-NO') : 'Ukjent'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendPasswordReset(user.user_id)}
                >
                  <Mail className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleAdminRole(user.user_id, false)}
                >
                  <Shield className="h-4 w-4" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && !loading && searchQuery && (
          <p className="text-center text-muted-foreground py-8">
            Ingen brukere funnet
          </p>
        )}
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekreft sletting</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette denne brukeren? Denne handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Slett bruker
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
