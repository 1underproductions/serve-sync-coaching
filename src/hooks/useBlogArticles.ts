
import { useQuery } from "@tanstack/react-query";

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      try {
        // First get the published blog articles using a direct REST API approach
        // to completely bypass the RLS recursion issue
        const response = await fetch(
          `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/blog_articles?select=*&status=eq.published&order=published_at.desc`, 
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch articles: ${errorText}`);
        }
        
        const articles = await response.json();
        
        // Then for each article, get the author's information safely
        // using a similar direct REST API approach
        const articlesWithAuthors = await Promise.all(
          articles.map(async (article) => {
            try {
              // Get author's name using direct REST API call
              const authorResponse = await fetch(
                `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/profiles?id=eq.${article.author_id}&select=full_name`,
                {
                  headers: {
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
                    'Content-Type': 'application/json'
                  }
                }
              );
              
              if (!authorResponse.ok) {
                return {
                  ...article,
                  author: { full_name: "Unknown Author" }
                };
              }
              
              const authorData = await authorResponse.json();
              
              return {
                ...article,
                author: authorData && authorData[0] ? authorData[0] : { full_name: "Unknown Author" }
              };
            } catch (error) {
              console.error("Error fetching author data:", error);
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
        throw error;
      }
    }
  });
};
