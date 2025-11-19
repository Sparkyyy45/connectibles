import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import type { Id } from "@/convex/_generated/dataModel";

interface ConnectionsListProps {
  connections: any[] | undefined;
  selectedConnection: Id<"users"> | null;
  onSelectConnection: (id: Id<"users">) => void;
}

export function ConnectionsList({ connections, selectedConnection, onSelectConnection }: ConnectionsListProps) {
  const navigate = useNavigate();

  return (
    <Card className="shadow-lg border-2 border-border/50 bg-card/95 backdrop-blur-sm flex flex-col h-[420px] md:h-[700px] overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/50 flex-shrink-0">
        <CardTitle className="text-base md:text-lg">Your Connections</CardTitle>
        <CardDescription className="text-xs">
          {connections?.length || 0} connection{connections?.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <ScrollArea className="flex-1 overflow-y-auto scroll-smooth">
        {connections && connections.length > 0 ? (
          <div className="p-2">
            {connections.map((connection) => (
              <motion.div
                key={connection?._id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 mb-2 rounded-xl cursor-pointer transition-all ${
                  selectedConnection === connection?._id
                    ? "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-md"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => connection?._id && onSelectConnection(connection._id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 border-2 border-white/20">
                    <AvatarImage src={connection?.image} alt={connection?.name || "User"} />
                    <AvatarFallback className={selectedConnection === connection?._id ? "bg-white/20" : ""}>
                      {connection?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{connection?.name || "Anonymous"}</p>
                    <p className={`text-xs truncate ${selectedConnection === connection?._id ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      {connection?.bio || "No bio"}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No connections yet</p>
            <Button onClick={() => navigate("/discover")} size="sm">
              Discover People
            </Button>
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}