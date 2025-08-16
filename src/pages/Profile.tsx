import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTips } from "@/hooks/useTips";
import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Edit, Users, Heart, Share } from "lucide-react";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { tips, loading } = useTips();

  // Filter tips by current user
  const userTips = tips.filter(tip => tip.user_id === user?.id);

  const stats = {
    tips: userTips.length,
    friends: 12, // Mock data
    likes: userTips.reduce((acc, tip) => acc + (tip.profiles ? 1 : 0), 0) // Mock calculation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Laster profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profil
          </h1>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user?.user_metadata?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {user?.user_metadata?.display_name || user?.user_metadata?.username || 'Bruker'}
              </h2>
              <p className="text-muted-foreground">
                @{user?.user_metadata?.username || 'bruker'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Medlem siden {new Date(user?.created_at || '').toLocaleDateString('nb-NO', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Rediger
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.tips}</div>
              <div className="text-sm text-muted-foreground">Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{stats.friends}</div>
              <div className="text-sm text-muted-foreground">Venner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.likes}</div>
              <div className="text-sm text-muted-foreground">Likes</div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Mine tips
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Likte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="mt-6">
            <div className="space-y-4">
              {userTips.length > 0 ? (
                userTips.map((tip) => (
                  <TipCard 
                    key={tip.id} 
                    id={tip.id}
                    title={tip.title}
                    content={tip.description || ""}
                    author={tip.profiles?.display_name || tip.profiles?.username || "Du"}
                    category={tip.category || "Annet"}
                    product_name={tip.product_name}
                    product_url={tip.product_url}
                    product_price={tip.product_price}
                    created_at={tip.created_at}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <Share className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Du har ikke delt noen tips ennå</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Del din første anbefaling med vennene dine!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="liked" className="mt-6">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">Ingen likte tips ennå</p>
              <p className="text-sm text-muted-foreground mt-2">
                Tips du liker vil vises her
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;