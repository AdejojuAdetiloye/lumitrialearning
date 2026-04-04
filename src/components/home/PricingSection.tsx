import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Lock, Sparkles } from "lucide-react";
import {
  TIER_DEFINITIONS,
  formatLocalizedPrice,
} from "@/lib/pricing";
import { usePublicPricing } from "@/hooks/usePublicPricing";
import { InView } from "@/components/motion/InView";
import { SectionHeader } from "@/components/home/SectionHeader";

const PricingSection = () => {
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
    <section id="pricing" className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-lumitria-cream/40 to-muted/20"
        aria-hidden
      />
      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px] relative z-10">
        <SectionHeader
          eyebrow="Simple Pricing"
          title={
            <>
              Investment in Your <span className="text-gradient animate-gradient">Future</span>
            </>
          }
          description="Affordable packages designed to provide maximum value. Choose the plan that works best for you."
        />

        <InView className="mb-12 flex flex-col items-center gap-3" y={20}>
          <p className="text-xs font-medium text-muted-foreground">Currency: {pricing.currencyCode}</p>
        </InView>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {tierCards.map((tier, index) => (
            <InView key={tier.id} delay={index * 0.07} y={40}>
              <Card
                variant={tier.popular ? "pricing-popular" : "pricing"}
                className={`relative h-full transition-all duration-500 hover:shadow-glow ${
                  tier.popular ? "lg:-mt-3 lg:mb-3" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 md:-top-4">
                    <span className="rounded-full bg-gradient-cta px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-button md:text-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="pb-2 pt-8 text-center md:pt-6">
                  <div
                    className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl md:h-14 md:w-14 ${
                      tier.popular
                        ? "bg-gradient-cta text-primary-foreground shadow-button"
                        : "border border-white/50 bg-background/60 text-primary backdrop-blur-md"
                    }`}
                  >
                    <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <CardTitle className="font-display text-xl md:text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.ageRange}</CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="py-4 md:py-6">
                    <span className="block font-display text-3xl font-bold text-foreground md:text-4xl">
                      {formatLocalizedPrice(country, tier.price, pricing)}
                    </span>
                    <p className="mt-2 px-2 text-xs text-muted-foreground md:text-sm leading-relaxed">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 text-left">
                    {[
                      "8 live sessions (60 min each)",
                      "Personalized learning plan",
                      "Progress updates",
                      "WhatsApp support",
                    ].map((feature) => (
                      <li key={`${tier.id}-${feature}`} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            tier.popular ? "bg-primary" : "bg-secondary"
                          }`}
                        >
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <span className="text-sm leading-relaxed text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4">
                  <Link to="/register" className="w-full">
                    <Button
                      variant={tier.popular ? "hero" : "outline"}
                      size="lg"
                      className={`w-full ${tier.popular ? "" : "rounded-full border-primary/30 bg-background/50 backdrop-blur-sm"}`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </InView>
          ))}
        </div>

        <InView className="mt-14 flex w-full justify-center" y={12}>
          <p className="inline-flex max-w-2xl items-center justify-center gap-2 text-center text-sm leading-relaxed text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>Secure payments via Flutterwave • Full refund before first session • Cancel anytime</span>
          </p>
        </InView>
      </div>
    </section>
  );
};

export default PricingSection;
