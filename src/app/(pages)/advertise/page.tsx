import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import ContactForm from '@/components/common/ContactForm';
export const metadata: Metadata = { title: 'Advertise With Us' };
export default function AdvertisePage() {
  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Advertise With Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Reach a targeted tech-savvy audience on Vyom.</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <div className="article-body mb-8">
              <h2>Why Advertise on Vyom?</h2>
              <ul>
                <li>Targeted tech audience — readers who buy gadgets, software, and services</li>
                <li>High-quality editorial environment</li>
                <li>Multiple ad formats available</li>
                <li>Transparent reporting and analytics</li>
              </ul>
              <h2>Ad Options</h2>
              <ul>
                <li><strong>Display Ads</strong> — Banner and sidebar placements</li>
                <li><strong>Sponsored Content</strong> — Native articles clearly marked as sponsored</li>
                <li><strong>Newsletter Sponsorship</strong> — Reach our subscriber base directly</li>
                <li><strong>Product Reviews</strong> — Editorial reviews of your products (subject to editorial policy)</li>
              </ul>
              <h2>Get in Touch</h2>
              <p>Fill out the form and we&apos;ll get back to you within 48 hours with a media kit and pricing.</p>
            </div>
          </div>
          <div className="card p-6"><ContactForm /></div>
        </div>
      </div>
    </PublicLayout>
  );
}
