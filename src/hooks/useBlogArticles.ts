
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      // First get the published blog articles
      const { data: articles, error } = await supabase
        .from('blog_articles')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      // Then for each article, get the author's information
      const articlesWithAuthors = await Promise.all(
        articles.map(async (article) => {
          // Get author's name separately to avoid RLS policy issues
          const { data: authorData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', article.author_id)
            .single();
          
          return {
            ...article,
            author: authorData || { full_name: "Unknown Author" }
          };
        })
      );
      
      return articlesWithAuthors;
    }
  });
};
