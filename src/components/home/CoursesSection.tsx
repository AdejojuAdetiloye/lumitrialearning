import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Code, Atom, Palette, Globe, ArrowRight, type LucideIcon } from "lucide-react";
import { InView } from "@/components/motion/InView";
import { SectionHeader } from "@/components/home/SectionHeader";
import { PROGRAM_CATEGORIES } from "@/lib/programCategories";

const iconBySlug: Record<string, LucideIcon> = {
  coding: Code,
  stem: Atom,
  culture: Globe,
  arts: Palette,
};

const colorClasses = {
  primary: {
    bg: "bg-gradient-to-br from-primary/20 to-primary/5",
    icon: "text-primary",
    badge: "bg-primary/12 text-primary border border-primary/20",
  },
  secondary: {
    bg: "bg-gradient-to-br from-secondary/20 to-secondary/5",
    icon: "text-secondary",
    badge: "bg-secondary/12 text-secondary border border-secondary/20",
  },
  accent: {
    bg: "bg-gradient-to-br from-accent/25 to-accent/5",
    icon: "text-accent",
    badge: "bg-accent/15 text-accent-foreground border border-accent/25",
  },
};

const CoursesSection = () => {
  return (
    <section id="courses" className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-muted/25 mesh-hero-bg opacity-60" aria-hidden />
      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px] relative z-10">
        <SectionHeader
          eyebrow="Our Programs"
          title={
            <>
              Courses Designed for <span className="text-gradient">Excellence</span>
            </>
          }
          description="Expert-led programs that combine quality education with cultural connection, designed for Nigerians of all ages living abroad."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {PROGRAM_CATEGORIES.map((course, index) => {
            const colors = colorClasses[course.color];
            const Icon = iconBySlug[course.slug] ?? Code;

            return (
              <InView key={course.slug} delay={index * 0.06} y={36}>
                <Card
                  variant="feature"
                  className="group h-full border-white/55 hover:shadow-glow hover:-translate-y-2 transition-all duration-500"
                >
                  <CardHeader className="pb-4">
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${colors.bg} shadow-soft ring-1 ring-white/60 transition-transform duration-500 group-hover:scale-110`}
                    >
                      <Icon className={`h-7 w-7 ${colors.icon}`} />
                    </div>
                    <span
                      className={`inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold ${colors.badge}`}
                    >
                      {course.ages}
                    </span>
                    <CardTitle className="font-display mt-3 text-lg md:text-xl">{course.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-6 space-y-2.5">
                      {course.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-sm" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button
                        variant="ghost"
                        className="w-full rounded-full font-semibold text-primary hover:bg-primary/10 group/btn"
                      >
                        Learn More
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </InView>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
