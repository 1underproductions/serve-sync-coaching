
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
import { PackageData, supabase } from '@/lib/supabase';

export const PricingCard = () => {
  const navigate = useNavigate();
  const { profile, user, fetchUserProfile } = useAuth();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayRate, setDisplayRate] = useState<number>(0);
  
  // Fetch fresh profile data when component mounts
  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          console.log('PricingCard: Fetching fresh profile data');
          
          // Direct query to get the latest hourly rate
          const { data, error } = await supabase
            .from('profiles')
            .select('hourly_rate')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching hourly rate:', error);
          } else if (data && data.hourly_rate !== null) {
            console.log('Hourly rate fetched directly:', data.hourly_rate);
            setDisplayRate(Number(data.hourly_rate));
          }
          
          // Also refresh the full profile
          await fetchUserProfile();
        } catch (error) {
          console.error('PricingCard: Error loading profile data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    loadProfileData();
  }, [user?.id, fetchUserProfile]);
  
  // Update display rate when profile changes
  useEffect(() => {
    if (profile && profile.hourly_rate !== null && profile.hourly_rate !== undefined) {
      console.log('PricingCard: Setting hourly rate from updated profile:', profile.hourly_rate);
      setDisplayRate(Number(profile.hourly_rate));
    }
  }, [profile]);

  // Load packages from Supabase
  useEffect(() => {
    const fetchPackages = async () => {
      if (!user?.id) return;
      
      try {
        console.log('PricingCard: Fetching packages from Supabase');
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching packages:', error);
        } else if (data) {
          console.log('Packages fetched successfully:', data);
          setPackages(data);
        }
      } catch (error) {
        console.error('Unexpected error fetching packages:', error);
      }
    };
    
    fetchPackages();
  }, [user?.id]);

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
          {isLoading ? (
            <div className="animate-pulse h-7 w-24 bg-gray-200 rounded"></div>
          ) : (
            <div className="text-xl font-bold text-tennis-green-700">
              ${displayRate}/hour
            </div>
          )}
        </div>
        
        {packages.length > 0 ? (
          <div>
            <h3 className="text-sm font-medium mb-2">Package Offerings</h3>
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-gray-50 p-3 rounded-md">
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
