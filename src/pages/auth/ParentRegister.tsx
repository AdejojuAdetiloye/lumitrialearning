import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthVideoBackground from "@/components/layout/AuthVideoBackground";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const salutations = [
  { value: "MR" as const, label: "Mr" },
  { value: "MRS" as const, label: "Mrs" },
  { value: "MS" as const, label: "Ms" },
  { value: "MX" as const, label: "Mx" },
];

const ParentRegister = () => {
  const { registerParent } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salutation, setSalutation] = useState<(typeof salutations)[number]["value"]>("MR");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerParent({
        email: email.trim(),
        password,
        salutation,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      });
      toast.success("Account created!");
      navigate("/dashboard/parent", { replace: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Parent registration | Lumitria</title>
      </Helmet>
      <div className="lux-auth relative min-h-screen flex flex-col overflow-hidden bg-[#0b0b0f]">
        <AuthVideoBackground src="/video/lumitra-auth-video.mp4" />
        <Header />
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10 pt-24 md:pt-28">
          <div className="w-full max-w-5xl">
            <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
              <div className="text-center md:text-left md:flex md:flex-col md:justify-center">
                <h1 className="font-marker text-3xl sm:text-4xl text-white leading-tight">
                  Create parent account
                </h1>
                <p className="text-sm sm:text-base text-white/70 mt-3 leading-relaxed">
                  Prices follow your country. After you sign in, add your child and enroll in subject(s) from your
                  dashboard — that&apos;s where payment happens.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="rounded-3xl border border-white/15 bg-black/35 p-6 shadow-card space-y-4 backdrop-blur-2xl"
              >
              <div className="space-y-2">
                <Label className="text-white/85">How should we address you?</Label>
                <Select value={salutation} onValueChange={(v) => setSalutation(v as (typeof salutations)[number]["value"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {salutations.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="fn" className="text-white/85">First name</Label>
                  <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln" className="text-white/85">Last name</Label>
                  <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/85">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw" className="text-white/85">Password (min 8 characters)</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white/85">Phone (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? "Creating…" : "Create account"}
              </Button>
              <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-white font-semibold hover:underline">
                  Sign in
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

export default ParentRegister;
