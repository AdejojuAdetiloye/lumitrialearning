import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthVideoBackground from "@/components/layout/AuthVideoBackground";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Register = () => {
  return (
    <>
      <Helmet>
        <title>Get started | Lumitria</title>
        <meta
          name="description"
          content="Create your parent account, then add your children and enroll in subjects from your dashboard with secure payment."
        />
        <link rel="canonical" href="https://lumitrialearning.org/register" />
      </Helmet>

      <div className="lux-auth relative min-h-screen flex flex-col overflow-hidden bg-[#0b0b0f]">
        <AuthVideoBackground src="/video/lumitra-auth-video.mp4" />
        <Header />
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10 pt-24 md:pt-28">
          <div className="w-full max-w-lg">
            <div className="rounded-3xl border border-white/15 bg-black/35 p-6 shadow-card backdrop-blur-2xl sm:p-8">
              <div className="text-center space-y-3">
                <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Get started
                </h1>
                <p className="text-white/75 text-sm sm:text-base leading-[1.7]">
                  Create a <strong className="text-white font-semibold">parent account</strong> first. You&apos;ll add
                  your child and choose subjects when you pay — all inside your dashboard.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3">
                <Button variant="hero" size="lg" className="w-full" asChild>
                  <Link to="/auth/register">
                    Create parent account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white/20 bg-black/20 text-white hover:bg-black/30 hover:text-white"
                  asChild
                >
                  <Link to="/auth/login">Already have an account? Sign in</Link>
                </Button>
              </div>

              <p className="text-center text-xs text-white/60 mt-7">
                Questions? Visit{" "}
                <Link to="/pricing" className="text-white/85 hover:underline">
                  Pricing
                </Link>{" "}
                or{" "}
                <Link to="/courses" className="text-white/85 hover:underline">
                  Courses
                </Link>
                .
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Register;
