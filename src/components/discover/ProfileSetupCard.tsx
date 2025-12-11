import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ProfileSetupCardProps {
  onSetupProfile: () => void;
}

export function ProfileSetupCard({ onSetupProfile }: ProfileSetupCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="border-2 border-purple-200/60 shadow-2xl bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden mx-2 md:mx-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 pointer-events-none" />
        <CardHeader className="text-center space-y-4 pb-6 px-4 md:px-6 relative">
          <motion.div 
            className="flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <div className="p-4 md:p-5 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-purple-200/50 shadow-lg">
              <UserPlus className="h-12 w-12 md:h-14 md:w-14 text-purple-600" />
            </div>
          </motion.div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Complete Your Profile First</CardTitle>
          <CardDescription className="text-base md:text-lg text-slate-600 max-w-md mx-auto">
            Add your interests to start discovering amazing matches
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8 md:pb-10 px-4 md:px-6 relative">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto"
          >
            <Button 
              onClick={onSetupProfile}
              size="lg"
              className="gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all px-8 md:px-10 py-6 md:py-7 text-base md:text-lg font-semibold w-full sm:w-auto rounded-2xl"
            >
              <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              Set Up Profile
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
