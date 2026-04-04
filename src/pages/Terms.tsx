import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms & Conditions | Lumitria</title>
        <meta 
          name="description" 
          content="Lumitria's Terms and Conditions - Read our terms of service, refund policy, and enrollment agreements." 
        />
        <link rel="canonical" href="https://lumitrialearning.org/terms" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <Card variant="elevated" className="animate-scale-in">
              <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">Terms & Conditions</h1>
                <p className="text-xs md:text-sm text-muted-foreground mb-6 md:mb-8">
                  Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="prose prose-slate max-w-none space-y-6 md:space-y-8">
                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">1. Agreement to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      By accessing or using Lumitria Learning's ("we," "our," or "us") website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">2. Services Description</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Lumitria Learning provides online tutoring services for students of all ages, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Coding & Programming</li>
                      <li>STEM Excellence programs</li>
                      <li>African Culture and Language courses</li>
                      <li>Creative Arts programs</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      All sessions are conducted online via video conferencing platforms. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">3. Enrollment and Registration</h2>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.1 Eligibility</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Our services are available for students of all ages. For students under 18, enrollment must be completed by a parent or legal guardian who is at least 18 years old. By enrolling a student under 18, you represent that you are the parent or legal guardian with authority to consent to the student's participation.
                    </p>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">3.2 Account Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for maintaining the confidentiality of your account credentials.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">4. Payment Terms</h2>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.1 Pricing</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      All prices are listed in USD and are subject to change without notice. Current pricing is $10 per class, with monthly packages available starting at $80 for 8 sessions.
                    </p>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.2 Payment</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Payment is required in advance before the start of the course. We accept payments through secure third-party payment processors. All payments are processed securely, and we do not store your complete payment card information.
                    </p>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">4.3 Refund Policy</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We offer a full refund if you cancel before the first scheduled session. After the first session, refunds are calculated on a pro-rata basis for unused sessions, minus a 10% administrative fee. Refund requests must be submitted in writing to <a href="mailto:info@lumitrialearning.org" className="text-primary hover:underline">info@lumitrialearning.org</a> within 7 days of the session you wish to cancel.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">5. Session Scheduling and Cancellation</h2>
                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.1 Scheduling</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Sessions are scheduled in advance through our platform or via WhatsApp. We will work with you to find suitable times for your sessions.
                    </p>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.2 Cancellation Policy</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      To cancel or reschedule a session, please notify us at least 24 hours in advance. Sessions cancelled with less than 24 hours' notice may be forfeited. We will make reasonable efforts to accommodate rescheduling requests.
                    </p>

                    <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">5.3 No-Shows</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      If a student fails to attend a scheduled session without prior notice, the session will be considered used and will not be refunded or rescheduled.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">6. Student Conduct</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Students are expected to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Attend sessions on time and prepared</li>
                      <li>Respect tutors and other participants</li>
                      <li>Follow instructions and complete assigned work</li>
                      <li>Maintain appropriate behavior during sessions</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-4">
                      We reserve the right to suspend or terminate enrollment if a student engages in disruptive, disrespectful, or inappropriate behavior.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">7. Intellectual Property</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      All course materials, content, and resources provided by Lumitria Learning are protected by copyright and other intellectual property laws. You may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>Reproduce, distribute, or share course materials without permission</li>
                      <li>Record sessions without explicit consent</li>
                      <li>Use our materials for commercial purposes</li>
                      <li>Remove copyright or proprietary notices</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">8. Limitation of Liability</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      To the maximum extent permitted by law, Lumitria Learning shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of our services.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">9. Disclaimer of Warranties</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that our services will be uninterrupted, error-free, or meet your specific requirements. While we strive to provide quality education, we cannot guarantee specific academic outcomes.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">10. Privacy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand how we collect, use, and protect your information.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">11. Modifications to Terms</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify these Terms and Conditions at any time. We will notify users of any material changes by posting the updated terms on our website and updating the "Last updated" date. Your continued use of our services after such modifications constitutes acceptance of the updated terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">12. Termination</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Either party may terminate enrollment at any time. Upon termination:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                      <li>All scheduled sessions will be cancelled</li>
                      <li>Refunds will be processed according to our refund policy</li>
                      <li>Access to course materials may be revoked</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">13. Governing Law</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      These Terms and Conditions shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">14. Contact Information</h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you have any questions about these Terms and Conditions, please contact us:
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

export default Terms;

