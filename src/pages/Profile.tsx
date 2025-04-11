
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { ProfilePicture } from "@/components/profile/ProfilePicture";
import { QualificationsCard } from "@/components/profile/QualificationsCard";
import { PricingCard } from "@/components/profile/PricingCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAlert } from "@/components/profile/ProfileAlert";

const Profile = () => {
  const { profile, isLoading: authLoading, user } = useAuth();
  const [showProfilePrompt, setShowProfilePrompt] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Update prompt visibility when profile changes
  useEffect(() => {
    if (profile) {
      const isProfileIncomplete = !profile.bio || !profile.location || !profile.phone || !profile.years_experience;
      setShowProfilePrompt(isProfileIncomplete);
    }
  }, [profile]);

  const handleProfileUpdate = (isComplete: boolean) => {
    setShowProfilePrompt(!isComplete);
  };

  if (authLoading || isProfileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {showProfilePrompt && <ProfileAlert show={showProfilePrompt} />}
        
        <div className="grid gap-6 md:grid-cols-2">
          <ProfilePicture />
          <QualificationsCard />
        </div>
        
        <PricingCard />
        
        <ProfileForm onProfileUpdate={handleProfileUpdate} />
      </div>
    </Layout>
  );
};

export default Profile;
