import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { getSiteSettings } from '@/lib/server-api';
import '@/styles/globals.css';

// Revalidate metadata when settings change in admin (60s cache)
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: `${settings.siteName} – ${settings.siteTagline}`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.metaDescription,
    metadataBase: new URL(settings.siteUrl),
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      locale: 'en_US',
      title: `${settings.siteName} – ${settings.siteTagline}`,
      description: settings.metaDescription,
    },
    twitter: {
      card: 'summary_large_image',
      site: settings.socialLinks.twitter || undefined,
      title: `${settings.siteName} – ${settings.siteTagline}`,
      description: settings.metaDescription,
    },
    robots: { index: true, follow: true },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const adsenseId = settings.adsensePublisherId || process.env.NEXT_PUBLIC_ADSENSE_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* AdSense */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
        {/* Google Analytics */}
        {settings.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${settings.googleAnalyticsId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="vyom-theme"
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{ className: '!text-sm', duration: 4000 }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
