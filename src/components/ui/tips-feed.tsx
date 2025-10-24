import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useTips } from "@/hooks/useTips";

interface TipsFeedProps {
  tipType: 'private' | 'business';
  showPublicOnly?: boolean;
  searchQuery?: string;
}

export const TipsFeed = ({ tipType, showPublicOnly = false, searchQuery = "" }: TipsFeedProps) => {
  const { tips, loading } = useTips(tipType, showPublicOnly);

  const filteredTips = tips.filter(tip => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tip.title.toLowerCase().includes(query) ||
      tip.description?.toLowerCase().includes(query) ||
      tip.product_name?.toLowerCase().includes(query) ||
      tip.category?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Laster tips...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Results Count */}
      {searchQuery && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {filteredTips.length > 0 ? (
              <>Fant {filteredTips.length} tips for "{searchQuery}"</>
            ) : (
              <>Ingen tips funnet for "{searchQuery}"</>
            )}
          </p>
        </div>
      )}

      {/* Tips Grid */}
      {filteredTips.length > 0 ? (
        <div className="grid gap-6">
          {filteredTips.map((tip) => (
            <TipCard 
              key={tip.id} 
              id={tip.id}
              title={tip.title}
              content={tip.description || ""}
              author={tip.profiles?.display_name || tip.profiles?.username || "Anonym"}
              authorId={tip.user_id}
              authorAvatar={tip.profiles?.avatar_url}
              category={tip.category || "Annet"}
              product_name={tip.product_name}
              product_url={tip.product_url}
              product_price={tip.product_price}
              image_url={tip.image_url}
              created_at={tip.created_at}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {showPublicOnly 
              ? "Ingen offentlige tips å vise. Del noe offentlig for å engasjere felleskapet!" 
              : "Ingen tips funnet. Vær den første til å dele en anbefaling!"
            }
          </p>
        </div>
      )}
    </div>
  );
};