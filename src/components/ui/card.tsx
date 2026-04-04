import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-2xl border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default:
          "border-white/40 bg-gradient-to-b from-card/95 via-lumitria-cream/90 to-lumitria-orange-light/25 shadow-card backdrop-blur-md",
        elevated:
          "border-white/45 bg-gradient-to-br from-background/80 via-lumitria-cream/85 to-lumitria-gold-light/40 shadow-card backdrop-blur-xl hover:shadow-glow hover:-translate-y-1.5",
        outline: "border-2 border-border/80 bg-gradient-to-b from-background/90 to-lumitria-cream/80 shadow-none backdrop-blur-sm",
        feature:
          "relative overflow-hidden border-white/50 bg-gradient-to-b from-background/75 via-lumitria-cream/80 to-lumitria-orange-light/30 shadow-card backdrop-blur-xl hover:shadow-glow hover:-translate-y-2",
        pricing:
          "relative overflow-visible border-primary/20 bg-gradient-to-b from-background/80 via-lumitria-cream/85 to-lumitria-gold-light/35 shadow-card backdrop-blur-xl hover:shadow-glow hover:-translate-y-2",
        "pricing-popular":
          "relative overflow-visible border-2 border-primary/60 bg-gradient-to-b from-lumitria-orange-light/50 via-card/90 to-lumitria-gold-light/45 shadow-glow backdrop-blur-xl hover:-translate-y-2 ring-2 ring-primary/25",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-sans text-2xl font-semibold leading-tight tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
