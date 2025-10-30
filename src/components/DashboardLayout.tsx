import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Users, Calendar, MessageCircle, User, LogOut, Bell, Palette, MessageSquare, Gamepad2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactNode, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const prevUnreadCount = useRef<number | undefined>(undefined);

  // Show toast when new notifications arrive
  useEffect(() => {
    if (prevUnreadCount.current !== undefined && unreadCount !== undefined) {
      if (unreadCount > prevUnreadCount.current) {
        const newCount = unreadCount - prevUnreadCount.current;
        toast.success(`You have ${newCount} new notification${newCount > 1 ? 's' : ''}!`, {
          action: {
            label: "View",
            onClick: () => navigate("/notifications"),
          },
        });
      }
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount, navigate]);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Discover", path: "/discover" },
    { icon: Palette, label: "Canvas", path: "/chill" },
    { icon: MessageSquare, label: "Gossip", path: "/gossip" },
    { icon: Gamepad2, label: "Games", path: "/games" },
    { icon: Calendar, label: "Events", path: "/events" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 flex">
      {/* Vertical Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-72 bg-card/80 backdrop-blur-xl border-r border-border/50 shadow-2xl flex flex-col fixed h-screen z-50"
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <motion.div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-all">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Connectibles
              </span>
              <p className="text-xs text-muted-foreground">Connect & Collaborate</p>
            </div>
          </motion.div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={user?.image} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-purple-600 text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-base font-medium transition-all",
                    active
                      ? "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-lg shadow-primary/25"
                      : "hover:bg-muted/50 hover:translate-x-1"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2 w-2 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center justify-around mb-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 relative hover:bg-muted/50 transition-all"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5" />
              <AnimatePresence>
                {unreadCount !== undefined && unreadCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge
                      variant="destructive"
                      className="h-5 min-w-5 flex items-center justify-center px-1 text-xs"
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 hover:bg-muted/50 transition-all"
              onClick={() => navigate("/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-72 min-h-screen">
        <div className="h-full">
          {children}
        </div>
      </main>
    </div>
  );
}