import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          Privacy Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: March 29, 2026</p>

        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Sunnah Cure Diagnostic Center (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) is committed
              to protecting the privacy and security of your personal information. This Privacy Policy explains how
              we collect, use, store, and protect your data when you use our website and services.
            </p>

            <h2>2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <h3>Personal Information</h3>
            <ul>
              <li>Full name, phone number, address, age, and gender</li>
              <li>Medical history and health conditions (as disclosed during booking)</li>
              <li>Assessment form responses (spiritual, physical, emotional, and psychological data)</li>
            </ul>
            <h3>Payment Information</h3>
            <ul>
              <li>Payment method details (bKash, Nagad, card numbers, etc.)</li>
              <li>Transaction IDs and payment history</li>
            </ul>
            <h3>Usage Data</h3>
            <ul>
              <li>Browser type, device information, and IP address</li>
              <li>Pages visited, session duration, and interaction patterns</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <ul>
              <li>To process appointment bookings and payments</li>
              <li>To provide personalized health assessments and service recommendations</li>
              <li>To communicate with you about your appointments, follow-ups, and updates</li>
              <li>To assign appropriate practitioners based on your needs</li>
              <li>To improve our services and user experience</li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <ul>
              <li>Your data is stored securely on encrypted servers.</li>
              <li>We implement industry-standard security measures to prevent unauthorized access, disclosure, or alteration of your information.</li>
              <li>Payment information is processed through secure, PCI-compliant payment gateways and is not stored on our servers.</li>
            </ul>

            <h2>5. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share your data only in the following cases:</p>
            <ul>
              <li><strong>With practitioners:</strong> To facilitate your appointments and provide appropriate care.</li>
              <li><strong>With payment processors:</strong> To process your transactions securely.</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights.</li>
            </ul>

            <h2>6. Confidentiality of Health Data</h2>
            <p>
              We understand the sensitive nature of health and spiritual information. All assessment data,
              session notes, and medical conditions shared with us are treated with the highest level of confidentiality.
              Only authorized practitioners and administrators have access to this information.
            </p>

            <h2>7. Cookies</h2>
            <p>
              We use essential cookies to remember your language preference and session state.
              We do not use tracking or advertising cookies.
            </p>

            <h2>8. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data stored with us</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>

            <h2>9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed at children under 13. If a parent or guardian books on behalf
              of a minor, the parent/guardian is responsible for providing consent and accurate information.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Changes will be posted on this page with
              an updated revision date. Continued use of our services constitutes acceptance of the updated policy.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or wish to exercise your rights, contact us at:
              <br />
              Email: privacy@sunnahcure.com
              <br />
              Phone: +880 1234-567890
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
