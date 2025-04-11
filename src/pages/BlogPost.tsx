
import React, { useEffect } from 'react';
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // This would usually come from an API, but for demo purposes we'll hardcode them
  const blogPosts = [
    {
      id: "1",
      title: "5 Essential Drills to Improve Your Tennis Forehand",
      content: `
        <p>A powerful and consistent forehand is a major weapon in any tennis player's arsenal. Whether you're coaching beginners or advanced players, these five drills will help them develop a more effective forehand stroke.</p>

        <h2>1. Shadow Swings with Proper Technique</h2>
        <p>Before even hitting a ball, have your players practice their forehand motion without a ball. Focus on proper grip, preparation, contact point, and follow-through. Have them perform 20-30 shadow swings, ensuring they maintain proper form throughout.</p>

        <h2>2. Wall Rally Progression</h2>
        <p>Wall drills are excellent for developing consistency. Start with players standing close to the wall, hitting soft forehand shots with proper technique. As they gain confidence, have them step back gradually and increase the pace. Challenge them to maintain a rally of 20-30 consecutive shots.</p>

        <h2>3. Target Practice</h2>
        <p>Place targets (cones, hoops, or towels) on the opposite court at varying distances and angles. Feed balls to your players and have them aim for these targets. This drill improves accuracy and helps players understand how to control direction and depth.</p>

        <h2>4. Recovery Forehand Drill</h2>
        <p>Tennis is all about movement. In this drill, players start at the center mark, move to hit a forehand, and then recover back to the center before moving to hit another forehand. This simulates match conditions and builds footwork and endurance while maintaining proper forehand technique.</p>

        <h2>5. Inside-Out Forehand Practice</h2>
        <p>The inside-out forehand is a crucial shot in modern tennis. Set up a drill where players must hit their forehand from the backhand corner across the court to the opponent's backhand side. This develops versatility and teaches players how to use their forehand as an offensive weapon from different court positions.</p>

        <h2>Implementation Tips</h2>
        <p>When incorporating these drills into your coaching sessions, remember:</p>
        <ul>
          <li>Start with technique before adding speed or complexity</li>
          <li>Provide clear, concise feedback after each repetition</li>
          <li>Gradually increase difficulty as players improve</li>
          <li>Make drills competitive to increase engagement</li>
          <li>Track progress to show improvement over time</li>
        </ul>

        <p>By consistently incorporating these drills into your coaching sessions, you'll help your players develop a reliable and powerful forehand that will serve them well in competitive play.</p>
      `,
      image: "/lovable-uploads/262cd87f-693c-4e1a-bc5b-d3e801ceb62f.png",
      author: "James Wilson",
      date: "April 5, 2025",
      category: "Training",
      authorRole: "Head Tennis Coach, Former ATP Touring Professional"
    },
    {
      id: "2",
      title: "How to Structure Your Tennis Coaching Sessions for Maximum Impact",
      content: `
        <p>The structure of your tennis coaching sessions can make the difference between incremental improvement and transformative progress for your players. Here's how to organize your sessions for maximum impact.</p>

        <h2>Clear Objectives for Each Session</h2>
        <p>Begin with defining what you aim to achieve in each session. Whether it's improving a specific stroke, working on footwork, or developing match tactics, having clear objectives helps focus your coaching and gives players a sense of purpose.</p>

        <h2>The Ideal Session Structure</h2>

        <h3>1. Warm-up (10-15 minutes)</h3>
        <p>Start with a dynamic warm-up that prepares the body for tennis-specific movements. Include light jogging, side shuffles, arm circles, and gentle stretching. Incorporate racquet and ball handling exercises to develop feel and coordination.</p>

        <h3>2. Technical Work (15-20 minutes)</h3>
        <p>Focus on stroke mechanics and technique. This is the time to introduce new techniques or refine existing ones. Keep explanations concise and demonstrate clearly. Provide individual feedback while players practice the strokes in a controlled environment.</p>

        <h3>3. Drilling (20-25 minutes)</h3>
        <p>Move into more dynamic drills that apply the techniques in patterns similar to match play. These should include movement, decision-making, and progressive difficulty. Examples include cross-court rallies, approach shot drills, or serving patterns.</p>

        <h3>4. Controlled Play (15-20 minutes)</h3>
        <p>Implement point play scenarios that focus on applying the day's lessons. You might create constraints like "points begin with a wide serve" or "player must approach the net after the third shot" to emphasize specific strategies.</p>

        <h3>5. Cool Down and Review (5-10 minutes)</h3>
        <p>End with a brief cool-down and a review of the session. Discuss what was learned, answer questions, and provide homework or focus areas for players to work on before the next session.</p>

        <h2>Adapting to Different Skill Levels</h2>

        <p>Beginner players need more technical focus and positive reinforcement. Intermediate players benefit from a balance of technique and tactics. Advanced players should spend more time on situational training and mental aspects of the game.</p>

        <h2>Keeping Sessions Engaging</h2>

        <p>Vary drills frequently to maintain interest. Include competitive elements like scoring systems or challenges. Use a variety of teaching aids such as targets, cones, or ball machines. And most importantly, infuse your personality and passion into each session.</p>

        <p>By thoughtfully structuring your coaching sessions with these principles in mind, you'll create a learning environment that produces consistent improvement and keeps players coming back for more.</p>
      `,
      image: "/lovable-uploads/dce6d83d-9eff-4392-bafc-16030017d7d8.png",
      author: "Sarah Thompson",
      date: "March 28, 2025",
      category: "Coaching",
      authorRole: "Tennis Academy Director, USPTA Elite Professional"
    },
    {
      id: "3",
      title: "Tennis Business Growth: Attracting and Retaining Students",
      content: `<p>Content for this blog post would go here...</p>`,
      image: "/lovable-uploads/232441c8-5827-4d0c-aa6e-df7fd889e942.png",
      author: "Michael Rodriguez",
      date: "March 15, 2025",
      category: "Business",
      authorRole: "Tennis Business Consultant"
    },
    {
      id: "4",
      title: "Technology in Tennis Coaching: Tools That Make a Difference",
      content: `<p>Content for this blog post would go here...</p>`,
      image: "/lovable-uploads/262cd87f-693c-4e1a-bc5b-d3e801ceb62f.png",
      author: "Emily Chen",
      date: "March 3, 2025",
      category: "Technology",
      authorRole: "Sports Technology Specialist"
    },
  ];
  
  const post = blogPosts.find(post => post.id === postId);
  
  if (!post) {
    // If post not found, redirect to blog list
    useEffect(() => {
      navigate("/blog");
    }, [navigate]);
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container max-w-4xl">
          <Link to="/blog" className="inline-flex items-center text-tennis-green-600 hover:text-tennis-green-700 mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to all articles
          </Link>
          
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-[21/9] overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                <span className="flex items-center mr-4 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  {post.date}
                </span>
                <span className="flex items-center mr-4 mb-2">
                  <User className="h-4 w-4 mr-1" />
                  {post.author}
                </span>
                <span className="flex items-center mb-2">
                  <Tag className="h-4 w-4 mr-1" />
                  {post.category}
                </span>
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
                    {post.author.split(' ').map(name => name[0]).join('')}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{post.author}</p>
                    <p className="text-sm text-gray-600">{post.authorRole}</p>
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
