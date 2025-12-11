import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hand, Flag } from "lucide-react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

interface UserActionDialogProps {
  selectedUser: { id: Id<"users">, name: string, image?: string } | null;
  onClose: () => void;
  onWave: (userId: Id<"users">) => void;
  onReport: () => void;
}

export function UserActionDialog({ selectedUser, onClose, onWave, onReport }: UserActionDialogProps) {
  return (
    <Dialog open={!!selectedUser} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md overflow-hidden border-2 border-primary/20 mx-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent pointer-events-none" />
        <DialogHeader className="relative">
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar className="h-24 w-24 border-4 border-primary/30 shadow-2xl ring-4 ring-primary/10">
                <AvatarImage src={selectedUser?.image} alt={selectedUser?.name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-purple-600 text-white font-bold">
                  {selectedUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {selectedUser?.name}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Connect with <span className="font-semibold text-primary">{selectedUser?.name}</span>
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-2 mb-4 relative">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => selectedUser && onWave(selectedUser.id)}
              className="w-full gap-3 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              size="lg"
            >
              <Hand className="h-6 w-6" />
              Send a Wave
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onReport}
              variant="outline"
              className="w-full gap-3 h-12 text-base font-medium border-2 hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all"
              size="lg"
            >
              <Flag className="h-5 w-5" />
              Report User
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
