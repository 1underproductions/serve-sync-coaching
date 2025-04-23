
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
import { AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";
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
  const [refreshing, setRefreshing] = useState(false);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching articles with Supabase client...");
      
      // With our fixed RLS policies, we can now use the Supabase client directly
      const { data, error } = await supabase
        .from('blog_articles')
        .select('id,title,status,category,created_at,slug')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching articles:", error);
        throw new Error(`Failed to fetch articles: ${error.message}`);
      }

      console.log("Successfully fetched articles:", data);
      setArticles(data || []);
    } catch (err: any) {
      console.error("Exception fetching articles:", err);
      setError(err.message || "An unexpected error occurred");
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred while fetching articles",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const publishArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Error publishing article:", error);
        throw new Error(`Failed to publish article: ${error.message}`);
      }

      toast({
        title: "Success",
        description: "Article published successfully",
      });
      
      fetchArticles();
    } catch (err: any) {
      console.error("Exception publishing article:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred while publishing the article",
      });
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArticles();
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
        <AlertDescription className="space-y-4">
          <p>{error}</p>
          <div className="mt-4">
            <Button variant="outline" onClick={handleRefresh} size="sm" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Trying Again...' : 'Try Again'}
            </Button>
          </div>
        </AlertDescription>
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
