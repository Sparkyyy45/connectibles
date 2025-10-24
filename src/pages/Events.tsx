import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Plus, X, Calendar, MapPin, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import type { Id } from "@/convex/_generated/dataModel";

export default function Events() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const events = useQuery(api.events.getAllEvents);
  const createEvent = useMutation(api.events.createEvent);
  const toggleInterest = useMutation(api.events.toggleInterest);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setCreating(true);
    try {
      await createEvent({
        title,
        description,
        location: location || undefined,
        eventDate: eventDate ? new Date(eventDate).getTime() : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      toast.success("Event created successfully!");
      setOpen(false);
      setTitle("");
      setDescription("");
      setLocation("");
      setEventDate("");
      setTags([]);
    } catch (error) {
      toast.error("Failed to create event");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleInterest = async (eventId: Id<"events">) => {
    try {
      await toggleInterest({ eventId });
    } catch (error) {
      toast.error("Failed to update interest");
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tight">Events & Meetups</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Join community activities and create your own events
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create Event</DialogTitle>
                <DialogDescription className="text-base">
                  Organize a meetup or activity for the community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-5 py-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Event name"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this event about?"
                    rows={4}
                    className="resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location (Optional)</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Where will it happen?"
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Date & Time (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags (Optional)</label>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="h-11"
                    />
                    <Button onClick={handleAddTag} type="button" className="px-6">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full h-11 text-base">
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Create Event
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {events?.map((event, index) => {
            const isInterested = event.interestedUsers?.includes(user._id);
            return (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {event.creator?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl mb-1 line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="text-sm">
                          by {event.creator?.name || "Anonymous"}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2">
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                      {event.eventDate && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-md px-3 py-2">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
                          <span>{new Date(event.eventDate).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {event.interestedUsers?.slice(0, 3).map((_, i) => (
                            <div key={i} className="h-6 w-6 rounded-full bg-primary/20 border-2 border-background" />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          {event.interestedUsers?.length || 0} interested
                        </span>
                      </div>
                      <Button
                        variant={isInterested ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleToggleInterest(event._id)}
                        className="transition-all hover:scale-105"
                      >
                        <Heart className={`h-4 w-4 mr-2 transition-all ${isInterested ? "fill-current" : ""}`} />
                        {isInterested ? "Interested" : "Mark Interested"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {events?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-dashed border-2">
              <CardHeader className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-2xl mb-2">No Events Yet</CardTitle>
                <CardDescription className="text-base">
                  Be the first to create an event and bring the community together!
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}