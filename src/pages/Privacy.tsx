import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Lumitria</title>
        <meta 
          name="description" 
          content="Lumitria's Privacy Policy - Learn how we protect and handle your personal information and data." 
        />
        <link rel="canonical" href="https://lumitrialearning.org/privacy" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <Card variant="elevated" className="animate-scale-in">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">Privacy Policy</h1>
                <p className="text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="prose prose-slate max-w-none space-y-6 md:space-y-8">
                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">1. Introduction</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Welcome to Lumitria Learning ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our tutoring services and website.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      By using our services, you agree to the collection and use of information in accordance with this policy.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">2. Information We Collect</h2>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">2.1 Personal Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We may collect the following personal information:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
                      <li>Parent/Guardian name, email address, phone number, and country of residence</li>
                      <li>Child's name, age, grade level, and educational background</li>
                      <li>Payment information (processed securely through third-party payment processors)</li>
                      <li>Course preferences and enrollment information</li>
                      <li>Communication records and correspondence</li>
                    </ul>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">2.2 Automatically Collected Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      When you visit our website, we may automatically collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>IP address and browser type</li>
                      <li>Device information and operating system</li>
                      <li>Pages visited and time spent on our site</li>
                      <li>Referring website addresses</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">3. How We Use Your Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We use the collected information for the following purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>To provide, maintain, and improve our tutoring services</li>
                      <li>To process enrollments and manage your account</li>
                      <li>To communicate with you about your enrollment, courses, and updates</li>
                      <li>To personalize the learning experience for your child</li>
                      <li>To process payments and send invoices</li>
                      <li>To respond to your inquiries and provide customer support</li>
                      <li>To send promotional materials (with your consent)</li>
                      <li>To comply with legal obligations and protect our rights</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">4. Data Sharing and Disclosure</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We do not sell your personal information. We may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li><strong>Service Providers:</strong> With trusted third-party service providers who assist in operating our website and conducting our business (e.g., payment processors, email services)</li>
                      <li><strong>Legal Requirements:</strong> When required by law or to protect our rights, property, or safety</li>
                      <li><strong>Business Transfers:</strong> In connection with any merger, sale, or transfer of assets</li>
                      <li><strong>With Your Consent:</strong> For any other purpose disclosed to you when you provide the information</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">5. Data Security</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">6. Your Rights</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Depending on your location, you may have the following rights regarding your personal information:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Right to access your personal data</li>
                      <li>Right to correct inaccurate information</li>
                      <li>Right to request deletion of your data</li>
                      <li>Right to object to processing of your data</li>
                      <li>Right to data portability</li>
                      <li>Right to withdraw consent</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      To exercise these rights, please contact us at <a href="mailto:info@lumitrialearning.org" className="text-primary hover:underline">info@lumitrialearning.org</a>.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">7. Children's Privacy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our services are available for students of all ages. For students under 18, enrollment and account management are handled by parents or guardians. We collect information for students under 18 only with parental consent and use it solely to provide our educational services. We do not knowingly collect personal information from children under 13 without parental consent.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">8. Cookies and Tracking Technologies</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">9. International Data Transfers</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to the transfer of your information to these locations.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">10. Changes to This Privacy Policy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">11. Contact Us</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      If you have any questions about this Privacy Policy, please contact us:
                    </p>
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                      <p className="text-foreground font-semibold mb-2">Lumitria Learning</p>
                      <p className="text-muted-foreground">Email: <a href="mailto:info@lumitrialearning.org" className="text-primary hover:underline">info@lumitrialearning.org</a></p>
                      <p className="text-muted-foreground">Phone: <a href="tel:+447782270767" className="text-primary hover:underline">+44 7782 270767</a></p>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Privacy;

