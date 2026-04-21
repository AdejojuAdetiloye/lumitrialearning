import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Shield, Clock, Users, Award, Lock, Sparkles } from "lucide-react";
import {
  TIER_DEFINITIONS,
  formatLocalizedPrice,
} from "@/lib/pricing";
import { usePublicPricing } from "@/hooks/usePublicPricing";

const benefits = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "All payments processed securely via Flutterwave with trusted local and international methods.",
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Book sessions at times that work best for you and your family.",
  },
  {
    icon: Users,
    title: "Expert Tutors",
    description: "Learn from qualified tutors who understand your needs.",
  },
  {
    icon: Award,
    title: "Money-Back Guarantee",
    description: "Full refund before your first session if you're not satisfied.",
  },
];

const Pricing = () => {
  const { country, pricing } = usePublicPricing();
  const tierCards = useMemo(
    () =>
      TIER_DEFINITIONS.map((tier, index) => ({
        ...tier,
        price: pricing.prices[tier.id],
        popular: index === 1,
      })),
    [pricing.prices]
  );

  return (
    <>
      <Helmet>
        <title>Pricing | Lumitria - Affordable Tutoring Plans</title>
        <meta 
          name="description" 
          content="Age-based tutoring tiers from Rookies to Veteran, with pricing in NGN, USD, CAD, or GBP by country. Secure payments, flexible scheduling, expert tutors." 
        />
        <meta name="keywords" content="tutoring prices, online tutoring cost, affordable tutoring, global tutors, education packages" />
        <link rel="canonical" href="https://lumitrialearning.org/pricing" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="overflow-x-hidden pt-20 md:pt-24 pb-12 md:pb-16">
          {/* Hero Section */}
          <section className="relative py-16 md:py-20 mesh-hero-bg">
            <div className="container mx-auto max-w-[1280px] px-4 sm:px-6">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block text-primary font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mb-3 md:mb-4">
                  Simple Pricing
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground mb-4 md:mb-6 px-4 sm:px-0 leading-tight">
                  Investment in Your{" "}
                  <span className="text-gradient animate-gradient">Future</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground px-4 sm:px-0 leading-[1.7]">
                  Affordable packages designed to provide maximum value. 
                  Choose the plan that works best for you.
                </p>
                <p className="mt-3 text-xs text-muted-foreground">Currency: {pricing.currencyCode}</p>
              </div>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto">
                {tierCards.map((tier, index) => {
                  return (
                    <Card
                      key={tier.id}
                      variant={tier.popular ? "pricing-popular" : "pricing"}
                      className={`relative opacity-0 animate-fade-up hover-lift transition-smooth ${tier.popular ? "lg:-mt-4 lg:mb-4" : ""}`}
                      style={{ animationDelay: `${index * 0.15}s` }}
                    >
                      {tier.popular && (
                        <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2 z-10">
                          <span className="bg-gradient-cta text-primary-foreground text-xs md:text-sm font-bold px-3 md:px-4 py-1 md:py-1.5 rounded-full shadow-button">
                            Most Popular
                          </span>
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-2 pt-6 md:pt-4">
                        <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto rounded-xl ${tier.popular ? "bg-primary" : "bg-muted"} flex items-center justify-center mb-3 md:mb-4`}>
                          <Sparkles className={`w-5 h-5 md:w-6 md:h-6 ${tier.popular ? "text-primary-foreground" : "text-primary"}`} />
                        </div>
                        <CardTitle className="font-display text-xl md:text-2xl">{tier.name}</CardTitle>
                        <CardDescription className="text-sm">{tier.ageRange}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="text-center">
                        <div className="py-4 md:py-6">
                          <span className="text-3xl md:text-4xl font-extrabold text-foreground block">
                            {formatLocalizedPrice(country, tier.price, pricing)}
                          </span>
                          <p className="text-xs md:text-sm text-muted-foreground mt-2 px-2">
                            {tier.description}
                          </p>
                        </div>
                        
                        <ul className="space-y-3 text-left">
                          {[
                            "8 live sessions (60 min each)",
                            "Personalized learning plan",
                            "Progress updates",
                            "WhatsApp support",
                          ].map((feature) => (
                            <li key={`${tier.id}-${feature}`} className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded-full ${tier.popular ? "bg-primary" : "bg-secondary"} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                <Check className="w-3 h-3 text-primary-foreground" />
                              </div>
                              <span className="text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      
                      <CardFooter className="pt-4">
                        <Link to="/register" className="w-full">
                          <Button
                            variant={tier.popular ? "hero" : "outline"}
                            size="lg"
                            className="w-full hover-scale transition-smooth"
                          >
                            Get Started
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>

              {/* Trust Note */}
              <p className="text-center text-muted-foreground text-sm mt-12 inline-flex items-center justify-center gap-2 w-full">
                <Lock className="w-4 h-4 text-primary" />
                <span>Secure payments via Flutterwave • Full refund before first session • Cancel anytime</span>
              </p>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-12 md:py-16 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Why Choose Our Plans?</h2>
                  <p className="text-muted-foreground text-sm md:text-base">
                    Everything you need for a successful learning journey
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <Card
                        key={benefit.title}
                        variant="elevated"
                        className="opacity-0 animate-fade-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <CardContent className="p-4 md:p-6">
                          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-lumitria-orange-light flex items-center justify-center mb-3 md:mb-4">
                            <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                          <p className="text-sm md:text-base text-muted-foreground">{benefit.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 md:mb-4">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Can I cancel anytime?</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your current billing period.
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">What if I'm not satisfied?</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        We offer a full money-back guarantee before your first session. If you're not completely satisfied, we'll refund your payment.
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">How do I schedule sessions?</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        After enrollment, you'll receive a WhatsApp message from our team to schedule your sessions at times convenient for you.
                      </p>
                    </CardContent>
                  </Card>
                  <Card variant="elevated">
                    <CardContent className="p-4 md:p-6">
                      <h3 className="font-bold text-base md:text-lg text-foreground mb-2">Are sessions recorded?</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Premium plan includes access to all session recordings. Other plans can request recordings for an additional fee.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Pricing;

