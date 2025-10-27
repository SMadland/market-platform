import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Trash2, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Tip {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  tip_id: string;
}

const ContentModeration = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'tip' | 'comment'; id: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [tipsResult, commentsResult] = await Promise.all([
        supabase
          .from('tips')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (tipsResult.error) throw tipsResult.error;
      if (commentsResult.error) throw commentsResult.error;

      setTips(tipsResult.data || []);
      setComments(commentsResult.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Kunne ikke laste innhold');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async () => {
    if (!selectedItem) return;

    try {
      if (selectedItem.type === 'tip') {
        const { error } = await supabase
          .from('tips')
          .delete()
          .eq('id', selectedItem.id);

        if (error) throw error;
        toast.success('Tips slettet');
      } else {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', selectedItem.id);

        if (error) throw error;
        toast.success('Kommentar slettet');
      }

      setShowDeleteDialog(false);
      setSelectedItem(null);
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Kunne ikke slette innhold');
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Innholdsmoderering</h2>

      <Tabs defaultValue="tips">
        <TabsList className="mb-4">
          <TabsTrigger value="tips">Tips</TabsTrigger>
          <TabsTrigger value="comments">Kommentarer</TabsTrigger>
        </TabsList>

        <TabsContent value="tips">
          <div className="space-y-4">
            {tips.map((tip) => (
              <Card key={tip.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {tip.description?.substring(0, 150)}
                      {tip.description && tip.description.length > 150 ? '...' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tip.created_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/feed`, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedItem({ type: 'tip', id: tip.id });
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {tips.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">
                Ingen tips funnet
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments">
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm mb-2">{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString('nb-NO')}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedItem({ type: 'comment', id: comment.id });
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {comments.length === 0 && !loading && (
              <p className="text-center text-muted-foreground py-8">
                Ingen kommentarer funnet
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bekreft sletting</DialogTitle>
            <DialogDescription>
              Er du sikker på at du vil slette dette innholdet? Denne handlingen kan ikke angres.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Avbryt
            </Button>
            <Button variant="destructive" onClick={handleDeleteContent}>
              Slett
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContentModeration;
