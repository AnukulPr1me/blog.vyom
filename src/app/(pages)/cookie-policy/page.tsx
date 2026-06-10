import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
export const metadata: Metadata = { title: 'Cookie Policy' };
export default function CookiePolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Cookie Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 1, 2025</p>
        <div className="article-body">
          <p>Vyom uses cookies and similar tracking technologies to improve your browsing experience and provide personalized content and advertising.</p>
          <h2>What Are Cookies?</h2>
          <p>Cookies are small text files stored on your device by your browser when you visit websites. They help websites remember your preferences and improve performance.</p>
          <h2>Cookies We Use</h2>
          <h3>Essential Cookies</h3>
          <p>Required for the website to function correctly (e.g., authentication, theme preference). These cannot be disabled.</p>
          <h3>Analytics Cookies</h3>
          <p>We use Google Analytics to understand how visitors interact with our site. Data collected is anonymized and helps us improve content.</p>
          <h3>Advertising Cookies</h3>
          <p>Google AdSense uses cookies to show relevant ads. These may track browsing behavior across websites to personalize ads.</p>
          <h2>Managing Cookies</h2>
          <p>You can control cookies through your browser settings. Disabling certain cookies may affect site functionality. Visit <a href="https://www.aboutcookies.org" target="_blank" rel="noopener noreferrer">aboutcookies.org</a> for instructions per browser.</p>
          <h2>Contact</h2>
          <p>Questions? Email <a href="mailto:hello@vyom.quest">hello@vyom.quest</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
