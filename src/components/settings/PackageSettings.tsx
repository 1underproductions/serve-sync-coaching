import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DollarSign, Package, Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PackageData } from "@/lib/supabase";

const PACKAGES_KEY = 'tennexis.packages';

const packageFormSchema = z.object({
  name: z.string().min(2, { message: "Package name must be at least 2 characters" }),
  sessions: z.coerce.number().min(1, { message: "Must include at least 1 session" }),
  price: z.coerce.number().min(1, { message: "Price must be at least $1" }),
  description: z.string().default(""),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

const PackageSettings = () => {
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [editingPackage, setEditingPackage] = useState<string | null>(null);

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      sessions: 5,
      price: 0,
      description: "",
    },
  });

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

  const onSubmit = (data: PackageFormValues) => {
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
    form.reset({
      name: "",
      sessions: 5,
      price: 0,
      description: "",
    });
  };

  const calculateDiscount = (packagePrice: number, sessions: number) => {
    const hourlyRate = 50;
    const fullPrice = hourlyRate * sessions;
    
    if (fullPrice <= 0 || packagePrice >= fullPrice) return 0;
    
    const discountPercentage = Math.round(((fullPrice - packagePrice) / fullPrice) * 100);
    return discountPercentage;
  };

  const editPackage = (packageId: string) => {
    const packageToEdit = packages.find(pkg => pkg.id === packageId);
    if (packageToEdit) {
      form.reset({
        name: packageToEdit.name,
        sessions: packageToEdit.sessions,
        price: packageToEdit.price,
        description: packageToEdit.description || "",
      });
      setEditingPackage(packageId);
    }
  };

  const deletePackage = (packageId: string) => {
    const updatedPackages = packages.filter(pkg => pkg.id !== packageId);
    savePackages(updatedPackages);
    
    if (editingPackage === packageId) {
      setEditingPackage(null);
      form.reset({
        name: "",
        sessions: 5,
        price: 0,
        description: "",
      });
    }
    
    toast({
      title: "Package deleted",
      description: "The package has been removed from your offerings.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2 h-5 w-5 text-tennis-green-600" />
          <span>Package Offerings</span>
        </CardTitle>
        <CardDescription>
          Create discount packages for multiple sessions to encourage players to book more lessons.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {packages.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Your Package Offerings</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {packages.map((pkg) => (
                <div 
                  key={pkg.id} 
                  className="border rounded-lg p-4 relative hover:border-tennis-green-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{pkg.name}</h4>
                      <p className="text-sm text-muted-foreground">{pkg.sessions} sessions</p>
                      {pkg.description && (
                        <p className="text-sm mt-1">{pkg.description}</p>
                      )}
                    </div>
                    {pkg.discount > 0 && (
                      <Badge variant="custom" className="bg-tennis-blue-100 text-tennis-blue-800">
                        {pkg.discount}% off
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-2 flex items-baseline">
                    <span className="text-xl font-bold text-tennis-green-700">${pkg.price}</span>
                    <span className="text-sm text-muted-foreground ml-1">total</span>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => editPackage(pkg.id)}
                      className="text-xs"
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => deletePackage(pkg.id)}
                      className="text-xs text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg bg-muted/20">
            <Package className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h3 className="font-medium mb-1">No packages yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first package below to offer discounts for multiple sessions.
            </p>
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-sm font-medium mb-4">
            {editingPackage ? "Edit Package" : "Create New Package"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5-Session Package" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sessions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sessions</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Price ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          step="0.01" 
                          {...field} 
                          placeholder="0.00"
                        />
                      </FormControl>
                      <FormDescription>
                        Set below your hourly rate × sessions for a discount
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of this package" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                {editingPackage && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setEditingPackage(null);
                      form.reset({
                        name: "",
                        sessions: 5,
                        price: 0,
                        description: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="tennis">
                  {editingPackage ? (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Package
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Package
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
};

export default PackageSettings;
