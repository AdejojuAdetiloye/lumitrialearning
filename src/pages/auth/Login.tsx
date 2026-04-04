import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
      <div className="lux-auth">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">welcome back, login!</h1>
              <p className="text-sm text-muted-foreground mt-2">Access your dashboard</p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                <Label htmlFor="password">Password</Label>
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
              <p className="text-center text-sm text-muted-foreground">
                No account?{" "}
                <Link to="/auth/register" className="text-primary font-medium hover:underline">
                  Create parent account
                </Link>
              </p>
            </form>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Login;
