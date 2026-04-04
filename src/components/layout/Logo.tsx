import { Link } from "react-router-dom";

interface LogoProps {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  textClassName?: string;
}

const Logo = ({ showText = true, size = "md", className = "", textClassName = "" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
  };

  const defaultTextClass = textClassName || "text-foreground";

  return (
    <Link to="/" className={`group flex items-center gap-2 ${className}`}>
      <div
        className={`${sizeClasses[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-button ring-2 ring-primary/20 transition-all duration-500 group-hover:shadow-glow group-hover:ring-primary/40`}
      >
        <img
          src="/logo-icon.svg"
          alt=""
          className="h-full w-full object-contain"
          aria-hidden
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

