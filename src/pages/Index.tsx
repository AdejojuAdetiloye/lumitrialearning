import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CoursesSection from "@/components/home/CoursesSection";
import PricingSection from "@/components/home/PricingSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Lumitria | Expert Tutors for Global Families</title>
        <meta 
          name="description" 
          content="Quality tutoring services for global families worldwide. Coding, STEM, African culture, and more - taught by passionate tutors. Starting at $10 per class, $80 per month." 
        />
        <meta name="keywords" content="global tutors, African education, coding classes, STEM tutoring, online tutoring, adult education" />
        <link rel="canonical" href="https://lumitrialearning.org" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        <main className="overflow-x-hidden">
          <HeroSection />
          <CoursesSection />
          <PricingSection />
          <TestimonialsSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
