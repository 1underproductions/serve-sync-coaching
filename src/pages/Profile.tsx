
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { ProfilePicture } from "@/components/profile/ProfilePicture";
import { QualificationsCard } from "@/components/profile/QualificationsCard";
import { PricingCard } from "@/components/profile/PricingCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAlert } from "@/components/profile/ProfileAlert";
import BookingLinkGenerator from "@/components/profile/BookingLinkGenerator";

const Profile = () => {
  const { profile, isLoading: authLoading, user, fetchUserProfile } = useAuth();
  const [showProfilePrompt, setShowProfilePrompt] = useState(true);

  // Fetch profile on initial load only
  useEffect(() => {
    if (user?.id && !profile) {
      console.log('Profile page: Initial profile fetch for user:', user.id);
      fetchUserProfile(user.id);
    }
  }, [user?.id, profile, fetchUserProfile]);
  
  // Update prompt visibility when profile changes
  useEffect(() => {
    if (profile) {
      console.log('Profile page: Profile data available:', profile);
      const isProfileIncomplete = !profile.bio || !profile.location || !profile.phone || !profile.years_experience;
      setShowProfilePrompt(isProfileIncomplete);
    }
  }, [profile]);

  const handleProfileUpdate = async (isComplete: boolean) => {
    console.log('Profile page: handleProfileUpdate called with isComplete:', isComplete);
    setShowProfilePrompt(!isComplete);
    // No need to manually refresh - the updateProfile function in auth context handles this
  };

  if (authLoading) {
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
        
        <BookingLinkGenerator />
        
        <ProfileForm onProfileUpdate={handleProfileUpdate} />
      </div>
    </Layout>
  );
};

export default Profile;
