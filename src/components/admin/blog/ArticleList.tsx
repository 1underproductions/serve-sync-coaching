
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Article {
  id: string;
  title: string;
  status: string;
  category: string;
  created_at: string;
  slug: string;
}

export const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Attempting to fetch articles with direct query...");
      
      // Get the access token first to use in the direct fetch
      const { data: session } = await supabase.auth.getSession();
      
      if (!session || !session.session) {
        throw new Error("No authenticated session available");
      }
      
      // Using the JavaScript REST API with explicit auth token to bypass RLS issues
      const response = await fetch(
        `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/blog_articles?select=id,title,status,category,created_at,slug`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching articles:", errorText);
        throw new Error(`Failed to fetch articles: ${errorText}`);
      }

      const data = await response.json();
      console.log("Successfully fetched articles:", data);
      setArticles(data || []);
    } catch (err) {
      console.error("Exception fetching articles:", err);
      setError("An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while fetching articles",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const publishArticle = async (id: string) => {
    try {
      // First get the current session to use the access token
      const { data: session } = await supabase.auth.getSession();
      
      if (!session || !session.session) {
        throw new Error("No authenticated session available");
      }
      
      // Use direct fetch with Authorization header to avoid RLS recursion
      const response = await fetch(
        `https://cugwtwpgccpcjeumrkxf.supabase.co/rest/v1/blog_articles?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1Z3d0d3BnY2NwY2pldW1ya3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzNjA1MDEsImV4cCI6MjA1ODkzNjUwMX0.DjWV3Jt7OcVaJh4QYQ8NsBpPtrI1m8FJ5O3n-SHhMrk',
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            status: 'published',
            published_at: new Date().toISOString()
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error publishing article:", errorText);
        throw new Error(`Failed to publish article: ${errorText}`);
      }

      toast({
        title: "Success",
        description: "Article published successfully",
      });
      
      fetchArticles();
    } catch (err) {
      console.error("Exception publishing article:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while publishing the article",
      });
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tennis-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No articles found. Create your first article by clicking the "New Article" button.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {articles.map((article) => (
          <TableRow key={article.id}>
            <TableCell>{article.title}</TableCell>
            <TableCell>{article.category || 'Uncategorized'}</TableCell>
            <TableCell>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {article.status}
              </span>
            </TableCell>
            <TableCell>
              {new Date(article.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                {article.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => publishArticle(article.id)}
                  >
                    Publish
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Edit functionality will be available soon",
                    });
                  }}
                >
                  Edit
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
