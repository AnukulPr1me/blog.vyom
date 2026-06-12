import type { Metadata } from 'next';
import { Mail, MapPin, Clock } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import ContactForm from '@/components/common/ContactForm';

export const metadata: Metadata = { title: 'Contact Us', description: 'Get in touch with the Vyom team.' };

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2" style={{ fontFamily: 'var(--font-syne)' }}>Contact Us</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10">Have a question, tip, or partnership inquiry? We&apos;d love to hear from you.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 card p-8"><ContactForm /></div>
          <aside className="space-y-6">
            {[
              { icon: Mail, title: 'Email', lines: ['hi.kio2002@gmail.com'] },
              { icon: MapPin, title: 'Location', lines: ['India'] },
              { icon: Clock, title: 'Response Time', lines: ['We typically reply within 24–48 hours on business days.'] },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="card p-5 flex gap-4">
                <div className="p-2.5 bg-brand-50 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400 flex-shrink-0 h-fit"><Icon size={18} /></div>
                <div><p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</p>{lines.map((l, i) => <p key={i} className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{l}</p>)}</div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </PublicLayout>
  );
}
