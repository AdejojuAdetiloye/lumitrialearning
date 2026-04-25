import { Link } from "react-router-dom";

interface LogoProps {
  /** Hidden by default — the logo includes the wordmark. */
  showText?: boolean;
  /** `sm` = footer / compact; `md` = main header (default); `lg` = extra prominence. */
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
}

const Logo = ({ showText = false, size = "md", className = "", textClassName = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "h-10 w-10 sm:h-11 sm:w-11",
    md: "h-12 w-12 min-h-[48px] min-w-[48px] sm:h-14 sm:w-14 md:h-16 md:w-16 lg:h-[4.5rem] lg:w-[4.5rem]",
    lg: "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.75rem] md:w-[4.75rem] lg:h-20 lg:w-20",
  };

  const imageScaleClasses = {
    sm: "scale-125",
    md: "scale-140",
    lg: "scale-125",
  } satisfies Record<NonNullable<LogoProps["size"]>, string>;

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
  };

  const defaultTextClass = textClassName || "text-foreground";

  return (
    <Link
      to="/"
      className={`group flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-xl ${className}`}
    >
      <div
        className={`${sizeClasses[size]} flex shrink-0 items-center justify-center overflow-visible rounded-2xl bg-transparent transition-all duration-300 group-hover:drop-shadow-lg`}
      >
        <img
          src="/images/lumitria_logo-no-bg.png"
          alt="Lumitria Learning"
          className={`h-full w-full object-contain object-center origin-center transform ${imageScaleClasses[size]}`}
          width={180}
          height={180}
          decoding="async"
        />
      </div>
      {showText && (
        <span className={`font-display ${textSizeClasses[size]} font-semibold tracking-tight ${defaultTextClass}`}>
          Lumitria
        </span>
      )}
    </Link>
  );
};

export default Logo;
