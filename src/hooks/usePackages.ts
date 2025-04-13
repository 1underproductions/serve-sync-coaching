
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PackageData, supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export type PackageFormData = {
  name: string;
  sessions: number;
  price: number;
  description: string;
};

export const usePackages = (hourlyRate: number = 0) => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch packages from Supabase when component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('Fetching packages from Supabase');
        
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching packages:', error);
          toast({
            title: "Error fetching packages",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          console.log('Packages fetched successfully:', data);
          setPackages(data);
        }
      } catch (error: any) {
        console.error('Unexpected error fetching packages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackages();
  }, [user?.id, toast]);

  const calculateDiscount = (packagePrice: number, sessions: number) => {
    const fullPrice = hourlyRate * sessions;
    
    if (fullPrice <= 0 || packagePrice >= fullPrice) return 0;
    
    const discountPercentage = Math.round(((fullPrice - packagePrice) / fullPrice) * 100);
    return discountPercentage;
  };

  const handleSubmit = async (data: PackageFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to manage packages",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const discount = calculateDiscount(data.price, data.sessions);
      
      if (editingPackage) {
        // Update existing package in Supabase
        const { error } = await supabase
          .from('packages')
          .update({
            name: data.name,
            sessions: data.sessions,
            price: data.price,
            description: data.description || "",
            discount: discount
          })
          .eq('id', editingPackage);
          
        if (error) {
          console.error('Error updating package:', error);
          throw error;
        }
        
        // Update local state
        setPackages(prevPackages => 
          prevPackages.map(pkg => 
            pkg.id === editingPackage 
              ? { 
                  ...pkg, 
                  ...data, 
                  discount
                } 
              : pkg
          )
        );
        
        toast({
          title: "Package updated",
          description: `${data.name} has been updated.`,
        });
      } else {
        // Create new package in Supabase
        const { data: newPackage, error } = await supabase
          .from('packages')
          .insert({
            user_id: user.id,
            name: data.name,
            sessions: data.sessions,
            price: data.price,
            description: data.description || "",
            discount: discount
          })
          .select()
          .single();
          
        if (error) {
          console.error('Error creating package:', error);
          throw error;
        }
        
        if (newPackage) {
          // Update local state
          setPackages(prevPackages => [newPackage, ...prevPackages]);
          
          toast({
            title: "Package added",
            description: `${data.name} has been added to your packages.`,
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save package",
        variant: "destructive",
      });
    } finally {
      setEditingPackage(null);
    }
  };

  const editPackage = (packageId: string) => {
    setEditingPackage(packageId);
  };

  const deletePackage = async (packageId: string) => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId);
        
      if (error) {
        console.error('Error deleting package:', error);
        throw error;
      }
      
      // Update local state
      setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== packageId));
      
      if (editingPackage === packageId) {
        setEditingPackage(null);
      }
      
      toast({
        title: "Package deleted",
        description: "The package has been removed from your offerings.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    }
  };

  return {
    packages,
    isLoading,
    editingPackage,
    setEditingPackage,
    handleSubmit,
    editPackage,
    deletePackage
  };
};
