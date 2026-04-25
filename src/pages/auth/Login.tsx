import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthVideoBackground from "@/components/layout/AuthVideoBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/dashboard/parent";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back!");
      if (user.role === "ADMIN") {
        navigate("/dashboard/admin", { replace: true });
      } else if (user.role === "MANAGER") {
        navigate("/dashboard/manager", { replace: true });
      } else if (user.role === "INSTRUCTOR") {
        navigate("/dashboard/instructor", { replace: true });
      } else {
        navigate(from.startsWith("/dashboard") ? from : "/dashboard/parent", { replace: true });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login | Lumitria</title>
      </Helmet>
      <div className="lux-auth relative min-h-screen flex flex-col overflow-hidden bg-[#0b0b0f]">
        <AuthVideoBackground src="/video/lumitra-auth-video.mp4" />
        <Header />
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10 pt-24 md:pt-28">
          <div className="w-full max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
              <div className="text-center md:text-left md:flex md:flex-col md:justify-center">
                <h1 className="font-marker text-3xl sm:text-4xl text-white leading-tight">
                  Welcome back
                </h1>
                <p className="text-sm sm:text-base text-white/70 mt-3 leading-relaxed">
                  Access your dashboard
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/15 bg-black/35 p-6 shadow-card space-y-4 backdrop-blur-2xl"
              >
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/85">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/85">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
              <p className="text-center text-sm text-white/70">
                No account?{" "}
                <Link to="/auth/register" className="text-white font-semibold hover:underline">
                  Create parent account
                </Link>
              </p>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Login;
