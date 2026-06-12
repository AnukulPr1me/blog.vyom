import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
export const metadata: Metadata = { title: 'Disclaimer' };
export default function DisclaimerPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Disclaimer</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 1, 2025</p>
        <div className="article-body">
          <p>The information provided on Vyom (vyom.quest) is for general informational purposes only. All content is provided in good faith; however, we make no representation or warranty regarding accuracy, adequacy, validity, reliability, availability, or completeness.</p>
          <h2>No Professional Advice</h2>
          <p>Nothing on this site constitutes professional advice (financial, legal, medical, or otherwise). Always consult a qualified professional before making decisions based on our content.</p>
          <h2>External Links</h2>
          <p>Vyom may contain links to external websites. We have no control over the content of those sites and accept no responsibility for them.</p>
          <h2>Affiliate Disclaimer</h2>
          <p>Some links on Vyom may be affiliate links. If you click and purchase, we may earn a small commission at no extra cost to you. We only recommend products and services we genuinely believe in.</p>
          <h2>Errors and Omissions</h2>
          <p>While we strive for accuracy, tech information changes rapidly. If you find an error, please contact us at <a href="mailto:hi.kio2002@gmail.com">hi.kio2002@gmail.com</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
