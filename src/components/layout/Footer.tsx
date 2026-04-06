import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ShieldCheck, Lock, Award } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="footer-mesh relative text-background pt-16 md:pt-20 pb-10">
      <div className="footer-gradient-top absolute left-0 right-0 top-0" aria-hidden />

      <div className="container mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="mb-12 flex flex-wrap items-center justify-center gap-6 border-b border-background/15 pb-10 md:gap-10">
          <div className="flex items-center gap-2 text-background/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-background/20 bg-background/10 backdrop-blur-sm">
              <ShieldCheck className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <span className="max-w-[10rem] text-xs font-medium leading-snug md:text-sm">
              Secure checkout &amp; data protection
            </span>
          </div>
          <div className="flex items-center gap-2 text-background/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-background/20 bg-background/10 backdrop-blur-sm">
              <Lock className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <span className="max-w-[10rem] text-xs font-medium leading-snug md:text-sm">
              Flutterwave secure payments
            </span>
          </div>
          <div className="flex items-center gap-2 text-background/80">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-background/20 bg-background/10 backdrop-blur-sm">
              <Award className="h-5 w-5 text-accent" aria-hidden />
            </div>
            <span className="max-w-[10rem] text-xs font-medium leading-snug md:text-sm">
              Expert-vetted Nigerian tutors
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
          <div className="space-y-5">
            <Logo size="sm" />
            <p className="text-sm leading-[1.7] text-background/75">
              Expert tutors helping Nigerian children abroad excel through quality education and cultural connection.
            </p>
          </div>

          <div>
            <h4 className="font-display mb-5 text-lg font-semibold tracking-tight">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-background/70 transition-colors duration-300 hover:text-background underline-offset-4 hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-background/70 transition-colors duration-300 hover:text-background underline-offset-4 hover:underline"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-background/70 transition-colors duration-300 hover:text-background underline-offset-4 hover:underline"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-background/70 transition-colors duration-300 hover:text-background underline-offset-4 hover:underline"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-5 text-lg font-semibold tracking-tight">Our Courses</h4>
            <ul className="space-y-3 text-sm text-background/70">
              {["Coding & Programming", "STEM Excellence", "African Culture", "Creative Arts"].map((item) => (
                <li key={item}>
                  <span className="transition-colors duration-300 hover:text-background">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display mb-5 text-lg font-semibold tracking-tight">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-background/75">
                <Mail className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" aria-hidden />
                <span className="break-all">info@lumitrialearning.org</span>
              </li>
              <li className="flex items-center gap-3 text-background/75">
                <Phone className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden />
                <a href="tel:+447782270767" className="transition-colors hover:text-background">
                  +44 7782 270767
                </a>
              </li>
              <li className="flex items-start gap-3 text-background/75">
                <MapPin className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent" aria-hidden />
                <span>Supporting families worldwide</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-background/15 pt-8 md:flex-row">
          <p className="text-center text-sm text-background/55 md:text-left">© 2025 Lumitria Learning. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              to="/privacy"
              className="text-sm text-background/55 transition-colors hover:text-background underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="text-sm text-background/55 transition-colors hover:text-background underline-offset-4 hover:underline"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
