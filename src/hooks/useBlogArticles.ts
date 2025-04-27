
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export const useBlogArticles = () => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      try {
        console.log("Fetching published blog articles...");
        
        const { data: articles, error } = await supabase
          .from('blog_articles')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });
          
        if (error) {
          console.error("Error fetching articles:", error);
          
          toast({
            variant: "destructive",
            title: "Error loading articles",
            description: "Unable to load blog articles. Please try again later.",
          });
          
          throw new Error(`Failed to fetch articles: ${error.message}`);
        }
        
        if (!articles || articles.length === 0) {
          return [];
        }
        
        // Add Tennexis as the default author for all articles
        const articlesWithAuthor = articles.map(article => ({
          ...article,
          author: { full_name: "Tennexis" }
        }));
        
        return articlesWithAuthor;
      } catch (error) {
        console.error("Error in useBlogArticles:", error);
        
        toast({
          variant: "destructive",
          title: "Error loading articles",
          description: "Unable to load blog articles. Please try again later.",
        });
        
        return [];
      }
    },
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    meta: {
      errorMessage: "An unexpected error occurred while fetching articles"
    }
  });
};
