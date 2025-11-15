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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  // Basic fields
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

  // Personality & Values
  const [personalityType, setPersonalityType] = useState("");
  const [topValues, setTopValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("");
  const [socialPreference, setSocialPreference] = useState("");
  const [lifestyleHabits, setLifestyleHabits] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState("");

  // Goals & Aspirations
  const [careerGoals, setCareerGoals] = useState<string[]>([]);
  const [newCareerGoal, setNewCareerGoal] = useState("");
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [newLearningGoal, setNewLearningGoal] = useState("");
  const [projectInterests, setProjectInterests] = useState<string[]>([]);
  const [newProjectInterest, setNewProjectInterest] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");

  // Enhanced Academic
  const [favoriteCourses, setFavoriteCourses] = useState<string[]>([]);
  const [newCourse, setNewCourse] = useState("");
  const [studyStyle, setStudyStyle] = useState("");
  const [academicStrengths, setAcademicStrengths] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState("");
  const [academicChallenges, setAcademicChallenges] = useState<string[]>([]);
  const [newChallenge, setNewChallenge] = useState("");

  // Preferences
  const [distancePreference, setDistancePreference] = useState("");
  const [connectionTypePriority, setConnectionTypePriority] = useState<string[]>([]);
  const [newPriority, setNewPriority] = useState("");

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
      
      // Personality & Values
      setPersonalityType(user.personalityType || "");
      setTopValues(user.topValues || []);
      setCommunicationStyle(user.communicationStyle || "");
      setSocialPreference(user.socialPreference || "");
      setLifestyleHabits(user.lifestyleHabits || []);
      
      // Goals
      setCareerGoals(user.careerGoals || []);
      setLearningGoals(user.learningGoals || []);
      setProjectInterests(user.projectInterests || []);
      setTimeCommitment(user.timeCommitment || "");
      
      // Academic
      setFavoriteCourses(user.favoriteCourses || []);
      setStudyStyle(user.studyStyle || "");
      setAcademicStrengths(user.academicStrengths || []);
      setAcademicChallenges(user.academicChallenges || []);
      
      // Preferences
      setDistancePreference(user.distancePreference || "");
      setConnectionTypePriority(user.connectionTypePriority || []);
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

  const handleAddValue = () => {
    if (newValue.trim() && !topValues.includes(newValue.trim()) && topValues.length < 5) {
      setTopValues([...topValues, newValue.trim()]);
      setNewValue("");
    }
  };

  const handleAddHabit = () => {
    if (newHabit.trim() && !lifestyleHabits.includes(newHabit.trim())) {
      setLifestyleHabits([...lifestyleHabits, newHabit.trim()]);
      setNewHabit("");
    }
  };

  const handleAddCareerGoal = () => {
    if (newCareerGoal.trim() && !careerGoals.includes(newCareerGoal.trim())) {
      setCareerGoals([...careerGoals, newCareerGoal.trim()]);
      setNewCareerGoal("");
    }
  };

  const handleAddLearningGoal = () => {
    if (newLearningGoal.trim() && !learningGoals.includes(newLearningGoal.trim())) {
      setLearningGoals([...learningGoals, newLearningGoal.trim()]);
      setNewLearningGoal("");
    }
  };

  const handleAddProjectInterest = () => {
    if (newProjectInterest.trim() && !projectInterests.includes(newProjectInterest.trim())) {
      setProjectInterests([...projectInterests, newProjectInterest.trim()]);
      setNewProjectInterest("");
    }
  };

  const handleAddCourse = () => {
    if (newCourse.trim() && !favoriteCourses.includes(newCourse.trim())) {
      setFavoriteCourses([...favoriteCourses, newCourse.trim()]);
      setNewCourse("");
    }
  };

  const handleAddStrength = () => {
    if (newStrength.trim() && !academicStrengths.includes(newStrength.trim())) {
      setAcademicStrengths([...academicStrengths, newStrength.trim()]);
      setNewStrength("");
    }
  };

  const handleAddChallenge = () => {
    if (newChallenge.trim() && !academicChallenges.includes(newChallenge.trim())) {
      setAcademicChallenges([...academicChallenges, newChallenge.trim()]);
      setNewChallenge("");
    }
  };

  const handleAddPriority = () => {
    if (newPriority.trim() && !connectionTypePriority.includes(newPriority.trim())) {
      setConnectionTypePriority([...connectionTypePriority, newPriority.trim()]);
      setNewPriority("");
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
        personalityType,
        topValues,
        communicationStyle,
        socialPreference,
        lifestyleHabits,
        careerGoals,
        learningGoals,
        projectInterests,
        timeCommitment,
        favoriteCourses,
        studyStyle,
        academicStrengths,
        academicChallenges,
        distancePreference,
        connectionTypePriority,
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
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Your Profile</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete your profile to get better matches and connections
          </p>
        </motion.div>

        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Profile Picture</CardTitle>
              <CardDescription className="text-sm">Choose an avatar that represents you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary/20">
                  <AvatarImage src={selectedAvatar} alt="Profile" />
                  <AvatarFallback>
                    {name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
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
                    <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                      <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    </Avatar>
                    {selectedAvatar === avatar && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                        <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Basic Information</CardTitle>
              <CardDescription className="text-sm">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                  className="text-base resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City or college name"
                  className="text-base"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Interests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Interests</CardTitle>
              <CardDescription className="text-sm">Add your passions and hobbies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  placeholder="Add an interest"
                  onKeyDown={(e) => e.key === "Enter" && handleAddInterest()}
                  className="flex-1 text-base"
                />
                <Button onClick={handleAddInterest} className="w-full sm:w-auto">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <Badge key={interest} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
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

        {/* Skills */}
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
                />
                <Button onClick={handleAddSkill} className="w-full sm:w-auto">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
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

        {/* Academic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Academic Information</CardTitle>
              <CardDescription className="text-sm">Help others find you based on your academic profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Year of Study</label>
                <Input
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  placeholder="e.g., Freshman, Sophomore, Junior, Senior"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Department</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g., Engineering, Arts, Sciences"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Major</label>
                <Input
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="e.g., Computer Science, Psychology"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Study Style</label>
                <Select value={studyStyle} onValueChange={setStudyStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your study style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="visual">Visual Learner</SelectItem>
                    <SelectItem value="auditory">Auditory Learner</SelectItem>
                    <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                    <SelectItem value="mixed">Mixed Style</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Favorite Courses</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    placeholder="Add a course"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCourse()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddCourse} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {favoriteCourses.map((course) => (
                    <Badge key={course} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {course}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setFavoriteCourses(favoriteCourses.filter((c) => c !== course))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Academic Strengths</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    placeholder="Add a strength"
                    onKeyDown={(e) => e.key === "Enter" && handleAddStrength()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddStrength} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {academicStrengths.map((strength) => (
                    <Badge key={strength} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {strength}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setAcademicStrengths(academicStrengths.filter((s) => s !== strength))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Academic Challenges</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    placeholder="Add a challenge"
                    onKeyDown={(e) => e.key === "Enter" && handleAddChallenge()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddChallenge} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {academicChallenges.map((challenge) => (
                    <Badge key={challenge} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {challenge}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setAcademicChallenges(academicChallenges.filter((c) => c !== challenge))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personality & Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Personality & Values</CardTitle>
              <CardDescription className="text-sm">Help us understand who you are</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Personality Type</label>
                <Input
                  value={personalityType}
                  onChange={(e) => setPersonalityType(e.target.value)}
                  placeholder="e.g., INTJ, Extroverted, Creative"
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Communication Style</label>
                <Select value={communicationStyle} onValueChange={setCommunicationStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your communication style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="diplomatic">Diplomatic</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Social Preference</label>
                <Select value={socialPreference} onValueChange={setSocialPreference}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your social preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="introvert">Introvert</SelectItem>
                    <SelectItem value="extrovert">Extrovert</SelectItem>
                    <SelectItem value="ambivert">Ambivert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Top Values (up to 5)</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g., Honesty, Growth, Creativity"
                    onKeyDown={(e) => e.key === "Enter" && handleAddValue()}
                    className="flex-1 text-base"
                    disabled={topValues.length >= 5}
                  />
                  <Button onClick={handleAddValue} className="w-full sm:w-auto" disabled={topValues.length >= 5}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topValues.map((value) => (
                    <Badge key={value} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {value}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setTopValues(topValues.filter((v) => v !== value))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Lifestyle Habits</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="e.g., Morning Person, Active, Organized"
                    onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddHabit} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lifestyleHabits.map((habit) => (
                    <Badge key={habit} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {habit}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLifestyleHabits(lifestyleHabits.filter((h) => h !== habit))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals & Aspirations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Goals & Aspirations</CardTitle>
              <CardDescription className="text-sm">Share your ambitions and what you're working towards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Career Goals</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newCareerGoal}
                    onChange={(e) => setNewCareerGoal(e.target.value)}
                    placeholder="e.g., Software Engineer, Entrepreneur"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCareerGoal()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddCareerGoal} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {careerGoals.map((goal) => (
                    <Badge key={goal} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {goal}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setCareerGoals(careerGoals.filter((g) => g !== goal))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Learning Goals</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newLearningGoal}
                    onChange={(e) => setNewLearningGoal(e.target.value)}
                    placeholder="e.g., Learn Python, Master Public Speaking"
                    onKeyDown={(e) => e.key === "Enter" && handleAddLearningGoal()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddLearningGoal} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {learningGoals.map((goal) => (
                    <Badge key={goal} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {goal}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setLearningGoals(learningGoals.filter((g) => g !== goal))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Project Interests</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newProjectInterest}
                    onChange={(e) => setNewProjectInterest(e.target.value)}
                    placeholder="e.g., Hackathons, Research, Startups"
                    onKeyDown={(e) => e.key === "Enter" && handleAddProjectInterest()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddProjectInterest} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projectInterests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {interest}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setProjectInterests(projectInterests.filter((i) => i !== interest))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time Commitment</label>
                <Select value={timeCommitment} onValueChange={setTimeCommitment}>
                  <SelectTrigger>
                    <SelectValue placeholder="How much time can you dedicate?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High (10+ hours/week)</SelectItem>
                    <SelectItem value="medium">Medium (5-10 hours/week)</SelectItem>
                    <SelectItem value="low">Low (1-5 hours/week)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Connection Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">Connection Preferences</CardTitle>
              <CardDescription className="text-sm">What are you looking for in connections?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Looking For</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newLookingFor}
                    onChange={(e) => setNewLookingFor(e.target.value)}
                    placeholder="e.g., Study Partner, Project Collaborator, Friend"
                    onKeyDown={(e) => e.key === "Enter" && handleAddLookingFor()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddLookingFor} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {lookingFor.map((item) => (
                    <Badge key={item} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
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
                  className="text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Distance Preference</label>
                <Select value={distancePreference} onValueChange={setDistancePreference}>
                  <SelectTrigger>
                    <SelectValue placeholder="How far are you willing to connect?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="campus">Campus Only</SelectItem>
                    <SelectItem value="city">City Wide</SelectItem>
                    <SelectItem value="anywhere">Anywhere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Connection Type Priority</label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <Input
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    placeholder="e.g., Study Partner, Friend, Mentor"
                    onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
                    className="flex-1 text-base"
                  />
                  <Button onClick={handleAddPriority} className="w-full sm:w-auto">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {connectionTypePriority.map((priority) => (
                    <Badge key={priority} variant="secondary" className="gap-1 text-sm py-1.5 px-3">
                      {priority}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setConnectionTypePriority(connectionTypePriority.filter((p) => p !== priority))}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="pb-6"
        >
          <Button onClick={handleSave} disabled={saving} size="lg" className="w-full text-base py-6">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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