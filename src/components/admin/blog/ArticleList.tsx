
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
import { supabase } from "@/integrations/supabase/client";

interface Article {
  id: string;
  title: string;
  status: string;
  category: string;
  created_at: string;
}

export const ArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const { toast } = useToast();

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from('blog_articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch articles",
      });
      return;
    }

    setArticles(data);
  };

  const publishArticle = async (id: string) => {
    const { error } = await supabase
      .from('blog_articles')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to publish article",
      });
      return;
    }

    fetchArticles();
  };

  useEffect(() => {
    fetchArticles();
  }, []);

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
            <TableCell>{article.category}</TableCell>
            <TableCell>{article.status}</TableCell>
            <TableCell>
              {new Date(article.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {article.status === 'draft' && (
                <Button
                  size="sm"
                  onClick={() => publishArticle(article.id)}
                >
                  Publish
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
