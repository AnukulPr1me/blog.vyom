import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
export const metadata: Metadata = { title: 'Terms and Conditions' };
export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Terms and Conditions</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 1, 2025</p>
        <div className="article-body">
          <p>By accessing and using Vyom (vyom.quest), you accept and agree to be bound by these Terms and Conditions.</p>
          <h2>Use of Content</h2>
          <p>All content published on Vyom is for informational purposes. You may not reproduce, distribute, or republish our content without prior written permission.</p>
          <h2>Intellectual Property</h2>
          <p>All articles, images, logos, and content on Vyom are owned by Vyom or their respective creators and protected by copyright law.</p>
          <h2>Disclaimer of Warranties</h2>
          <p>Content is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or timeliness of any information.</p>
          <h2>Limitation of Liability</h2>
          <p>Vyom is not liable for any damages arising from your use of or inability to use this website.</p>
          <h2>External Links</h2>
          <p>We may link to third-party sites. We are not responsible for their content or practices.</p>
          <h2>Changes</h2>
          <p>We may update these terms at any time. Continued use constitutes acceptance.</p>
          <h2>Contact</h2>
          <p>Questions? Email <a href="mailto:hi.kio2002@gmail.com">hi.kio2002@gmail.com</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
