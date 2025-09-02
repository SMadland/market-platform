import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
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
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [productImage, setProductImage] = useState<string | null>(null);

  // Fetch likes and comments count
  useEffect(() => {
    const fetchInteractions = async () => {
      if (!user) return;
      
      try {
        // Check if user liked this tip
        const { data: userLike } = await supabase
          .from('likes')
          .select('id')
          .eq('tip_id', id)
          .eq('user_id', user.id)
          .maybeSingle();
        
        setIsLiked(!!userLike);
        
        // Get like count
        const { count: likes } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .eq('tip_id', id);
        
        setLikeCount(likes || 0);
        
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

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Logg inn påkrevd",
        description: "Du må være logget inn for å like tips.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('likes')
          .delete()
          .eq('tip_id', id)
          .eq('user_id', user.id);
        
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        // Add like
        await supabase
          .from('likes')
          .insert({ tip_id: id, user_id: user.id });
        
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere like. Prøv igjen.",
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
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`flex items-center gap-2 px-3 py-2 transition-colors ${
              isLiked 
                ? 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20' 
                : 'text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20'
            }`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likeCount}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5"
            onClick={handleComment}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{commentCount}</span>
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