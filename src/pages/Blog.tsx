
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBlogArticles } from '@/hooks/useBlogArticles';

const Blog = () => {
  const isMobile = useIsMobile();
  const { data: blogPosts, isLoading } = useBlogArticles();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-12 bg-gray-50">
          <div className="container">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Tennis Coaching Blog</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Insights, tips and strategies to help you elevate your tennis coaching business and improve your players' performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts?.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {post.image_url && (
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <img 
                      src={post.image_url} 
                      alt={post.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author?.full_name}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="block mb-3">
                    <h2 className="text-xl font-semibold hover:text-tennis-green-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-tennis-green-600 hover:text-tennis-green-700 font-medium"
                  >
                    Read more <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
