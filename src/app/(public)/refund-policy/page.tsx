import { Card, CardContent } from "@/components/ui/card";

export default function RefundPolicyPage() {
  return (
    <div className="py-16 sm:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">
          Refund Policy
        </h1>
        <p className="text-muted-foreground mb-8">Last updated: March 29, 2026</p>

        <Card>
          <CardContent className="p-6 sm:p-8 prose prose-sm dark:prose-invert max-w-none">
            <h2>1. Overview</h2>
            <p>
              At Sunnah Cure Diagnostic Center, we strive to provide the best possible service.
              We understand that sometimes plans change, and we have established this refund policy
              to ensure fairness for both patients and our practitioners.
            </p>

            <h2>2. Online Service Payments</h2>
            <p>
              For online services (Islamic Counseling, Health Assessment), payment is required before
              the appointment is processed. Refunds for online payments are handled as follows:
            </p>
            <ul>
              <li>
                <strong>Before confirmation:</strong> If your appointment has not yet been confirmed
                by the practitioner, you may request a full refund.
              </li>
              <li>
                <strong>After confirmation, before session:</strong> If you cancel at least 24 hours
                before the scheduled session, you are eligible for a full refund. Cancellations within
                24 hours of the session are eligible for a 50% refund.
              </li>
              <li>
                <strong>After session:</strong> No refund is available once the session has been conducted.
              </li>
              <li>
                <strong>No-show:</strong> If you fail to attend a confirmed online session without prior
                notice, no refund will be issued.
              </li>
            </ul>

            <h2>3. Offline (In-Person) Service Payments</h2>
            <ul>
              <li>
                <strong>Hijama Therapy:</strong> Payment is typically made at the center after the session.
                If the patient has pre-paid, a full refund is available if cancelled before the session.
                No refund after the session has begun.
              </li>
              <li>
                <strong>Ruqyah Therapy:</strong> Similar to Hijama &mdash; cancellation before the session
                qualifies for a full refund. No refund after the session has started.
              </li>
              <li>
                <strong>In-person Counseling &amp; Assessment:</strong> Full refund if cancelled at least
                24 hours before the appointment. 50% refund for cancellations within 24 hours.
              </li>
            </ul>

            <h2>4. Cancelled by Sunnah Cure</h2>
            <p>
              If Sunnah Cure cancels or reschedules an appointment due to practitioner unavailability
              or any other reason on our end, you will receive a full refund or the option to reschedule
              at no additional cost.
            </p>

            <h2>5. How to Request a Refund</h2>
            <p>To request a refund:</p>
            <ol>
              <li>Contact us via phone (+880 1234-567890) or email (refund@sunnahcure.com)</li>
              <li>Provide your appointment ID and reason for cancellation</li>
              <li>Our team will review and process your request within 3-5 business days</li>
            </ol>

            <h2>6. Refund Processing</h2>
            <ul>
              <li>Refunds will be issued to the original payment method used during booking.</li>
              <li>
                <strong>bKash/Nagad/Rocket:</strong> Refund within 3-5 business days
              </li>
              <li>
                <strong>Card/Stripe/PayPal:</strong> Refund within 5-10 business days
              </li>
            </ul>

            <h2>7. Disputes</h2>
            <p>
              If you believe your refund request was unfairly denied, you may escalate the matter by
              contacting our management team at support@sunnahcure.com. We are committed to resolving
              all disputes amicably and in accordance with Islamic principles of fairness.
            </p>

            <h2>8. Exceptions</h2>
            <ul>
              <li>Promotional or discounted services may have different refund terms, which will be communicated at the time of booking.</li>
              <li>Services received as part of a package deal are refundable only for unused sessions.</li>
            </ul>

            <h2>9. Contact Us</h2>
            <p>
              For refund inquiries:
              <br />
              Email: refund@sunnahcure.com
              <br />
              Phone: +880 1234-567890
              <br />
              Address: 123 Healing Street, Dhanmondi, Dhaka, Bangladesh
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
