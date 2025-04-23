
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      // Join with profiles table to get author information
      const { data, error } = await supabase
        .from('blog_articles')
        .select(`
          *,
          author:profiles(full_name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });
};
