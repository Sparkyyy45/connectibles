import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";

const AVATAR_OPTIONS = [
  "https://harmless-tapir-303.convex.cloud/api/storage/c6af04e7-5f25-42ed-87b3-f6379004ea2c",
  "https://harmless-tapir-303.convex.cloud/api/storage/844115e3-91c8-47f8-b250-fc6694176440",
  "https://harmless-tapir-303.convex.cloud/api/storage/5430559c-3682-46ab-bcff-18409e7864fb",
  "https://harmless-tapir-303.convex.cloud/api/storage/d84b216f-ea49-4a34-9850-68d65d77c7f9",
  "https://harmless-tapir-303.convex.cloud/api/storage/7981220d-b946-4936-8640-a1a1a525b9ce",
  "https://harmless-tapir-303.convex.cloud/api/storage/e29c69e0-529e-4fd5-80fd-2c5c634e836d",
  "https://harmless-tapir-303.convex.cloud/api/storage/f8aa39b6-25a6-4735-892f-863be9ab609a",
  "https://harmless-tapir-303.convex.cloud/api/storage/8a179bc3-f72c-4356-b328-e0dfe5e45f66",
  "https://harmless-tapir-303.convex.cloud/api/storage/a670f73b-8f14-4b9d-aff1-3ac07701f8ff",
  "https://harmless-tapir-303.convex.cloud/api/storage/aa4c1c3a-28a1-49dd-aa76-d91804b4a2ae",
  "https://harmless-tapir-303.convex.cloud/api/storage/8a0fba04-5c37-4f52-a731-f836badde995",
  "https://harmless-tapir-303.convex.cloud/api/storage/4f21db78-c2a6-4f65-8c8d-a588b356d897",
  "https://harmless-tapir-303.convex.cloud/api/storage/99128b60-32e3-4553-b926-b7f9f81cad76",
  "https://harmless-tapir-303.convex.cloud/api/storage/6976cdca-4333-431a-b082-db3f1034afe0",
  "https://harmless-tapir-303.convex.cloud/api/storage/e2ce9146-b4e5-4078-b343-f0840aa8b995",
  "https://harmless-tapir-303.convex.cloud/api/storage/fffda107-a8d7-4edc-a1e5-1b92e6ee7226",
  "https://harmless-tapir-303.convex.cloud/api/storage/ab1757e9-9dc4-4c38-8fcf-84c8de041728",
  "https://harmless-tapir-303.convex.cloud/api/storage/237eaa72-0cd6-4b35-a02c-107367c33088",
  "https://harmless-tapir-303.convex.cloud/api/storage/9dd54c99-1ae3-4c74-9dcd-05579405013d",
];

export default function Profile() {
  const { isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.profiles.updateProfile);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("");
  const [department, setDepartment] = useState("");
  const [major, setMajor] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [newLookingFor, setNewLookingFor] = useState("");
  const [availability, setAvailability] = useState("");
  const [studySpot, setStudySpot] = useState("");
  const [favoriteSubject, setFavoriteSubject] = useState("");
  const [weekendActivity, setWeekendActivity] = useState("");
  const [superpower, setSuperpower] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setInterests(user.interests || []);
      setSkills(user.skills || []);
      setSelectedAvatar(user.image || AVATAR_OPTIONS[0]);
      setYearOfStudy(user.yearOfStudy || "");
      setDepartment(user.department || "");
      setMajor(user.major || "");
      setLookingFor(user.lookingFor || []);
      setAvailability(user.availability || "");
      setStudySpot(user.studySpot || "");
      setFavoriteSubject(user.favoriteSubject || "");
      setWeekendActivity(user.weekendActivity || "");
      setSuperpower(user.superpower || "");
    }
  }, [user]);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleAddLookingFor = () => {
    if (newLookingFor.trim() && !lookingFor.includes(newLookingFor.trim())) {
      setLookingFor([...lookingFor, newLookingFor.trim()]);
      setNewLookingFor("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        name,
        bio,
        location,
        interests,
        skills,
        image: selectedAvatar,
        yearOfStudy,
        department,
        major,
        lookingFor,
        availability,
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold tracking-tight mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Choose an avatar that represents you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={selectedAvatar} alt="Profile" />
                  <AvatarFallback>
                    {name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`relative rounded-full border-2 transition-all ${
                      selectedAvatar === avatar
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    }`}
                  >
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    </Avatar>
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or college name"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Interests</CardTitle>
              <CardDescription>Add your passions and hobbies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                />
                <Button onClick={handleAddInterest}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1">
                    {interest}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setInterests(interests.filter((i) => i !== interest))
                      }
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Add your skills and expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                />
                <Button onClick={handleAddSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>Help others find you based on your academic profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year of Study</label>
                <Input
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  placeholder="e.g., Freshman, Sophomore, Junior, Senior"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering, Arts, Sciences"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Major</label>
                <Input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science, Psychology"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Connection Preferences</CardTitle>
              <CardDescription>What are you looking for in connections?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Looking For</label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newLookingFor}
                    onChange={(e) => setNewLookingFor(e.target.value)}
                    placeholder="e.g., Study Partner, Project Collaborator, Friend"
                    onKeyDown={(e) => e.key === "Enter" && handleAddLookingFor()}
                  />
                  <Button onClick={handleAddLookingFor}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lookingFor.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1">
                      {item}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLookingFor(lookingFor.filter((i) => i !== item))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Availability</label>
                <Input
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  placeholder="e.g., Weekends, Evenings, Flexible"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Profile"
            )}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}