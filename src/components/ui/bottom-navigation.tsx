import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, User, MessageSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";

const navItems = [
  {
    to: "/feed",
    icon: Home,
    label: "Feed"
  },
  {
    to: "/messages",
    icon: MessageSquare,
    label: "Samtaler"
  },
  {
    to: "/notifications",
    icon: Bell,
    label: "Varsler"
  },
  {
    to: "/network", 
    icon: Users,
    label: "Nettverk"
  },
  {
    to: "/profile",
    icon: User,
    label: "Profil"
  }
];

export const BottomNavigation = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to === "/messages" && location.pathname.startsWith("/chat/"));
          const isNotifications = item.to === "/notifications";
          
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs transition-colors",
                isActive 
                  ? "text-primary font-medium" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                {isNotifications && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};