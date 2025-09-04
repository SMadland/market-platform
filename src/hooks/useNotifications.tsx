import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  related_user_id: string | null;
  related_tip_id: string | null;
  related_conversation_id: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Mock data - since notifications table doesn't exist yet
  const fetchNotifications = async () => {
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    console.log("Mark as read:", notificationId);
  };

  const markAllAsRead = async () => {
    console.log("Mark all as read");
  };

  const deleteNotification = async (notificationId: string) => {
    console.log("Delete notification:", notificationId);
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications
  };
};