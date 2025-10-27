import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
}

interface CommentDialogProps {
  tipId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentCountChange?: (count: number) => void;
}

export const CommentDialog = ({ tipId, open, onOpenChange, onCommentCountChange }: CommentDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchComments();
    }
  }, [open, tipId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('tip_id', tipId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data for each comment
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, username, avatar_url')
          .in('user_id', userIds);

        const commentsWithProfiles = data.map(comment => {
          const profile = profiles?.find(p => p.user_id === comment.user_id);
          return {
            ...comment,
            profiles: profile ? {
              display_name: profile.display_name,
              username: profile.username,
              avatar_url: profile.avatar_url,
            } : undefined,
          };
        });

        setComments(commentsWithProfiles);
        onCommentCountChange?.(commentsWithProfiles.length);
      } else {
        setComments([]);
        onCommentCountChange?.(0);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke laste kommentarer',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          tip_id: tipId,
          user_id: user.id,
          content: newComment.trim(),
        });

      if (error) throw error;

      toast({
        title: 'Kommentar lagt til',
        description: 'Din kommentar ble publisert',
      });

      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke legge til kommentar',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: 'Kommentar slettet',
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'Feil',
        description: 'Kunne ikke slette kommentar',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'akkurat nå';
    if (diffMinutes < 60) return `${diffMinutes}m siden`;
    if (diffHours < 24) return `${diffHours}t siden`;
    if (diffDays < 7) return `${diffDays}d siden`;
    return date.toLocaleDateString('nb-NO');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Kommentarer ({comments.length})</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  {comment.profiles?.avatar_url && (
                    <AvatarImage src={comment.profiles.avatar_url} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {(comment.profiles?.display_name || comment.profiles?.username || 'U')
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">
                        {comment.profiles?.display_name || comment.profiles?.username || 'Bruker'}
                      </span>
                      {comment.user_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Ingen kommentarer ennå</p>
              <p className="text-sm mt-1">Vær den første til å kommentere!</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-3 pt-4 border-t">
          <Textarea
            placeholder="Skriv en kommentar..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
            disabled={!user}
          />
          <div className="flex justify-between items-center w-full">
            {!user ? (
              <span className="text-xs text-muted-foreground">
                Logg inn for å kommentere
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {newComment.length}/500
              </span>
            )}
            <Button
              onClick={handleSubmitComment}
              disabled={!user || !newComment.trim() || submitting || newComment.length > 500}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publiserer...
                </>
              ) : (
                'Publiser'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
