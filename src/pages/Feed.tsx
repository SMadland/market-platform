import { TipsFeed } from "@/components/ui/tips-feed";
import { CreateTipDialog } from "@/components/ui/create-tip-dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Feed = () => {
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

      {/* Feed Content */}
      <TipsFeed />

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