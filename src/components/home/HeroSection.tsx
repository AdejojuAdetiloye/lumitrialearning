import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Award } from "lucide-react";

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
      className="relative min-h-[100svh] flex items-center pt-20 md:pt-24 overflow-hidden bg-[#0b0b0f]"
    >
      {/* Background starts below the fixed header (matches section padding-top). */}
      <div className="absolute inset-x-0 top-20 bottom-0 md:top-24" aria-hidden>
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src="/video/lumitria-hero-video.mp4" type="video/mp4" />
        </video>
      </div>

      <div
        className="absolute inset-x-0 top-20 bottom-0 bg-gradient-to-b from-[#1b120c]/65 via-black/55 to-[#090a0d]/80 md:top-24"
        aria-hidden
      />

      <div
        className="absolute inset-x-0 top-20 bottom-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.14),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(249,115,22,0.10),transparent_60%)] md:top-24"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-20 bottom-0 mesh-hero-bg opacity-35 md:top-24" aria-hidden />

      <motion.div
        className="absolute top-28 right-[8%] w-56 md:w-80 h-56 md:h-80 rounded-full bg-primary/20 blur-3xl hidden sm:block pointer-events-none"
        style={{ y: blobY1 }}
        aria-hidden
      />
      <motion.div
        className="absolute bottom-24 left-[6%] w-72 md:w-[28rem] h-72 md:h-[28rem] rounded-full bg-accent/25 blur-3xl hidden sm:block pointer-events-none"
        style={{ y: blobY2 }}
        aria-hidden
      />

      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px] relative z-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-14">
          <div className="space-y-7 md:space-y-9 text-center sm:text-left w-full pt-6 sm:pt-0">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeLux }}
              className="flex justify-center sm:justify-start"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 shadow-soft backdrop-blur-md">
                <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/90 fill-white/90 shrink-0" aria-hidden />
                <span className="text-xs md:text-sm font-semibold text-white tracking-wide">
                  Trusted by 50+ Families Worldwide
                </span>
              </div>
            </motion.div>

            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.06, ease: easeLux }}
              className="font-marker text-4xl sm:text-5xl md:text-[3.25rem] lg:text-[3.75rem] font-normal leading-[1.08] tracking-tight text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.55)] px-2 sm:px-0"
            >
              Expert Tutors for{" "}
              <span className="text-gradient bg-[length:200%_auto] animate-gradient">Global Families</span> Worldwide
            </motion.h1>

            <motion.p
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: easeLux }}
              className="text-base md:text-lg lg:text-xl text-white/85 max-w-2xl mx-auto sm:mx-0 leading-[1.7] px-4 sm:px-0 drop-shadow-[0_10px_22px_rgba(0,0,0,0.6)]"
            >
              Quality education that connects you to your roots. Coding, STEM, African culture, and more — taught by
              passionate tutors.
            </motion.p>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: easeLux }}
              className="flex flex-col sm:flex-row gap-4 justify-center sm:justify-start"
            >
              <Link to="/register">
                <Button variant="hero" size="xl" className="w-full sm:w-auto min-h-[52px] px-10">
                  Enroll Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/courses">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto min-h-[52px] rounded-full border-white/30 bg-black/25 text-white backdrop-blur-md hover:bg-black/35 hover:text-white"
                >
                  View Courses
                </Button>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: easeLux }}
            className="flex justify-center lg:justify-end pb-8 lg:pb-0"
          >
            <div className="flex w-full max-w-sm lg:w-[20rem] flex-col gap-3">
              {[
                { icon: Users, title: "100+ Students", ring: "bg-secondary/15 text-secondary" },
                { icon: Award, title: "15+ Expert Tutors", ring: "bg-primary/15 text-primary" },
                { icon: Star, title: "4.9/5 Rating", ring: "bg-accent/15 text-accent", starFill: true },
              ].map(({ icon: Icon, title, ring, starFill = false }) => (
                <div
                  key={title}
                  className="flex min-h-[4.25rem] items-center gap-4 rounded-2xl border border-white/20 bg-black/30 px-5 py-4 shadow-card backdrop-blur-xl min-w-0"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${ring} border border-white/40`}
                  >
                    <Icon className={starFill ? "h-6 w-6 fill-accent" : "h-6 w-6"} />
                  </div>
                  <p className="text-left text-sm md:text-base font-semibold text-white leading-snug min-w-0 truncate">
                    {title}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
