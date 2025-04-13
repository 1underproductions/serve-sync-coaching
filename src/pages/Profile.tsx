
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { ProfilePicture } from "@/components/profile/ProfilePicture";
import { QualificationsCard } from "@/components/profile/QualificationsCard";
import { PricingCard } from "@/components/profile/PricingCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileAlert } from "@/components/profile/ProfileAlert";
import { supabase } from "@/lib/supabase";
import BookingLinkGenerator from "@/components/profile/BookingLinkGenerator";

const Profile = () => {
  const { profile, isLoading: authLoading, user, fetchUserProfile } = useAuth();
  const [showProfilePrompt, setShowProfilePrompt] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Fetch profile on initial load to ensure we have fresh data
  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        setIsProfileLoading(true);
        try {
          console.log('Profile page: Fetching user profile on initial load');
          
          // Direct DB query to get fresh profile data
          const { data, error } = await supabase.from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error('Error fetching profile directly:', error);
          } else if (data) {
            console.log('Profile fetched successfully via direct query:', data);
          }
          
          // Also refresh through auth context
          await fetchUserProfile(user.id);
        } catch (error) {
          console.error('Error fetching profile on Profile page:', error);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        console.log('Profile page: No user ID available yet');
        setIsProfileLoading(false);
      }
    };
    
    loadProfile();
  }, [user?.id, fetchUserProfile]);
  
  // Update prompt visibility when profile changes
  useEffect(() => {
    if (profile) {
      console.log('Profile page: Profile data available:', profile);
      const isProfileIncomplete = !profile.bio || !profile.location || !profile.phone || !profile.years_experience;
      setShowProfilePrompt(isProfileIncomplete);
    }
  }, [profile]);

  const handleProfileUpdate = async (isComplete: boolean) => {
    setShowProfilePrompt(!isComplete);
    // Refresh profile data after update
    if (user?.id) {
      try {
        await fetchUserProfile(user.id);
      } catch (error) {
        console.error('Error refreshing profile after update:', error);
      }
    }
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
        
        <BookingLinkGenerator />
        
        <ProfileForm onProfileUpdate={handleProfileUpdate} />
      </div>
    </Layout>
  );
};

export default Profile;
