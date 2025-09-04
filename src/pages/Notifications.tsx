import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, BellOff, Check, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationWithProfile {
  id: string;
  type: string;
  title: string;
  message: string;
  related_user_id: string | null;
  related_tip_id: string | null;
  related_conversation_id?: string | null;
  is_read: boolean;
  created_at: string;
  related_user?: {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  };
}

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [notificationsWithProfiles, setNotificationsWithProfiles] = useState<NotificationWithProfile[]>([]);

  // Fetch profile data for notifications
  useEffect(() => {
    const fetchProfilesForNotifications = async () => {
      const notificationsWithProfileData = await Promise.all(
        notifications.map(async (notification) => {
          if (notification.related_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("username, display_name, avatar_url")
              .eq("user_id", notification.related_user_id)
              .single();
            
            return {
              ...notification,
              related_user: profile
            };
          }
          return notification;
        })
      );
      
      setNotificationsWithProfiles(notificationsWithProfileData);
    };

    if (notifications.length > 0) {
      fetchProfilesForNotifications();
    } else {
      setNotificationsWithProfiles([]);
    }
  }, [notifications]);

  const handleNotificationClick = async (notification: NotificationWithProfile) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'friend_request_received':
        navigate('/network');
        break;
      case 'friend_request_accepted':
        navigate('/network');
        break;
      case 'tip_liked':
      case 'tip_commented':
        navigate('/feed');
        break;
      case 'message_received':
        if (notification.related_conversation_id) {
          navigate(`/chat/${notification.related_conversation_id}`);
        } else {
          navigate('/messages');
        }
        break;
      default:
        break;
    }
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request_received':
      case 'friend_request_accepted':
        return '👥';
      case 'tip_liked':
        return '❤️';
      case 'tip_commented':
        return '💬';
      case 'message_received':
        return '📩';
      default:
        return '🔔';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Du må være logget inn for å se varsler.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Varsler
            </h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadCount}
              </Badge>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Merk alle som lest
            </Button>
          )}
        </div>
      </header>

      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Laster varsler...</p>
          </div>
        ) : notificationsWithProfiles.length > 0 ? (
          <div className="space-y-3">
            {notificationsWithProfiles.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {notification.related_user ? (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.related_user.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(notification.related_user.display_name || notification.related_user.username || '?')[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BellOff className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Ingen varsler</h3>
            <p className="text-muted-foreground">
              Du vil få varsler her når noe skjer i nettverket ditt
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;