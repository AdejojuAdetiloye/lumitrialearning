import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-button hover:shadow-glow hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft hover:-translate-y-0.5",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Lumitria custom variants
        hero: "rounded-full bg-gradient-cta text-primary-foreground shadow-button hover:shadow-glow hover:-translate-y-1 hover:scale-[1.03] active:translate-y-0 active:scale-[1] font-bold lux-hero-btn-shine",
        "hero-outline": "border-2 border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/20 hover:-translate-y-0.5",
        success: "bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/90 hover:-translate-y-0.5",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 shadow-soft hover:-translate-y-0.5",
        whatsapp: "bg-[hsl(142_70%_49%)] text-primary-foreground shadow-soft hover:bg-[hsl(142_70%_45%)] hover:-translate-y-0.5 font-bold",
      },
      size: {
        default: "h-11 min-w-[44px] px-5 py-2 [&_svg]:size-4",
        sm: "h-10 min-w-[40px] rounded-md px-4 text-sm [&_svg]:size-4",
        lg: "h-12 min-w-[48px] rounded-xl px-8 text-base [&_svg]:size-5",
        xl: "h-14 min-w-[52px] rounded-xl px-10 text-lg [&_svg]:size-5",
        icon: "h-11 w-11 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
