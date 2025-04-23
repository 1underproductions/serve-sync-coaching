
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { error } = await supabase
        .from('blog_articles')
        .insert({
          ...data,
          image_url: imageUrl,
          status: 'draft',
          author_id: (await supabase.auth.getUser()).data.user?.id,
          slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article saved as draft",
      });
      
      reset();
      setImageUrl("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save article",
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
          Save as Draft
        </Button>
      </div>
    </form>
  );
};
