
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
        
        // Now that RLS policies are fixed, we can use the Supabase client directly
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
        
        // For each article, get the author's information
        const articlesWithAuthors = await Promise.all(
          articles.map(async (article) => {
            try {
              if (!article.author_id) {
                return {
                  ...article,
                  author: { full_name: "Unknown Author" }
                };
              }
              
              // Get author using Supabase client
              const { data: authorData, error: authorError } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', article.author_id)
                .single();
              
              if (authorError || !authorData) {
                console.error(`Error fetching author for article ${article.id}:`, authorError);
                return {
                  ...article,
                  author: { full_name: "Unknown Author" }
                };
              }
              
              return {
                ...article,
                author: authorData
              };
            } catch (error) {
              console.error(`Error fetching author data for article ${article.id}:`, error);
              return {
                ...article,
                author: { full_name: "Unknown Author" }
              };
            }
          })
        );
        
        return articlesWithAuthors;
      } catch (error) {
        console.error("Error in useBlogArticles:", error);
        
        // Show a toast notification with a more user-friendly error message
        toast({
          variant: "destructive",
          title: "Error loading articles",
          description: "Unable to load blog articles. Please try again later.",
        });
        
        throw new Error("An unexpected error occurred while fetching articles");
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
