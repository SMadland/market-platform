import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, Star } from "lucide-react";

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

export const TipsFeed = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Oppdage nye tips
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Utforsk de beste tipsene fra felleskapet, sortert etter popularitet og relevans
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={category === "Alle" ? "default" : "secondary"}
              className="px-4 py-2 cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Sorting tabs */}
        <Tabs defaultValue="trending" className="mb-8">
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

          <TabsContent value="trending" className="mt-8">
            <div className="grid gap-6">
              {sampleTips.map((tip) => (
                <TipCard key={tip.id} {...tip} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-8">
            <div className="grid gap-6">
              {[...sampleTips].reverse().map((tip) => (
                <TipCard key={tip.id} {...tip} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-8">
            <div className="grid gap-6">
              {[...sampleTips].sort((a, b) => b.likes - a.likes).map((tip) => (
                <TipCard key={tip.id} {...tip} />
              ))}
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