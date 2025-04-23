
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ArticleFormData {
  title: string;
  content: string;
  excerpt: string;
  category: string;
}

export const ArticleEditor = () => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ArticleFormData>();

  const onSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      
      // Get the current session for authentication
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!sessionData?.session || !userData?.user) {
        throw new Error("No authenticated session available");
      }
      
      // Generate a slug from the title
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Use direct fetch with Authorization header to avoid RLS recursion
      const response = await fetch(
        `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/blog_articles`,
        {
          method: 'POST',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            excerpt: data.excerpt,
            category: data.category,
            image_url: imageUrl,
            status: 'draft',
            author_id: userData.user.id,
            slug: slug
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error creating article:", errorText);
        throw new Error(`Failed to create article: ${errorText}`);
      }

      toast({
        title: "Success",
        description: "Article saved as draft",
      });
      
      reset();
      setImageUrl("");
    } catch (error: any) {
      console.error("Error creating article:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save article",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Input
          {...register("title")}
          placeholder="Article Title"
          className="text-lg font-bold"
        />
      </div>
      
      <div>
        <Input
          {...register("category")}
          placeholder="Category (e.g., Training, Business, Technology)"
        />
      </div>
      
      <div>
        <Textarea
          {...register("excerpt")}
          placeholder="Brief excerpt (appears in article previews)"
          className="h-20"
        />
      </div>
      
      <div>
        <Textarea
          {...register("content")}
          placeholder="Article content..."
          className="min-h-[400px]"
        />
      </div>
      
      <div>
        <ImageUploader
          bucket="blog-images"
          onUploadComplete={(url) => setImageUrl(url)}
          className="w-full"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save as Draft"}
        </Button>
      </div>
    </form>
  );
};
