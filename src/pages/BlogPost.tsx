import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: string;
  published_at: string;
  created_at: string;
  author: {
    full_name: string;
  };
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        
        if (!slug) {
          navigate("/blog");
          return;
        }
        
        console.log("Fetching blog post with slug:", slug);
        
        const { data, error } = await supabase
          .from('blog_articles')
          .select(`
            id, 
            title, 
            content,
            excerpt,
            image_url,
            category,
            published_at,
            created_at,
            author_id
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();
        
        if (error) {
          console.error("Error fetching blog post:", error);
          throw new Error(`Failed to fetch article: ${error.message}`);
        }
        
        if (!data) {
          navigate("/blog");
          return;
        }
        
        // Set default author as Tennexis
        const author = { full_name: "Tennexis" };
        
        setPost({ ...data, author });
      } catch (error: any) {
        console.error("Error loading blog post:", error);
        toast({
          variant: "destructive",
          title: "Error loading article",
          description: "Unable to load the blog article. Please try again later.",
        });
        navigate("/blog");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [slug, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 bg-gray-50">
          <div className="container max-w-4xl">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-gray-200 rounded-lg" />
              <div className="h-8 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!post) {
    return null; // We'll redirect in the useEffect
  }

  const displayDate = post.published_at ? new Date(post.published_at) : new Date(post.created_at);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-tennis-green-600 hover:text-tennis-green-700 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all articles
          </Link>
          
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {post.image_url && (
              <div className="aspect-[21/9] overflow-hidden">
                <img 
                  src={post.image_url} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center mr-4 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {displayDate.toLocaleDateString()}
                </span>
                <span className="flex items-center mr-4 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  {post.author?.full_name || "Unknown Author"}
                </span>
                {post.category && (
                <span className="flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-1" />
                  {post.category || "Uncategorized"}
                </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-bold mb-6">
                {post.title}
              </h1>
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="mt-10 pt-6 border-t">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-tennis-green-100 text-tennis-green-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {post.author.full_name.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{post.author.full_name}</p>
                    <p className="text-sm text-gray-600">Tennis Coach</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
