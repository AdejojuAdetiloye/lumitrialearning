import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type InViewProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/**
 * Fade-up when section enters viewport. Respects prefers-reduced-motion.
 */
export function InView({ children, className, delay = 0, y = 28 }: InViewProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px 0px -48px 0px", amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
