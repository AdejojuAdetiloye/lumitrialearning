import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
      <div className="lux-auth">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16 pt-24">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Create parent account</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Prices follow your country. After you sign in, add your child and enroll in subject(s) from your
                dashboard — that&apos;s where payment happens.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
              <div className="space-y-2">
                <Label>How should we address you?</Label>
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
                  <Label htmlFor="fn">First name</Label>
                  <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ln">Last name</Label>
                  <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw">Password (min 8 characters)</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? "Creating…" : "Create account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/auth/login" className="text-primary font-medium hover:underline">
                  Sign in
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

export default ParentRegister;
