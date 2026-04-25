import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

function dashboardHrefForRole(role: AppRole): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "MANAGER":
      return "/dashboard/manager";
    case "INSTRUCTOR":
      return "/dashboard/instructor";
    default:
      return "/dashboard/parent";
  }
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /** Main marketing nav: exact match so "/" does not stay active on other routes. */
  const isNavActive = (href: string) =>
    href === "/" ? location.pathname === "/" : location.pathname === href;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out lux-nav-blur",
        scrolled && "lux-nav-blur-scrolled"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 max-w-[1280px]">
        <div className="flex min-h-[4.25rem] items-center justify-between gap-3 py-2 md:min-h-[4.5rem] md:gap-4 md:py-2.5">
          <Logo size="md" className="min-w-0" />

          <nav className="hidden md:flex items-center gap-10" aria-label="Main">
            {navLinks.map((link) => {
              const active = isNavActive(link.href);
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative text-sm font-medium py-2 transition-colors duration-300",
                    active
                      ? "text-white font-semibold"
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {link.name}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-[2px] rounded-full bg-gradient-cta transition-all duration-300 ease-out",
                      active ? "w-full opacity-100" : "w-0 opacity-0 group-hover:w-full group-hover:opacity-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to={dashboardHrefForRole(user.role)}>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full border-white/20 bg-black/30 text-white backdrop-blur-sm hover:bg-black/40 hover:text-white"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className="rounded-full text-white/85 hover:text-white hover:bg-white/10"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                >
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="lg" className="rounded-full font-medium text-white/85 hover:text-white hover:bg-white/10">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="hero" size="lg" className="min-h-[48px] px-8">
                    Enroll Now
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/30 text-white backdrop-blur-md hover:bg-black/40"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden overflow-hidden border-t border-white/10"
            >
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="flex flex-col gap-1 py-5"
                aria-label="Mobile main"
              >
                {navLinks.map((link, i) => {
                  const active = isNavActive(link.href);
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.06 * i }}
                    >
                      <Link
                        to={link.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block rounded-xl px-4 py-3.5 text-base font-medium transition-colors",
                          active
                            ? "bg-white/10 text-white font-semibold ring-1 ring-white/15"
                            : "text-white/85 hover:bg-white/10 hover:text-white"
                        )}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="mt-4 flex flex-col gap-2 px-2">
                  {user ? (
                    <>
                      <Link
                        to={dashboardHrefForRole(user.role)}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Button variant="outline" className="w-full rounded-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full rounded-full"
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full rounded-full">
                          Log in
                        </Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="hero" className="w-full">
                          Enroll Now
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
