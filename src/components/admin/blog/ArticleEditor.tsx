
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

export const ArticleEditor = ({ onSaveSuccess }: { onSaveSuccess?: () => void }) => {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm<ArticleFormData>();

  const formValues = watch();

  const onSubmit = async (data: ArticleFormData, publishDirectly = false) => {
    try {
      setIsSubmitting(true);
      
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        throw new Error("No authenticated session available");
      }
      
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      console.log("Creating blog article with image:", imageUrl);
      
      const { error } = await supabase
        .from('blog_articles')
        .insert({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          image_url: imageUrl,
          status: publishDirectly ? 'published' : 'draft',
          published_at: publishDirectly ? new Date().toISOString() : null,
          author_id: userData.user.id,
          slug: slug
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: publishDirectly ? "Article published successfully" : "Article saved as draft",
      });
      
      if (publishDirectly || !imageUrl) {
        // Only reset and redirect if publishing or if no image was being uploaded
        reset();
        setImageUrl("");
        
        // Call the onSaveSuccess callback to return to the article list
        if (onSaveSuccess) {
          onSaveSuccess();
        }
      }
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

  const handleSaveAndReturn = () => {
    handleSubmit((data) => onSubmit(data, false))();
  };

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, false))} className="space-y-6">
      <div>
        <Input
          {...register("title", { required: true })}
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
          {...register("content", { required: true })}
          placeholder="Article content..."
          className="min-h-[400px]"
        />
      </div>
      
      <div className="space-y-4">
        {imageUrl && (
          <div className="rounded-lg overflow-hidden border bg-gray-50 p-4">
            <p className="text-sm text-gray-500 mb-2">Featured image preview:</p>
            <img 
              src={imageUrl} 
              alt="Article preview" 
              className="h-48 w-full object-cover rounded-md"
            />
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
          type="button"
          variant="outline"
          onClick={onSaveSuccess}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit((data) => onSubmit(data, true))}
          variant="default"
          className="bg-green-600 hover:bg-green-700"
        >
          Publish Now
        </Button>
        {imageUrl && (
          <Button
            type="button"
            onClick={handleSaveAndReturn}
            disabled={isSubmitting}
          >
            Save and Return
          </Button>
        )}
      </div>
    </form>
  );
};
