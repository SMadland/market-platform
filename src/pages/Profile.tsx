import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTips } from "@/hooks/useTips";
import { useFriends } from "@/hooks/useFriends";
import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, LogOut, Users, Heart, Share, UserPlus, Check, X } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ProfileEditDialog } from "@/components/ui/profile-edit-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const { tips, loading } = useTips();
  const { friends, friendRequests, acceptFriendRequest, rejectFriendRequest } = useFriends();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Filter tips by current user
  const userTips = tips.filter(tip => tip.user_id === user?.id);

  const stats = {
    tips: userTips.length,
    friends: friends.length,
    likes: userTips.reduce((acc, tip) => acc + (tip.profiles ? 1 : 0), 0) // Mock calculation
  };

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (profileData) {
        // Cast to include bio field that was just added to database
        setProfile(profileData as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logget ut",
        description: "Du har blitt logget ut.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke logge ut. Prøv igjen.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  if (loading || profileLoading) {
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
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              {profile?.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt="Profilbilde" />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile?.display_name?.[0]?.toUpperCase() || 
                 profile?.username?.[0]?.toUpperCase() || 
                 user?.email?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile?.display_name || profile?.username || 'Bruker'}
              </h2>
              <p className="text-muted-foreground">
                @{profile?.username || 'bruker'}
              </p>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Medlem siden {new Date(user?.created_at || '').toLocaleDateString('nb-NO', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </p>
            </div>
            <ProfileEditDialog 
              profile={profile} 
              onProfileUpdate={fetchProfile}
            />
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Mine tips
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Venner
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Forespørsler
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
                    authorId={tip.user_id}
                    authorAvatar={profile?.avatar_url}
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
                  <Share className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Du har ikke delt noen tips ennå</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Del din første anbefaling med vennene dine!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="space-y-4">
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <Card key={friend.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={friend.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(friend.display_name || friend.username || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {friend.display_name || friend.username}
                          </div>
                          {friend.display_name && friend.username && (
                            <div className="text-sm text-muted-foreground">
                              @{friend.username}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/profile/${friend.user_id}`)}
                      >
                        Se profil
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Du har ingen venner ennå</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Søk etter folk i meldinger for å legge til venner
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="space-y-4">
              {friendRequests.length > 0 ? (
                friendRequests.map((request) => (
                  <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.requester_profile?.avatar_url} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {(request.requester_profile?.display_name || request.requester_profile?.username || '?')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.requester_profile?.display_name || request.requester_profile?.username}
                          </div>
                          {request.requester_profile?.display_name && request.requester_profile?.username && (
                            <div className="text-sm text-muted-foreground">
                              @{request.requester_profile.username}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString('no-NO')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => acceptFriendRequest(request.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => rejectFriendRequest(request.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Ingen venneforespørsler</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Nye forespørsler vil vises her
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