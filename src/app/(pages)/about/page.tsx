import type { Metadata } from 'next';
import PublicLayout from '@/components/layout/PublicLayout';
import ContactForm from '@/components/common/ContactForm';

export const metadata: Metadata = { title: 'About Us', description: 'Learn about Vyom, your go-to tech publication.' };

export default function AboutPage() {
  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>About Vyom</h1>
        <p className="text-brand-600 dark:text-brand-400 font-medium mb-8">Your Tech Universe</p>
        <div className="article-body">
          <p>Welcome to <strong>Vyom</strong> — a modern technology publication dedicated to delivering accurate, insightful, and engaging tech content for enthusiasts, professionals, and everyday users alike.</p>
          <p>We cover everything from the latest smartphones and laptops to artificial intelligence, software, and the broader digital landscape. Our goal is simple: help you make sense of a rapidly changing tech world.</p>
          <h2>Our Mission</h2>
          <p>At Vyom, we believe that technology coverage should be honest, well-researched, and accessible. We don't chase clicks or write sensational headlines — we write articles we'd want to read ourselves.</p>
          <h2>What We Cover</h2>
          <ul>
            <li><strong>Smartphones</strong> — Reviews, comparisons, and buying guides</li>
            <li><strong>Laptops & PCs</strong> — Deep dives, benchmarks, and recommendations</li>
            <li><strong>AI & Software</strong> — News, analysis, and how-tos</li>
            <li><strong>Tech News</strong> — Breaking stories and industry developments</li>
            <li><strong>Reviews</strong> — Hands-on coverage of the latest gadgets</li>
          </ul>
          <h2>Editorial Independence</h2>
          <p>Vyom maintains strict editorial independence. Our reviews and opinions are never influenced by advertisers or manufacturers. When we recommend a product, it's because we genuinely believe it's worth your attention.</p>
          <h2>Contact Us</h2>
          <p>Have a tip, question, or partnership inquiry? Reach us at <a href="mailto:hello@vyom.quest">hello@vyom.quest</a> or use our <a href="/contact">contact form</a>.</p>
        </div>
      </div>
    </PublicLayout>
  );
}
