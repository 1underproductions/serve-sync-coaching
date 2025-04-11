
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { PackageData } from "@/lib/supabase";

const PACKAGES_KEY = 'tennexis.packages';

export type PackageFormData = {
  name: string;
  sessions: number;
  price: number;
  description: string;
};

export const usePackages = (hourlyRate: number = 0) => {
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
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

  const savePackages = (updatedPackages: PackageData[]) => {
    setPackages(updatedPackages);
    localStorage.setItem(PACKAGES_KEY, JSON.stringify(updatedPackages));
  };

  const calculateDiscount = (packagePrice: number, sessions: number) => {
    const fullPrice = hourlyRate * sessions;
    
    if (fullPrice <= 0 || packagePrice >= fullPrice) return 0;
    
    const discountPercentage = Math.round(((fullPrice - packagePrice) / fullPrice) * 100);
    return discountPercentage;
  };

  const handleSubmit = (data: PackageFormData) => {
    if (editingPackage) {
      const updatedPackages = packages.map(pkg => 
        pkg.id === editingPackage 
          ? { 
              ...pkg, 
              ...data, 
              discount: calculateDiscount(data.price, data.sessions)
            } 
          : pkg
      );
      
      savePackages(updatedPackages);
      toast({
        title: "Package updated",
        description: `${data.name} has been updated.`,
      });
    } else {
      const newPackage: PackageData = {
        id: Date.now().toString(),
        name: data.name,
        sessions: data.sessions,
        price: data.price,
        description: data.description || "",
        discount: calculateDiscount(data.price, data.sessions)
      };
      
      savePackages([...packages, newPackage]);
      toast({
        title: "Package added",
        description: `${data.name} has been added to your packages.`,
      });
    }
    
    setEditingPackage(null);
  };

  const editPackage = (packageId: string) => {
    setEditingPackage(packageId);
  };

  const deletePackage = (packageId: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
    savePackages(updatedPackages);
    
    if (editingPackage === packageId) {
      setEditingPackage(null);
    }
    
    toast({
      title: "Package deleted",
      description: "The package has been removed from your offerings.",
    });
  };

  return {
    packages,
    editingPackage,
    setEditingPackage,
    handleSubmit,
    editPackage,
    deletePackage
  };
};
