import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';

export const metadata: Metadata = { title: 'Privacy Policy' };
export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 1, 2025</p>
        <div className="article-body">
          <p>At Vyom (<strong>vyom.quest</strong>), we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect information about you when you visit our website.</p>
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Usage data</strong> — pages visited, time spent, browser type, device info, and IP address via analytics tools.</li>
            <li><strong>Newsletter subscriptions</strong> — your email address if you choose to subscribe.</li>
            <li><strong>Contact form submissions</strong> — your name, email, and message when you contact us.</li>
          </ul>
          <h2>How We Use Information</h2>
          <ul>
            <li>To improve content and user experience</li>
            <li>To send newsletters (only if you subscribed)</li>
            <li>To respond to your messages</li>
            <li>To display relevant advertising (via Google AdSense)</li>
          </ul>
          <h2>Cookies</h2>
          <p>We use cookies for analytics and advertising. You can control cookie preferences through your browser settings. See our <a href="/cookie-policy">Cookie Policy</a> for details.</p>
          <h2>Third-Party Services</h2>
          <p>We use Google Analytics and Google AdSense, which may collect data per their own privacy policies. We don't sell your personal data to any third party.</p>
          <h2>Data Retention</h2>
          <p>Newsletter subscriber emails are retained until you unsubscribe. Contact form messages are retained for 1 year.</p>
          <h2>Your Rights</h2>
          <p>You may request access to, correction, or deletion of your personal data by emailing <a href="mailto:hello@vyom.quest">hello@vyom.quest</a>.</p>
          <h2>Contact</h2>
          <p>Questions about this policy? Email <a href="mailto:hello@vyom.quest">hello@vyom.quest</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
