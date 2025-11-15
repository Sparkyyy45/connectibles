// @ts-nocheck
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface OnlineAvatarProps {
  userId: Id<"users">;
  image?: string;
  name?: string;
  className?: string;
  showOnlineIndicator?: boolean;
}

export default function OnlineAvatar({
  userId,
  image,
  name,
  className,
  showOnlineIndicator = true,
}: OnlineAvatarProps) {
  const isOnline = useQuery(api.presence.isUserOnline, { userId });

  return (
    <div className="relative inline-block">
      <Avatar
        className={cn(
          "transition-all duration-300",
          isOnline && showOnlineIndicator && "ring-2 ring-green-500 ring-offset-2 shadow-[0_0_15px_rgba(34,197,94,0.5)]",
          className
        )}
      >
        <AvatarImage src={image} alt={name || "User"} />
        <AvatarFallback>{name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
      </Avatar>
      {showOnlineIndicator && isOnline && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse" />
      )}
    </div>
  );
}