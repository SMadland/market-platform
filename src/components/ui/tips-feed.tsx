import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, Star, Loader2 } from "lucide-react";
import { useTips } from "@/hooks/useTips";
import { useState } from "react";

const categories = [
  "Alle", "Teknologi", "Hjem", "Helse", "Mat", "Reise", "Økonomi", "Arbeid"
];

const sampleTips = [
  {
    id: 1,
    title: "Rask måte å fjerne kalk fra dusjen",
    content: "Bland hvit eddik og oppvaskmiddel 1:1. Spray på, la virke i 15 min, skyll av. Kalken forsvinner uten hard skrubbing!",
    author: "Nina K.",
    category: "Hjem",
    likes: 43,
    comments: 8,
    isLiked: false
  },
  {
    id: 2,
    title: "Spar strøm med smart lading av telefon",
    content: "Lad telefonen til 80% i stedet for 100%. Dette forlenger batterilevetiden betydelig og reduserer strømforbruket over tid.",
    author: "Erik M.",
    category: "Teknologi",
    likes: 67,
    comments: 12,
    isLiked: true
  },
  {
    id: 3,
    title: "Få bedre søvn med 3-2-1 regelen",
    content: "3 timer før sengetid: slutt å spise. 2 timer før: slutt å jobbe. 1 time før: slutt med skjermer. Game changer for søvnkvaliteten!",
    author: "Maria L.",
    category: "Helse",
    likes: 92,
    comments: 15,
    isLiked: false
  },
  {
    id: 4,
    title: "Forleng holdbarheten på grønnsaker",
    content: "Legg en tørr papirhåndkle i grønnsaksskuffen. Den absorberer fuktighet og holder salat og grønnsaker friske mye lenger.",
    author: "Ole S.",
    category: "Mat",
    likes: 38,
    comments: 6,
    isLiked: false
  }
];

interface TipsFeedProps {
  tipType: 'private' | 'business';
}

export const TipsFeed = ({ tipType }: TipsFeedProps) => {
  const { tips, loading, refreshTips } = useTips(tipType);
  const [selectedCategory, setSelectedCategory] = useState("Alle");
  const [sortBy, setSortBy] = useState("trending");

  const filteredTips = tips.filter(tip => 
    selectedCategory === "Alle" || tip.category === selectedCategory
  );

  const sortedTips = [...filteredTips].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "top":
        // For now, sort by created date since we don't have likes data yet
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  if (loading) {
    return (
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Laster tips...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {tipType === 'private' ? 'Privatkjøp' : 'Bedriftskjøp'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {tipType === 'private' 
              ? 'Utforsk de beste anbefalingene for private kjøp fra felleskapet'
              : 'Oppdage smarte bedriftskjøp og B2B-løsninger'
            }
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={category === selectedCategory ? "default" : "secondary"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Sorting tabs */}
        <Tabs value={sortBy} onValueChange={setSortBy} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Nyeste
            </TabsTrigger>
            <TabsTrigger value="top" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Topp
            </TabsTrigger>
          </TabsList>

          <TabsContent value={sortBy} className="mt-8">
            <div className="grid gap-6">
              {sortedTips.length > 0 ? (
                sortedTips.map((tip) => (
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
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Ingen tips funnet.</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Vær den første til å dele en anbefaling!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Load more */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8">
            Last inn flere tips
          </Button>
        </div>
      </div>
    </section>
  );
};