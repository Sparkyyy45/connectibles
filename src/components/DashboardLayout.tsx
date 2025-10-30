import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Home, Users, Calendar, MessageCircle, User, LogOut, Bell, Palette, MessageSquare, Gamepad2, Trophy, Heart } from "lucide-react";
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
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Palette, label: "Confessional", path: "/chill" },
    { icon: MessageSquare, label: "Gossip", path: "/gossip" },
    { icon: Heart, label: "Truth/Dare", path: "/truth-dare" },
    { icon: Gamepad2, label: "Games", path: "/games" },
    { icon: Trophy, label: "Stats", path: "/game-stats" },
    { icon: Calendar, label: "Events", path: "/events" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-primary/5 flex">
      {/* Vertical Sidebar */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-80 bg-gradient-to-b from-card/95 via-card/90 to-card/95 backdrop-blur-2xl border-r border-border/40 shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex flex-col fixed h-screen z-50"
      >
        {/* Logo Section */}
        <div className="p-7 border-b border-border/30">
          <motion.div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigate("/")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-primary/25 to-purple-500/25 group-hover:from-primary/35 group-hover:to-purple-500/35 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <Sparkles className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform duration-300" />
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-2xl blur-md"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-purple-600 bg-clip-text text-transparent">
                Connect Minds
              </span>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">Connect & Collaborate</p>
            </div>
          </motion.div>
        </div>

        {/* User Profile Section */}
        <div className="p-7 border-b border-border/30">
          <div className="flex items-center gap-4 p-3 rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 hover:from-muted/50 hover:to-muted/30 transition-all duration-300">
            <Avatar className="h-14 w-14 border-2 border-primary/30 shadow-xl ring-2 ring-primary/10">
              <AvatarImage src={user?.image} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-primary via-purple-500 to-purple-600 text-white font-bold text-xl">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-5 space-y-2.5 overflow-y-auto">
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
                    "w-full justify-start gap-4 h-14 text-base font-semibold transition-all duration-300 rounded-xl",
                    active
                      ? "bg-gradient-to-r from-primary via-purple-500 to-purple-600 text-primary-foreground shadow-xl shadow-primary/30 scale-[1.02]"
                      : "hover:bg-muted/60 hover:translate-x-2 hover:shadow-md"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-all duration-300",
                    active ? "bg-white/20" : "bg-transparent group-hover:bg-muted"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto h-2.5 w-2.5 rounded-full bg-white shadow-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Button>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-5 border-t border-border/30 bg-gradient-to-t from-muted/20 to-transparent">
          <div className="flex items-center justify-around mb-4 gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-14 relative hover:bg-muted/60 transition-all duration-300 rounded-xl hover:scale-110 hover:shadow-lg"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-6 w-6" />
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
                      className="h-6 min-w-6 flex items-center justify-center px-1.5 text-xs font-bold shadow-lg"
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
              className="h-14 w-14 hover:bg-muted/60 transition-all duration-300 rounded-xl hover:scale-110 hover:shadow-lg"
              onClick={() => navigate("/profile")}
            >
              <User className="h-6 w-6" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            className="w-full justify-start gap-4 h-14 text-destructive hover:bg-destructive/15 hover:text-destructive transition-all duration-300 rounded-xl font-semibold hover:shadow-md"
            onClick={() => signOut()}
          >
            <div className="p-2 rounded-lg hover:bg-destructive/10 transition-all">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="tracking-wide">Sign Out</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-80 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}