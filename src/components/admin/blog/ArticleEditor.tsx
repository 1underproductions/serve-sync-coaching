
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
  const { register, handleSubmit, reset, watch, formState } = useForm<ArticleFormData>();

  // Watch form values to prevent losing data during image upload
  const formValues = watch();

  const onSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      
      // Get current user for author_id
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error("No authenticated session available");
      }
      
      // Generate a slug from the title
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // With our fixed RLS policies, we can now use the Supabase client directly
      const { error } = await supabase
        .from('blog_articles')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          image_url: imageUrl,
          status: 'draft',
          author_id: userData.user.id,
          slug: slug
        });

      if (error) {
        console.error("Error creating article:", error);
        throw new Error(`Failed to create article: ${error.message}`);
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

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    toast({
      title: "Image added",
      description: "You can continue editing your article",
    });
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
        {imageUrl && (
          <div className="mb-2">
            <p className="text-sm text-gray-500 mb-1">Image selected:</p>
            <img src={imageUrl} alt="Article preview" className="h-32 w-auto object-cover rounded-md" />
          </div>
        )}
        <ImageUploader
          bucket="blog-images"
          onUploadComplete={handleImageUpload}
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
