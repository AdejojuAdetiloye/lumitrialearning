import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Users } from "lucide-react";
import { InView } from "@/components/motion/InView";

const CTASection = () => {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-20 md:py-28 mesh-cta-bg">
      <div className="absolute inset-0 bg-foreground/5 backdrop-blur-[1px]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="absolute left-[10%] top-16 h-28 w-28 rounded-full border-2 border-primary-foreground md:h-36 md:w-36 animate-float" />
        <div
          className="absolute bottom-12 right-[8%] h-36 w-36 rounded-full border-2 border-primary-foreground md:h-48 md:w-48 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-20 w-20 rounded-full border-2 border-primary-foreground md:h-28 md:w-28 animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      <div className="container relative z-10 mx-auto max-w-[1280px] px-4 sm:px-6">
        <InView className="mx-auto max-w-3xl text-center" y={32}>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-4 py-2 backdrop-blur-md md:mb-10">
            <Shield className="h-4 w-4 text-primary-foreground" aria-hidden />
            <span className="text-xs font-semibold text-primary-foreground md:text-sm">100% Satisfaction Guaranteed</span>
          </div>

          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight text-primary-foreground sm:text-4xl md:text-5xl lg:text-[3.25rem] px-4 sm:px-0">
            Ready to Get the Best Education?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-[1.7] text-primary-foreground/90 md:mt-6 md:text-lg lg:text-xl px-4 sm:px-0">
            Join the Lumitria family today and thrive. Our expert tutors are ready to inspire, educate, and connect.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:mt-12 sm:flex-row">
            <motion.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link to="/register">
                <Button
                  variant="hero-outline"
                  size="xl"
                  className="w-full min-h-[52px] rounded-full border-0 bg-primary-foreground px-10 text-primary shadow-glow hover:bg-primary-foreground/95 sm:w-auto animate-cta-pulse"
                >
                  Enroll Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
            <Link to="/pricing">
              <Button
                variant="hero-outline"
                size="xl"
                className="w-full min-h-[52px] rounded-full border-2 border-primary-foreground/40 bg-primary-foreground/10 backdrop-blur-md hover:bg-primary-foreground/20 sm:w-auto"
              >
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-6 text-primary-foreground/85 md:mt-14 md:gap-10">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium">24hr Response</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 shrink-0" aria-hidden />
              <span className="text-sm font-medium">Expert Tutors</span>
            </div>
          </div>
        </InView>
      </div>
    </section>
  );
};

export default CTASection;
