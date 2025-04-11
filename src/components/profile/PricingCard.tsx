
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { PackageData } from '@/lib/supabase';

export const PricingCard = () => {
  const navigate = useNavigate();
  const { profile, user, fetchUserProfile } = useAuth();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [displayRate, setDisplayRate] = useState<number>(0);
  
  // Initially refresh profile data when component mounts if user is logged in
  useEffect(() => {
    const refreshProfileData = async () => {
      if (user?.id) {
        try {
          console.log('PricingCard: Refreshing profile data on mount');
          await fetchUserProfile(user.id);
        } catch (error) {
          console.error('PricingCard: Error refreshing profile:', error);
        }
      }
    };
    
    refreshProfileData();
  }, [user?.id, fetchUserProfile]);
  
  // Initialize and update display rate whenever profile changes
  useEffect(() => {
    if (profile) {
      console.log('PricingCard: Profile updated:', profile);
      
      if (profile.hourly_rate !== null && profile.hourly_rate !== undefined) {
        console.log('PricingCard: Setting hourly rate from profile:', profile.hourly_rate);
        setDisplayRate(Number(profile.hourly_rate));
      } else {
        console.log('PricingCard: No hourly rate in profile, using default');
        setDisplayRate(0);
      }
    } else {
      console.log('PricingCard: No profile data available');
      setDisplayRate(0);
    }
  }, [profile]);

  useEffect(() => {
    // Load packages from localStorage
    const PACKAGES_KEY = 'tennexis.packages';
    const savedPackages = localStorage.getItem(PACKAGES_KEY);
    if (savedPackages) {
      try {
        setPackages(JSON.parse(savedPackages));
      } catch (error) {
        console.error('Error parsing packages from localStorage:', error);
        setPackages([]);
      }
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="mr-2 h-5 w-5 text-tennis-green-600" />
          Pricing Information
        </CardTitle>
        <CardDescription>
          Set your hourly rate and package offerings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Standard Hourly Rate</h3>
          <div className="text-xl font-bold text-tennis-green-700">
            ${displayRate}/hour
          </div>
        </div>
        
        {packages.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-2">Package Offerings</h3>
            <div className="space-y-3">
              {packages.map((pkg, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="font-medium">{pkg.name}</div>
                  <div className="text-sm text-gray-500">{pkg.sessions} sessions</div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-medium text-tennis-green-700">${pkg.price}</span>
                    {pkg.discount > 0 && (
                      <Badge variant="custom" className="bg-tennis-blue-100 text-tennis-blue-800">
                        {pkg.discount}% off
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 mb-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-700">
              You haven't created any packages yet. Set them up in the Settings page.
            </p>
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/settings')}
            className="text-tennis-green-700 border-tennis-green-200 hover:bg-tennis-green-50"
          >
            Manage Pricing in Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
