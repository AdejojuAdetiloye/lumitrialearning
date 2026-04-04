import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, MessageCircle, Mail, Clock, ArrowRight, DollarSign } from "lucide-react";

interface PaymentDetails {
  orderId: string;
  payerId: string;
  amount: number;
  description: string;
  timestamp: string;
  status: string;
}

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const orderRef = searchParams.get("ref") || searchParams.get("paymentId") || "LUM-" + Date.now();

  useEffect(() => {
    // Retrieve payment details from sessionStorage
    const storedPayment = sessionStorage.getItem("paymentDetails");
    if (storedPayment) {
      try {
        const details = JSON.parse(storedPayment);
        setPaymentDetails(details);
        // Clear sessionStorage after retrieving
        sessionStorage.removeItem("paymentDetails");
      } catch (error) {
        console.error("Error parsing payment details:", error);
      }
    }
  }, []);

  // Generate WhatsApp message
  const whatsappNumber = "2348063356586"; // Nigerian number format
  const paymentInfo = paymentDetails 
    ? `\nPayment ID: ${paymentDetails.orderId}\nAmount: $${paymentDetails.amount}`
    : `\nOrder Reference: #${orderRef}`;
  const message = `Hi Lumitria! I just completed payment.${paymentInfo}\n\nPlease help me schedule my first session. Thank you!`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const nextSteps = [
    {
      icon: MessageCircle,
      title: "Click WhatsApp Below",
      description: "Send us a quick message with your order reference to confirm your enrollment.",
    },
    {
      icon: Clock,
      title: "We'll Respond Within 24hrs",
      description: "Our team will reach out to schedule your child's first session.",
    },
    {
      icon: Mail,
      title: "Check Your Email",
      description: "A confirmation email with all the details has been sent to your inbox.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Thank You! | Lumitria - Enrollment Confirmed</title>
        <meta name="description" content="Thank you for enrolling with Lumitria. Your payment is confirmed. Next step: Connect with us on WhatsApp." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-muted/30">
        <Header />

        <main className="pt-20 md:pt-24 pb-12 md:pb-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
            {/* Success Card */}
            <Card variant="elevated" className="text-center animate-scale-in overflow-hidden">
              {/* Success Banner */}
              <div className="bg-gradient-hero py-6 md:py-8 px-4">
                <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-primary-foreground/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-3 md:mb-4 animate-fade-up">
                  <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground animate-fade-up stagger-1">
                  Payment Successful!
                </h1>
                <p className="text-primary-foreground/90 mt-2 text-sm md:text-base animate-fade-up stagger-2">
                  Welcome to the Lumitria family
                </p>
              </div>

              <CardContent className="pt-6 md:pt-8 space-y-6 md:space-y-8 px-4 sm:px-6">
                {/* Payment Details */}
                <div className="space-y-3">
                  <div className="bg-lumitria-green-light rounded-xl p-3 md:p-4 inline-block">
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Order Reference</p>
                    <p className="text-lg md:text-xl font-bold text-secondary break-all">#{orderRef}</p>
                  </div>
                  {paymentDetails && (
                    <div className="bg-lumitria-orange-light rounded-xl p-3 md:p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                        <p className="text-xs md:text-sm font-semibold text-foreground">Payment Details</p>
                      </div>
                      <div className="text-xs md:text-sm space-y-1">
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Amount:</span> ${paymentDetails.amount}
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-semibold">Status:</span> {paymentDetails.status}
                        </p>
                        <p className="text-muted-foreground break-words">
                          <span className="font-semibold">Package:</span> {paymentDetails.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* WhatsApp CTA */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-foreground">
                    What's Next?
                  </h2>
                    <p className="text-muted-foreground">
                      Click the button below to send us a WhatsApp message. We'll contact you within 24 hours to schedule your first session!
                    </p>
                    {paymentDetails && (
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                        Your payment of ${paymentDetails.amount} has been confirmed.
                      </p>
                    )}
                  
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="whatsapp" size="xl" className="w-full sm:w-auto">
                      <MessageCircle className="w-5 h-5" />
                      Continue to WhatsApp
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </a>
                </div>

                {/* Next Steps */}
                <div className="border-t border-border pt-8">
                  <div className="grid gap-6">
                    {nextSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={step.title}
                          className="flex items-start gap-4 text-left opacity-0 animate-fade-up"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                          <div className="w-10 h-10 rounded-full bg-lumitria-orange-light flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{step.title}</p>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Help Text */}
                <div className="bg-muted/50 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Need help?</span> Reply to our WhatsApp message or email us at{" "}
                    <a href="mailto:info@lumitrialearning.org" className="text-primary hover:underline">
                      info@lumitrialearning.org
                    </a>
                  </p>
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

export default ThankYou;
