import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyStateCard({ icon: Icon, title, description }: EmptyStateCardProps) {
  return (
    <Card className="border-2 border-purple-200/50 shadow-xl bg-white/95 backdrop-blur-sm rounded-3xl">
      <CardHeader className="text-center py-16">
        <div className="flex justify-center mb-4">
          <div className="p-6 rounded-full bg-purple-100/50">
            <Icon className="h-16 w-16 text-purple-400" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{title}</CardTitle>
        <CardDescription className="text-base text-slate-600">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
