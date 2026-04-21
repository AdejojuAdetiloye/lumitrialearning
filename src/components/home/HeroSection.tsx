import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award, CheckCircle2, Target } from "lucide-react";
import { InView } from "@/components/motion/InView";

const HERO_CARD_IMAGE = "/images/hero-card-pexels.jpg";

const easeLux = [0.16, 1, 0.3, 1] as const;

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const blobY1 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const blobY2 = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 55]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 overflow-hidden"
    >
      <div className="absolute inset-0 mesh-hero-bg" aria-hidden />

      <motion.div
        className="absolute top-28 right-[8%] w-56 md:w-80 h-56 md:h-80 rounded-full bg-primary/12 blur-3xl hidden sm:block pointer-events-none"
        style={{ y: blobY1 }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-24 left-[6%] w-72 md:w-[28rem] h-72 md:h-[28rem] rounded-full bg-accent/15 blur-3xl hidden sm:block pointer-events-none"
        style={{ y: blobY2 }}
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px] relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-14 lg:gap-16 items-center">
          <div className="space-y-7 md:space-y-9 text-center lg:text-left">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeLux }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background/60 px-4 py-2 shadow-soft backdrop-blur-md"
            >
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary fill-primary shrink-0" aria-hidden />
              <span className="text-xs md:text-sm font-semibold text-primary tracking-wide">
                Trusted by 50+ Families Worldwide
              </span>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: easeLux }}
              className="font-display text-4xl sm:text-5xl md:text-[3.25rem] lg:text-[3.75rem] font-semibold leading-[1.08] tracking-tight text-foreground px-2 sm:px-0"
            >
              Expert Tutors for{" "}
              <span className="text-gradient bg-[length:200%_auto] animate-gradient">Global Families</span> Worldwide
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: easeLux }}
              className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-[1.7] px-4 sm:px-0"
            >
              Quality education that connects you to your roots. Coding, STEM, African culture, and more — taught by
              passionate tutors.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: easeLux }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/register">
                <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] px-10">
                  Enroll Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#courses">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto min-h-[52px] rounded-full border-primary/35 bg-background/50 backdrop-blur-md hover:bg-background/80"
                >
                  View Courses
                </Button>
              </a>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease: easeLux }}
              className="flex flex-wrap gap-4 md:gap-5 justify-center lg:justify-start pt-2"
            >
              {[
                { icon: Users, value: "100+", label: "Students", ring: "bg-secondary/15 text-secondary" },
                { icon: Award, value: "15+", label: "Expert Tutors", ring: "bg-primary/15 text-primary" },
                { icon: Star, value: "4.9/5", label: "Rating", ring: "bg-accent/15 text-accent", starFill: true },
              ].map(({ icon: Icon, value, label, ring, starFill = false }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/50 bg-background/50 px-4 py-3 shadow-card backdrop-blur-xl"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${ring} border border-white/40`}
                  >
                    <Icon className={starFill ? "h-5 w-5 fill-accent" : "h-5 w-5"} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-foreground leading-tight">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <InView className="relative hidden lg:block" y={40}>
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/25 to-accent/20 blur-sm rotate-3 scale-[1.02]" />
              <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/50 bg-card/30 shadow-glow backdrop-blur-sm">
                <img
                  src={HERO_CARD_IMAGE}
                  alt="Two children learning together in a bright, modern setting"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[hsl(20_14%_12%_/0.88)] via-[hsl(20_14%_15%_/0.42)] to-[hsl(35_100%_98%_/0.12)]"
                  aria-hidden
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" aria-hidden />

                <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-between p-6 md:p-8">
                  <div className="flex justify-end">
                    <div className="glass-panel-strong flex max-w-[min(100%,14rem)] items-center gap-3 rounded-2xl p-4 shadow-glow animate-float">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-cta text-primary-foreground shadow-button">
                        <Target className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-semibold text-foreground">Personalized</p>
                        <p className="text-xs text-muted-foreground">1-on-1 Attention</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <p className="text-balance font-display text-2xl font-semibold leading-tight text-primary-foreground drop-shadow-md sm:text-3xl">
                      Learning Made <span className="text-accent">Fun!</span>
                    </p>
                    <p className="text-sm text-primary-foreground/90 md:text-base">Interactive online sessions</p>
                  </div>

                  <div className="flex justify-start">
                    <div
                      className="glass-panel-strong flex max-w-[min(100%,14rem)] items-center gap-3 rounded-2xl p-4 shadow-glow animate-float"
                      style={{ animationDelay: "1s" }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-soft">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-semibold text-foreground">Live Classes</p>
                        <p className="text-xs text-muted-foreground">Via Zoom</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </InView>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
