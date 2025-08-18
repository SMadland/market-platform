import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTips } from "@/hooks/useTips";
import { TipCard } from "@/components/ui/tip-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, UserPlus, UserCheck, Share, Heart } from "lucide-react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfileData {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tips, loading: tipsLoading } = useTips();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState<'none' | 'pending' | 'friends'>('none');
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  // Filter tips by this user
  const userTips = tips.filter(tip => tip.user_id === userId);

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      
      if (!profileData) {
        toast({
          title: "Bruker ikke funnet",
          description: "Denne brukeren eksisterer ikke.",
          variant: "destructive",
        });
        navigate("/feed");
        return;
      }

      setProfile(profileData);
      
      // Check friendship status
      if (user && user.id !== userId) {
        const { data: friendshipData } = await supabase
          .from("friendships")
          .select("status")
          .or(`and(requester_id.eq.${user.id},addressee_id.eq.${userId}),and(requester_id.eq.${userId},addressee_id.eq.${user.id})`)
          .maybeSingle();
        
        if (friendshipData) {
          setFriendshipStatus(friendshipData.status === 'accepted' ? 'friends' : 'pending');
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke laste profil. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async () => {
    if (!user || !userId || friendRequestLoading) return;
    
    setFriendRequestLoading(true);
    
    try {
      const { error } = await supabase
        .from("friendships")
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      setFriendshipStatus('pending');
      toast({
        title: "Venneforespørsel sendt",
        description: "Din venneforespørsel er sendt!",
      });
    } catch (error) {
      console.error("Error sending friend request:", error);
      toast({
        title: "Feil",
        description: "Kunne ikke sende venneforespørsel. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setFriendRequestLoading(false);
    }
  };

  const getFriendButtonConfig = () => {
    switch (friendshipStatus) {
      case 'friends':
        return {
          text: 'Venner',
          icon: UserCheck,
          variant: 'secondary' as const,
          disabled: true
        };
      case 'pending':
        return {
          text: 'Forespørsel sendt',
          icon: UserCheck,
          variant: 'secondary' as const,
          disabled: true
        };
      default:
        return {
          text: 'Legg til venn',
          icon: UserPlus,
          variant: 'default' as const,
          disabled: false
        };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId, user]);

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Profil ikke funnet</p>
        </div>
      </div>
    );
  }

  const friendButtonConfig = getFriendButtonConfig();
  const IconComponent = friendButtonConfig.icon;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Profil
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="p-4">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              {profile.avatar_url && (
                <AvatarImage src={profile.avatar_url} alt="Profilbilde" />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold">
                {profile.display_name || profile.username || 'Bruker'}
              </h2>
              <p className="text-muted-foreground">
                @{profile.username || 'bruker'}
              </p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-2">
                  {profile.bio}
                </p>
              )}
            </div>
            {user && user.id !== userId && (
              <Button 
                variant={friendButtonConfig.variant}
                size="sm"
                onClick={handleFriendRequest}
                disabled={friendButtonConfig.disabled || friendRequestLoading}
              >
                {friendRequestLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <IconComponent className="w-4 h-4 mr-2" />
                )}
                {friendButtonConfig.text}
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userTips.length}</div>
              <div className="text-sm text-muted-foreground">Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">0</div>
              <div className="text-sm text-muted-foreground">Venner</div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="tips" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="tips" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Tips
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tips" className="mt-6">
            <div className="space-y-4">
              {tipsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">Laster tips...</p>
                </div>
              ) : userTips.length > 0 ? (
                userTips.map((tip) => (
                  <TipCard 
                    key={tip.id} 
                    id={tip.id}
                    title={tip.title}
                    content={tip.description || ""}
                    author={tip.profiles?.display_name || tip.profiles?.username || "Bruker"}
                    authorId={tip.user_id}
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
                  <p className="text-muted-foreground">Ingen tips delt ennå</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;