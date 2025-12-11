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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, X, Check, Edit, Save } from "lucide-react";
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

  const [isEditing, setIsEditing] = useState(false);
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
  const [matchIntent, setMatchIntent] = useState("");
  const [preferredActivities, setPreferredActivities] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [showInterestSuggestions, setShowInterestSuggestions] = useState(false);
  const [personalityType, setPersonalityType] = useState<number>(3);

  const COMMON_INTERESTS = [
    "Hiking", "Reading", "Gaming", "Cooking", "Photography", "Music", "Sports",
    "Art", "Travel", "Fitness", "Movies", "Dancing", "Writing", "Coding",
    "Yoga", "Meditation", "Cycling", "Swimming", "Running", "Painting"
  ];

  const ACTIVITY_OPTIONS = [
    "Deep conversations",
    "Going to parties",
    "Quiet nights in",
    "Exploring the city",
    "Working out",
    "Studying together",
    "Coffee dates",
    "Movie nights",
    "Outdoor adventures",
    "Gaming sessions"
  ];

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && !isEditing) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setInterests(user.interests || []);
      setSkills(user.skills || []);
      setSelectedAvatar(user.image || AVATAR_OPTIONS[0]);
      setYearOfStudy(user.yearOfStudy || "");
      setDepartment(user.department || "");
      setMatchIntent(user.matchIntent || "");
      setPreferredActivities(user.preferredActivities || []);
      setPersonalityType(user.personalityType || 3);
    }
  }, [user, isEditing]);

  const handleAddInterest = () => {
    if (!isEditing) return;
    if (newInterest.trim() && !interests.includes(newInterest.trim()) && interests.length < 10) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
      setInterestInput("");
    }
  };

  const filteredInterestSuggestions = COMMON_INTERESTS.filter(
    interest => 
      interest.toLowerCase().includes(interestInput.toLowerCase()) &&
      !interests.includes(interest)
  ).slice(0, 5);

  const toggleActivity = (activity: string) => {
    if (!isEditing) return;
    if (preferredActivities.includes(activity)) {
      setPreferredActivities(preferredActivities.filter(a => a !== activity));
    } else {
      setPreferredActivities([...preferredActivities, activity]);
    }
  };

  const handleAddSkill = () => {
    if (!isEditing) return;
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
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
        matchIntent,
        preferredActivities,
        personalityType,
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || "");
      setBio(user.bio || "");
      setLocation(user.location || "");
      setInterests(user.interests || []);
      setSkills(user.skills || []);
      setSelectedAvatar(user.image || AVATAR_OPTIONS[0]);
      setYearOfStudy(user.yearOfStudy || "");
      setDepartment(user.department || "");
      setMatchIntent(user.matchIntent || "");
      setPreferredActivities(user.preferredActivities || []);
      setPersonalityType(user.personalityType || 3);
    }
    setIsEditing(false);
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
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scroll-smooth">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">Your Profile</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage your profile information and preferences
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="lg" className="gap-2 w-full sm:w-auto">
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Edit Profile</span>
            </Button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={handleCancel} variant="outline" size="lg" className="flex-1 sm:flex-none">
                <span className="text-sm sm:text-base">Cancel</span>
              </Button>
              <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 flex-1 sm:flex-none">
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="text-sm sm:text-base">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Save</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Profile Picture</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Choose an avatar that represents you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-primary/20">
                  <AvatarImage src={selectedAvatar} alt="Profile" />
                  <AvatarFallback>
                    {name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3 max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto">
                {AVATAR_OPTIONS.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => isEditing && setSelectedAvatar(avatar)}
                    disabled={!isEditing}
                    className={`relative rounded-full border-2 transition-all touch-manipulation ${
                      selectedAvatar === avatar
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50"
                    } ${!isEditing ? "opacity-60 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
                  >
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    </Avatar>
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-0.5 sm:p-1">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
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
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Basic Information</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-base"
                  disabled={!isEditing}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself (max 200 characters)"
                  rows={4}
                  maxLength={200}
                  className="text-base resize-none"
                  disabled={!isEditing}
                />
                <p className="text-xs text-muted-foreground mt-1">{bio.length}/200 characters</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or college name"
                  className="text-base"
                  disabled={!isEditing}
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
              <CardTitle className="text-xl sm:text-2xl">Interests & Hobbies</CardTitle>
              <CardDescription className="text-sm">Add up to 10 interests (type to see suggestions)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={newInterest}
                      onChange={(e) => {
                        setNewInterest(e.target.value);
                        setInterestInput(e.target.value);
                        setShowInterestSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowInterestSuggestions(newInterest.length > 0)}
                      onBlur={() => setTimeout(() => setShowInterestSuggestions(false), 200)}
                      placeholder="Type an interest (e.g., hiking, coding...)"
                      onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                      className="flex-1 text-base"
                      disabled={interests.length >= 10 || !isEditing}
                    />
                    {showInterestSuggestions && filteredInterestSuggestions.length > 0 && isEditing && (
                      <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg">
                        {filteredInterestSuggestions.map((suggestion) => (
                          <div
                            key={suggestion}
                            className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                            onMouseDown={() => {
                              if (interests.length < 10) {
                                setInterests([...interests, suggestion]);
                                setNewInterest("");
                                setInterestInput("");
                                setShowInterestSuggestions(false);
                              }
                            }}
                          >
                            {suggestion}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleAddInterest} 
                    className="w-full sm:w-auto"
                    disabled={interests.length >= 10 || !isEditing}
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{interests.length}/10 interests</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                    {interest}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInterests(interests.filter((i) => i !== interest));
                        }}
                      />
                    )}
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
              <CardTitle className="text-xl sm:text-2xl">Skills</CardTitle>
              <CardDescription className="text-sm">Add your skills and expertise</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                  className="flex-1 text-base"
                  disabled={!isEditing}
                />
                <Button onClick={handleAddSkill} className="w-full sm:w-auto" disabled={!isEditing}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                    {skill}
                    {isEditing && (
                      <X
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors ml-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSkills(skills.filter((s) => s !== skill));
                        }}
                      />
                    )}
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
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Preferred Activities</CardTitle>
              <CardDescription className="text-xs sm:text-sm">What do you enjoy doing with friends?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {ACTIVITY_OPTIONS.map((activity) => (
                  <div
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all touch-manipulation ${
                      preferredActivities.includes(activity)
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/50"
                    } ${isEditing ? "cursor-pointer active:scale-98" : "cursor-not-allowed opacity-60"}`}
                  >
                    <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      preferredActivities.includes(activity)
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}>
                      {preferredActivities.includes(activity) && (
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm font-medium">{activity}</span>
                  </div>
                ))}
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
              <CardTitle className="text-xl sm:text-2xl">Academic Information</CardTitle>
              <CardDescription className="text-sm">Help others find you based on your academic profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year of Study</label>
                <Select value={yearOfStudy} onValueChange={setYearOfStudy} disabled={!isEditing}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">1st Year</SelectItem>
                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                    <SelectItem value="4th Year">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Select value={department} onValueChange={setDepartment} disabled={!isEditing}>
                  <SelectTrigger className="text-base">
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                    <SelectItem value="Electronics & Communication Engineering">Electronics & Communication Engineering</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Mining Engineering">Mining Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Biotechnology / Biotechnology Engineering">Biotechnology / Biotechnology Engineering</SelectItem>
                    <SelectItem value="Applied Physics">Applied Physics</SelectItem>
                    <SelectItem value="Applied Chemistry">Applied Chemistry</SelectItem>
                    <SelectItem value="Applied Mathematics">Applied Mathematics</SelectItem>
                    <SelectItem value="BBA">BBA</SelectItem>
                    <SelectItem value="B.Com">B.Com</SelectItem>
                    <SelectItem value="MBA">MBA</SelectItem>
                    <SelectItem value="B.Des">B.Des</SelectItem>
                    <SelectItem value="BCA">BCA</SelectItem>
                    <SelectItem value="MCA">MCA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Personality Type</CardTitle>
              <CardDescription className="text-sm">Where do you fall on the introvert-extrovert spectrum?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Strongly Introverted</span>
                  <span>Strongly Extroverted</span>
                </div>
                <Slider
                  value={[personalityType]}
                  onValueChange={(value) => isEditing && setPersonalityType(value[0])}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                  disabled={!isEditing}
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="text-base px-4 py-2">
                    {personalityType === 1 && "Strongly Introverted"}
                    {personalityType === 2 && "Somewhat Introverted"}
                    {personalityType === 3 && "Balanced"}
                    {personalityType === 4 && "Somewhat Extroverted"}
                    {personalityType === 5 && "Strongly Extroverted"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl md:text-2xl">Match Intent</CardTitle>
              <CardDescription className="text-xs sm:text-sm">What are you looking for in connections?</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={matchIntent} onValueChange={setMatchIntent} disabled={!isEditing}>
                <div className="space-y-2 sm:space-y-3">
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation ${!isEditing ? "opacity-60" : ""}`}>
                    <RadioGroupItem value="Casual Friend" id="casual" disabled={!isEditing} />
                    <Label htmlFor="casual" className={`flex-1 text-sm sm:text-base ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}>Casual Friend</Label>
                  </div>
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation ${!isEditing ? "opacity-60" : ""}`}>
                    <RadioGroupItem value="Study Partner" id="study" disabled={!isEditing} />
                    <Label htmlFor="study" className={`flex-1 text-sm sm:text-base ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}>Study Partner</Label>
                  </div>
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation ${!isEditing ? "opacity-60" : ""}`}>
                    <RadioGroupItem value="Serious Relationship" id="serious" disabled={!isEditing} />
                    <Label htmlFor="serious" className={`flex-1 text-sm sm:text-base ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}>Serious Relationship</Label>
                  </div>
                  <div className={`flex items-center space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation ${!isEditing ? "opacity-60" : ""}`}>
                    <RadioGroupItem value="Networking/Mentor" id="networking" disabled={!isEditing} />
                    <Label htmlFor="networking" className={`flex-1 text-sm sm:text-base ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}>Networking/Mentor</Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}