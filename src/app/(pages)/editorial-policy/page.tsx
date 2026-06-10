import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
export const metadata: Metadata = { title: 'Editorial Policy' };
export default function EditorialPolicyPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Editorial Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: January 1, 2025</p>
        <div className="article-body">
          <p>Vyom is committed to delivering accurate, fair, and well-researched technology journalism. This policy outlines the standards and practices that govern our content.</p>
          <h2>Independence</h2>
          <p>Vyom&apos;s editorial team operates with full independence. Advertisers, sponsors, and manufacturers have no influence over our editorial decisions, reviews, or opinions.</p>
          <h2>Accuracy</h2>
          <p>We verify facts before publishing. When we make mistakes, we correct them promptly and transparently with a visible correction notice.</p>
          <h2>Transparency</h2>
          <p>We clearly disclose when content is sponsored, when we&apos;ve received review units from manufacturers, and when articles contain affiliate links.</p>
          <h2>Review Standards</h2>
          <p>Our product reviews are based on hands-on testing or verified user experience. We never accept payment for positive reviews. Ratings reflect genuine assessment.</p>
          <h2>Sources</h2>
          <p>We attribute all sources clearly. When using information from press releases or manufacturer specs, we note this explicitly.</p>
          <h2>Updates</h2>
          <p>We update articles when significant information changes, marking them with an &quot;Updated&quot; date and noting what changed.</p>
          <h2>Contact the Editorial Team</h2>
          <p>Questions, corrections, or tips? Email <a href="mailto:editorial@vyom.quest">editorial@vyom.quest</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
