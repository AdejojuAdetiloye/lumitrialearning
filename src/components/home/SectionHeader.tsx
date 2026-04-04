import type { ReactNode } from "react";
import { InView } from "@/components/motion/InView";
import { cn } from "@/lib/utils";

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  className?: string;
  delay?: number;
};

export function SectionHeader({ eyebrow, title, description, className, delay = 0 }: SectionHeaderProps) {
  return (
    <InView className={cn("text-center max-w-2xl mx-auto mb-14 md:mb-20", className)} delay={delay}>
      <span className="inline-block text-primary font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mb-4 md:mb-5">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl sm:text-4xl md:text-[2.75rem] font-semibold text-foreground mb-4 md:mb-5 tracking-tight leading-[1.3] md:leading-[1.35] px-4 sm:px-0">
        {title}
      </h2>
      <p className="text-muted-foreground text-base md:text-lg leading-[1.7] px-4 sm:px-0 max-w-xl mx-auto">
        {description}
      </p>
    </InView>
  );
}
