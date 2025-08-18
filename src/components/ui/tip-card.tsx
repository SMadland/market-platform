import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  created_at
}: TipCardProps) => {
  const navigate = useNavigate();
  const [bookmarked, setBookmarked] = useState(false);

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
        
        {/* Product info */}
        {(product_name || product_price) && (
          <div className="bg-muted/30 rounded-lg p-3 mt-3">
            <div className="flex items-center justify-between">
              {product_name && (
                <span className="font-medium text-sm">{product_name}</span>
              )}
              {product_price && (
                <span className="text-primary font-semibold">
                  {formatPrice(product_price)}
                </span>
              )}
            </div>
            {product_url && (
              <a 
                href={product_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline mt-1 block"
              >
                Se produktet →
              </a>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
            <Heart className="w-4 h-4" />
            <span className="text-sm font-medium">0</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-primary hover:bg-primary/5">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">0</span>
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