
import React, { useEffect } from 'react';
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const Blog = () => {
  const isMobile = useIsMobile();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const blogPosts = [
    {
      id: "1",
      title: "5 Essential Drills to Improve Your Tennis Forehand",
      excerpt: "Master these five forehand drills that will help players of all levels improve their technique, power, and consistency.",
      image: "/lovable-uploads/262cd87f-693c-4e1a-bc5b-d3e801ceb62f.png",
      author: "James Wilson",
      date: "April 5, 2025",
      category: "Training"
    },
    {
      id: "2",
      title: "How to Structure Your Tennis Coaching Sessions for Maximum Impact",
      excerpt: "Learn how to organize your coaching sessions to ensure player engagement and skill development with these proven strategies.",
      image: "/lovable-uploads/dce6d83d-9eff-4392-bafc-16030017d7d8.png",
      author: "Sarah Thompson",
      date: "March 28, 2025",
      category: "Coaching"
    },
    {
      id: "3",
      title: "Tennis Business Growth: Attracting and Retaining Students",
      excerpt: "Discover practical strategies to grow your tennis coaching business by attracting new students and keeping your current ones engaged.",
      image: "/lovable-uploads/232441c8-5827-4d0c-aa6e-df7fd889e942.png",
      author: "Michael Rodriguez",
      date: "March 15, 2025",
      category: "Business"
    },
    {
      id: "4",
      title: "Technology in Tennis Coaching: Tools That Make a Difference",
      excerpt: "Explore how modern technology can enhance your coaching methods and provide better feedback to your students.",
      image: "/lovable-uploads/262cd87f-693c-4e1a-bc5b-d3e801ceb62f.png",
      author: "Emily Chen",
      date: "March 3, 2025",
      category: "Technology"
    },
  ];

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
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {post.date}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </span>
                  </div>
                  <Link to={`/blog/${post.id}`} className="block mb-3">
                    <h2 className="text-xl font-semibold hover:text-tennis-green-600 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link 
                    to={`/blog/${post.id}`}
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
