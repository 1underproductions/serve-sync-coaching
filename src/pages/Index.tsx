
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/landing/Header';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import BenefitsSection from '@/components/landing/BenefitsSection';
import PricingSection from '@/components/landing/PricingSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

const Index = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Check if we should scroll to pricing section using sessionStorage
    const shouldScrollToPricing = sessionStorage.getItem('scrollToPricing');
    
    if (shouldScrollToPricing) {
      // Remove the flag
      sessionStorage.removeItem('scrollToPricing');
      
      // Wait a bit for the page to fully render
      setTimeout(() => {
        const pricingSection = document.getElementById('pricing');
        if (pricingSection) {
          pricingSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    
    // Handle hash navigation from other pages
    const hash = location.hash.replace('#', '');
    if (hash) {
      // Wait for the page to render
      setTimeout(() => {
        const section = document.getElementById(hash);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <BenefitsSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
