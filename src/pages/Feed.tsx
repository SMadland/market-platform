import { TipsFeed } from "@/components/ui/tips-feed";
import { CreateTipDialog } from "@/components/ui/create-tip-dialog";
import { SearchBar } from "@/components/ui/search-bar";
import { Plus, Briefcase, Home, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Feed = () => {
  const [activeTab, setActiveTab] = useState<'private' | 'business' | 'explore'>('private');
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mamon
            </h1>
            <CreateTipDialog />
          </div>
          <SearchBar 
            onSearch={handleSearch}
            onClear={handleClearSearch}
            placeholder="Søk etter tips..."
          />
        </div>
      </header>

      {/* Feed Content with Tabs */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-4">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'business' | 'explore')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-4 sm:mb-8">
            <TabsTrigger value="private" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Privat</span>
              <span className="xs:hidden">Priv</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Briefcase className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Bedrift</span>
              <span className="xs:hidden">Bedr</span>
            </TabsTrigger>
            <TabsTrigger value="explore" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Compass className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Utforsk</span>
              <span className="xs:hidden">Utfor</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="mt-0">
            <TipsFeed tipType="private" searchQuery={searchQuery} />
          </TabsContent>
          
          <TabsContent value="business" className="mt-0">
            <TipsFeed tipType="business" searchQuery={searchQuery} />
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
            <TipsFeed tipType="private" showPublicOnly searchQuery={searchQuery} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Add Button for mobile */}
      <div className="fixed bottom-24 right-4 z-30 md:hidden">
        <CreateTipDialog>
          <Button 
            size="lg" 
            className="w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </CreateTipDialog>
      </div>
    </div>
  );
};

export default Feed;