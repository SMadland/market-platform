import { NavLink, useLocation } from "react-router-dom";
import { Home, Users, User, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    to: "/feed",
    icon: Home,
    label: "Feed"
  },
  {
    to: "/groups",
    icon: MessageSquare,
    label: "Grupper"
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
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
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};