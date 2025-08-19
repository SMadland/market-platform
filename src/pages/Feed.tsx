import { TipsFeed } from "@/components/ui/tips-feed";
import { CreateTipDialog } from "@/components/ui/create-tip-dialog";
import { Plus, Briefcase, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Feed = () => {
  const [activeTab, setActiveTab] = useState<'private' | 'business'>('private');

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Feed
          </h1>
          <CreateTipDialog />
        </div>
      </header>

      {/* Feed Content with Tabs */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'private' | 'business')} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="private" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Privatkjøp
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Bedriftskjøp
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="private" className="mt-0">
            <TipsFeed tipType="private" />
          </TabsContent>
          
          <TabsContent value="business" className="mt-0">
            <TipsFeed tipType="business" />
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