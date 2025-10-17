import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark, Lightbulb, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TipCardProps {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  authorAvatar?: string | null;
  category: string;
  product_name?: string | null;
  product_url?: string | null;
  product_price?: number | null;
  image_url?: string | null;
  created_at: string;
}

export const TipCard = ({ 
  id,
  title, 
  content, 
  author, 
  authorId,
  authorAvatar,
  category, 
  product_name,
  product_url,
  product_price,
  image_url,
  created_at
}: TipCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState({
    like: 0,
    useful: 0,
    love: 0,
    celebration: 0,
  });
  const [commentCount, setCommentCount] = useState(0);
  const [productImage, setProductImage] = useState<string | null>(null);

  // Fetch reactions and comments count
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;

      try {
        // Check user's reaction
        const { data: userReactionData } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('tip_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setUserReaction(userReactionData?.reaction_type || null);

        // Get all reactions for this tip
        const { data: reactions } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('tip_id', id);

        // Count reactions by type
        const counts = {
          like: 0,
          useful: 0,
          love: 0,
          celebration: 0,
        };

        reactions?.forEach((reaction) => {
          if (reaction.reaction_type in counts) {
            counts[reaction.reaction_type as keyof typeof counts]++;
          }
        });

        setReactionCounts(counts);

        // Get comment count
        const { count: comments } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('tip_id', id);

        setCommentCount(comments || 0);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      }
    };

    fetchInteractions();
  }, [id, user]);

  // Fetch product image if URL provided
  useEffect(() => {
    const fetchProductImage = async () => {
      if (!product_url) return;
      
      try {
        // Extract domain for basic image fetching
        const url = new URL(product_url);
        const domain = url.hostname;
        
        // Simple fallback to try common favicon/logo paths
        const possibleImages = [
          `https://logo.clearbit.com/${domain}`,
          `${url.origin}/favicon.ico`,
          image_url
        ].filter(Boolean);
        
        // Try to find a working image
        for (const imgUrl of possibleImages) {
          try {
            const response = await fetch(imgUrl as string, { method: 'HEAD' });
            if (response.ok) {
              setProductImage(imgUrl as string);
              break;
            }
          } catch {
            continue;
          }
        }
      } catch (error) {
        console.error('Error fetching product image:', error);
      }
    };
    
    fetchProductImage();
  }, [product_url, image_url]);

  const handleReaction = async (reactionType: 'like' | 'useful' | 'love' | 'celebration') => {
    if (!user) {
      toast({
        title: "Logg inn påkrevd",
        description: "Du må være logget inn for å reagere på tips.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (userReaction === reactionType) {
        // Remove reaction if clicking the same one
        await supabase
          .from('reactions')
          .delete()
          .eq('tip_id', id)
          .eq('user_id', user.id);

        setUserReaction(null);
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: Math.max(0, prev[reactionType] - 1),
        }));
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from('reactions')
          .upsert(
            { tip_id: id, user_id: user.id, reaction_type: reactionType },
            { onConflict: 'user_id,tip_id' }
          );

        if (error) throw error;

        // Update counts
        setReactionCounts(prev => {
          const newCounts = { ...prev };
          if (userReaction) {
            newCounts[userReaction as keyof typeof newCounts] = Math.max(0, newCounts[userReaction as keyof typeof newCounts] - 1);
          }
          newCounts[reactionType]++;
          return newCounts;
        });

        setUserReaction(reactionType);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere reaksjon. Prøv igjen.",
        variant: "destructive",
      });
    }
  };

  const handleComment = () => {
    // For now, just show a toast - you can implement a comment dialog later
    toast({
      title: "Kommentarer",
      description: "Kommentarfunksjon kommer snart!",
    });
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handleProfileClick = () => {
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "i dag";
    if (diffDays === 2) return "i går";
    if (diffDays <= 7) return `${diffDays - 1} dager siden`;
    return date.toLocaleDateString('no-NO');
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-card to-primary/2 border border-primary/10">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar 
            className="w-10 h-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" 
            onClick={handleProfileClick}
          >
            {authorAvatar && (
              <AvatarImage src={authorAvatar} alt={`${author} profilbilde`} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {author.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p 
              className="font-medium text-foreground cursor-pointer hover:text-primary transition-colors" 
              onClick={handleProfileClick}
            >
              {author}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDate(created_at)}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBookmark}
          className={`p-2 ${bookmarked ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-foreground leading-tight">
          {title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-3">
          {content}
        </p>
        
        {/* Product info with image */}
        {(product_name || product_price || productImage) && (
          <div className="bg-muted/30 rounded-lg p-3 mt-3">
            <div className="flex items-center gap-3">
              {/* Product image */}
              {productImage && (
                <div 
                  className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => product_url && window.open(product_url, '_blank')}
                >
                  <img 
                    src={productImage} 
                    alt={product_name || "Produktbilde"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Product details */}
              <div className="flex-1 min-w-0">
                {product_name && (
                  <h4 className="font-medium text-sm truncate">{product_name}</h4>
                )}
                {product_price && (
                  <p className="text-primary font-semibold text-sm">
                    {formatPrice(product_price)}
                  </p>
                )}
                {product_url && (
                  <a 
                    href={product_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block mt-1"
                  >
                    Se produktet →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors ${
              userReaction === 'like'
                ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
            onClick={() => handleReaction('like')}
            title="Like"
          >
            <Heart className={`w-4 h-4 ${userReaction === 'like' ? 'fill-current' : ''}`} />
            {reactionCounts.like > 0 && (
              <span className="text-xs font-medium">{reactionCounts.like}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors ${
              userReaction === 'useful'
                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
                : 'text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20'
            }`}
            onClick={() => handleReaction('useful')}
            title="Nyttig"
          >
            <Lightbulb className={`w-4 h-4 ${userReaction === 'useful' ? 'fill-current' : ''}`} />
            {reactionCounts.useful > 0 && (
              <span className="text-xs font-medium">{reactionCounts.useful}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors ${
              userReaction === 'love'
                ? 'text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/20'
                : 'text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20'
            }`}
            onClick={() => handleReaction('love')}
            title="Elsker"
          >
            <span className="text-base leading-none">{userReaction === 'love' ? '😍' : '😊'}</span>
            {reactionCounts.love > 0 && (
              <span className="text-xs font-medium">{reactionCounts.love}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1.5 px-2.5 py-2 transition-colors ${
              userReaction === 'celebration'
                ? 'text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20'
                : 'text-muted-foreground hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20'
            }`}
            onClick={() => handleReaction('celebration')}
            title="Feiring"
          >
            <PartyPopper className={`w-4 h-4 ${userReaction === 'celebration' ? 'fill-current' : ''}`} />
            {reactionCounts.celebration > 0 && (
              <span className="text-xs font-medium">{reactionCounts.celebration}</span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 px-2.5 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={handleComment}
          >
            <MessageCircle className="w-4 h-4" />
            {commentCount > 0 && (
              <span className="text-xs font-medium">{commentCount}</span>
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBookmark}
            className={`p-2 ${bookmarked ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </Card>
  );
};