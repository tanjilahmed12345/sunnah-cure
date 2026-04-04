import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          Terms and Conditions
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: March 29, 2026</p>

        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to Sunnah Cure Diagnostic Center. By using our website and booking our services,
              you agree to be bound by these Terms and Conditions. Please read them carefully before
              using our platform or availing any of our services.
            </p>

            <h2>2. Services Offered</h2>
            <p>Sunnah Cure provides the following services:</p>
            <ul>
              <li><strong>Hijama Therapy</strong> &ndash; Wet and dry cupping therapy (in-person only)</li>
              <li><strong>Ruqyah Therapy</strong> &ndash; Quranic healing sessions (in-person only)</li>
              <li><strong>Islamic Counseling</strong> &ndash; Faith-based counseling (online and in-person)</li>
              <li><strong>Health Assessment</strong> &ndash; Comprehensive diagnostic evaluation (online and in-person)</li>
            </ul>

            <h2>3. Appointment Booking</h2>
            <ul>
              <li>All appointments are subject to availability and confirmation by our team.</li>
              <li>Booking an appointment does not guarantee a specific time slot until confirmed by an admin or practitioner.</li>
              <li>For online services, payment must be completed before the appointment is processed.</li>
              <li>For offline services, payment may be made at the center before or after the session, depending on the service type.</li>
            </ul>

            <h2>4. Pricing</h2>
            <ul>
              <li>Prices for services are displayed on our website and are subject to change at any time.</li>
              <li>Online and offline services may have different pricing and session durations.</li>
              <li>Hijama therapy pricing is based on the number of cups used. If the patient is unsure of the number of cups, the final price will be determined after the session.</li>
              <li>All prices are listed in Bangladeshi Taka (BDT).</li>
            </ul>

            <h2>5. Payment</h2>
            <ul>
              <li>We accept payments via bKash, Nagad, Rocket, Stripe, PayPal, and card payments.</li>
              <li>Online service bookings require advance payment. The appointment will only be processed after successful payment.</li>
              <li>Offline service payments can be made at the diagnostic center.</li>
            </ul>

            <h2>6. Cancellation</h2>
            <ul>
              <li>Patients may request cancellation of an appointment before it is confirmed.</li>
              <li>Once an appointment is confirmed and scheduled, cancellation is subject to our refund policy.</li>
              <li>Sunnah Cure reserves the right to cancel or reschedule appointments due to unavoidable circumstances, in which case a full refund will be issued.</li>
            </ul>

            <h2>7. Patient Responsibilities</h2>
            <ul>
              <li>Patients must provide accurate personal and medical information during booking.</li>
              <li>For Hijama therapy, patients must disclose any medical conditions (e.g., blood pressure, diabetes) in the booking form.</li>
              <li>Patients should arrive on time for in-person appointments. Late arrivals may result in a shortened session.</li>
            </ul>

            <h2>8. Confidentiality</h2>
            <p>
              All patient information, medical records, and session details are treated as strictly confidential.
              We do not share your information with third parties except as required by law or with your explicit consent.
            </p>

            <h2>9. Disclaimer</h2>
            <p>
              Sunnah Cure provides complementary and alternative healing services based on Islamic traditions.
              Our services are not a substitute for professional medical advice, diagnosis, or treatment.
              Always consult a qualified healthcare provider for serious medical conditions.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              Sunnah Cure reserves the right to update these terms at any time. Continued use of our services
              after changes constitutes acceptance of the updated terms.
            </p>

            <h2>11. Contact</h2>
            <p>
              For questions regarding these terms, please contact us at:
              <br />
              Email: info@sunnahcure.com
              <br />
              Phone: +880 1234-567890
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
