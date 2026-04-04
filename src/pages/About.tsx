import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Target, Users, Award, Globe, BookOpen, Sparkles } from "lucide-react";

const values = [
  {
    icon: Heart,
    title: "Passion for Education",
    description: "We're driven by a genuine love for teaching and helping students of all ages reach their full potential.",
  },
  {
    icon: Target,
    title: "Excellence in Teaching",
    description: "Our tutors are highly qualified and committed to delivering the highest quality education.",
  },
  {
    icon: Users,
    title: "Cultural Connection",
    description: "We understand the unique needs of Nigerian families living abroad and help maintain cultural ties.",
  },
  {
    icon: Award,
    title: "Personalized Learning",
    description: "Every student is unique, and we tailor our approach to meet individual learning needs.",
  },
];

const stats = [
  { number: "100+", label: "Students Enrolled" },
  { number: "15+", label: "Expert Tutors" },
  { number: "4.9/5", label: "Average Rating" },
  { number: "50+", label: "Families Worldwide" },
];

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us | Lumitria - Empowering Nigerians Abroad</title>
        <meta 
          name="description" 
          content="Learn about Lumitria's mission to provide quality education and cultural connection for Nigerians of all ages living abroad. Expert tutors, personalized learning, and a commitment to excellence." 
        />
        <link rel="canonical" href="https://lumitrialearning.org/about" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="overflow-x-hidden pt-20 md:pt-24 pb-12 md:pb-16">
          {/* Hero Section */}
          <section className="relative py-16 md:py-20 mesh-hero-bg">
            <div className="container mx-auto max-w-[1280px] px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block text-primary font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mb-3 md:mb-4">
                  Our Story
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4 md:mb-6 px-4 sm:px-0 leading-tight">
                  Empowering Nigerians{" "}
                  <span className="text-gradient animate-gradient">Worldwide</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground px-4 sm:px-0 leading-[1.7]">
                  We're dedicated to providing quality education that connects you to your roots while preparing you for a bright future.
                </p>
              </div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="grid sm:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-lumitria-orange-light flex items-center justify-center mb-4 md:mb-6">
                      <Target className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      At Lumitria, we believe that every Nigerian living abroad deserves access to quality education that honors their heritage while preparing them for global success. Our mission is to bridge the gap between cultural identity and academic excellence.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We provide expert tutoring services that combine world-class education with meaningful cultural connection, helping students of all ages thrive academically while staying connected to their Nigerian roots.
                    </p>
                  </div>
                  <div>
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-lumitria-green-light flex items-center justify-center mb-4 md:mb-6">
                      <Globe className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Our Vision</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We envision a world where Nigerians in the diaspora have seamless access to quality education that celebrates their identity, builds their confidence, and prepares them to excel in any field they choose.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Through personalized learning, cultural enrichment, and expert guidance, we're building a community of confident, well-rounded individuals of all ages who are proud of their heritage and ready for the future.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Our Core Values</h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    The principles that guide everything we do
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {values.map((value, index) => {
                    const Icon = value.icon;
                    return (
                      <Card
                        key={value.title}
                        variant="elevated"
                        className="opacity-0 animate-fade-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-lumitria-orange-light flex items-center justify-center mb-3 md:mb-4">
                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{value.title}</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{value.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                  {stats.map((stat, index) => (
                    <div
                      key={stat.label}
                      className="text-center opacity-0 animate-fade-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1 md:mb-2">
                        {stat.number}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground px-2">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-lumitria-gold-light flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Why Choose Lumitria?</h2>
                  <p className="text-sm md:text-base text-muted-foreground px-4 sm:px-0">
                    What sets us apart in delivering exceptional education
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6 text-center">
                      <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-3 md:mb-4" />
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Expert Tutors</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        All our tutors are highly qualified, experienced, and passionate about teaching Nigerians of all ages.
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6 text-center">
                      <Users className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-3 md:mb-4" />
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Personalized Approach</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Every student receives individualized attention and a learning plan tailored to their unique needs.
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated" className="sm:col-span-2 lg:col-span-1">
                    <CardContent className="p-4 md:p-6 text-center">
                      <Globe className="w-6 h-6 md:w-8 md:h-8 text-accent mx-auto mb-3 md:mb-4" />
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Cultural Connection</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        We help students maintain their connection to Nigerian culture, language, and traditions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 md:mb-4 px-4 sm:px-0">
                  Join the Lumitria Family
                </h2>
                <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 px-4 sm:px-0">
                  Start your journey toward academic excellence and cultural connection today.
                </p>
                <Link to="/register">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Enroll Now
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default About;

