import { useState, useEffect } from 'react';
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

interface CommentsSectionProps {
  tipId: string;
  onCommentCountChange?: (count: number) => void;
}

export const CommentsSection = ({ tipId, onCommentCountChange }: CommentsSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [tipId]);

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
        .order('created_at', { ascending: true });

      if (error) throw error;

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
    <div className="mt-4 pt-4 border-t border-border/50">
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
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
                <div className="bg-muted/50 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {comment.profiles?.display_name || comment.profiles?.username || 'Bruker'}
                    </span>
                    {comment.user_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block ml-1">
                  {formatDate(comment.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex gap-2 items-start">
        <Avatar className="w-8 h-8 flex-shrink-0">
          {user?.user_metadata?.avatar_url && (
            <AvatarImage src={user.user_metadata.avatar_url} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {user?.email?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <Textarea
            placeholder={user ? "Skriv en kommentar..." : "Logg inn for å kommentere"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[60px] resize-none"
            disabled={!user}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && newComment.trim()) {
                e.preventDefault();
                handleSubmitComment();
              }
            }}
          />
          {user && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/500
              </span>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting || newComment.length > 500}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    Publiserer...
                  </>
                ) : (
                  'Publiser'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
