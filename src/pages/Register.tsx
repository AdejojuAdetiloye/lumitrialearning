import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, LayoutDashboard, CreditCard, ArrowRight } from "lucide-react";

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

      <div className="lux-auth">
        <Header />
        <main className="flex-1 pt-20 md:pt-24 pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-lg">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">Get started</h1>
              <p className="text-muted-foreground mt-3 text-sm sm:text-base leading-[1.7]">
                Create a <strong className="text-foreground font-semibold">parent account</strong> first. You&apos;ll add
                your child and choose subjects when you pay — all inside your dashboard, not on this page.
              </p>
            </div>

            <Card variant="elevated" className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">How it works</CardTitle>
                <CardDescription>Three quick steps after you sign up</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">1. Register</p>
                    <p>Create your account with your name, email, and country for pricing.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <LayoutDashboard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">2. Open your dashboard</p>
                    <p>Enter your child&apos;s details, birth date, and pick the subject(s) you want.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">3. Pay securely</p>
                    <p>Checkout with Flutterwave in your region&apos;s currency. Your child appears on the dashboard right after payment.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button variant="hero" size="lg" className="w-full" asChild>
                <Link to="/auth/register">
                  Create parent account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/auth/login">Already have an account? Sign in</Link>
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8">
              Questions? Visit{" "}
              <Link to="/pricing" className="text-primary hover:underline">
                Pricing
              </Link>{" "}
              or{" "}
              <Link to="/courses" className="text-primary hover:underline">
                Courses
              </Link>
              .
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Register;
