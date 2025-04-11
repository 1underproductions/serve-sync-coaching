
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Save } from "lucide-react";
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
import { CardFooter } from "@/components/ui/card";
import { PackageData } from "@/lib/supabase";

const packageFormSchema = z.object({
  name: z.string().min(2, { message: "Package name must be at least 2 characters" }),
  sessions: z.coerce.number().min(1, { message: "Must include at least 1 session" }),
  price: z.coerce.number().min(1, { message: "Price must be at least $1" }),
  description: z.string().default(""),
});

type PackageFormValues = z.infer<typeof packageFormSchema>;

type PackageFormProps = {
  editingPackage: string | null;
  setEditingPackage: (id: string | null) => void;
  onSubmit: (data: PackageFormValues) => void;
  packages: PackageData[];
  hourlyRate: number;
};

export const PackageForm = ({ 
  editingPackage,
  setEditingPackage,
  onSubmit,
  packages,
  hourlyRate
}: PackageFormProps) => {
  const packageForm = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: {
      name: "",
      sessions: 5,
      price: 0,
      description: "",
    },
  });

  const handleSubmit = (data: PackageFormValues) => {
    onSubmit(data);
    packageForm.reset({
      name: "",
      sessions: 5,
      price: 0,
      description: "",
    });
  };

  // Set form values when editing an existing package
  useState(() => {
    if (editingPackage) {
      const packageToEdit = packages.find(pkg => pkg.id === editingPackage);
      if (packageToEdit) {
        packageForm.reset({
          name: packageToEdit.name,
          sessions: packageToEdit.sessions,
          price: packageToEdit.price,
          description: packageToEdit.description || "",
        });
      }
    }
  });

  return (
    <div className="border-t pt-6">
      <h3 className="text-sm font-medium mb-4">
        {editingPackage ? "Edit Package" : "Create New Package"}
      </h3>
      <Form {...packageForm}>
        <form onSubmit={packageForm.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={packageForm.control}
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
              control={packageForm.control}
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
              control={packageForm.control}
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
            control={packageForm.control}
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
                  packageForm.reset({
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
  );
};
