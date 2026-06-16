import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { getSiteSettings } from '@/lib/server-api';
import '@/styles/globals.css';

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
        {/*
          Performance: preconnect to Google Fonts origins so the DNS lookup
          and TCP/TLS handshake happen in parallel with HTML parsing.
          Then use display=swap so text renders immediately in a fallback font
          while the custom fonts load — prevents invisible text (FOIT).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Non-blocking font load: media="print" trick loads async, then switches to all */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
          media="print"
          // @ts-ignore — onload is valid for link elements
          onLoad="this.media='all'"
        />
        {/* Fallback for no-JS */}
        <noscript>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
            rel="stylesheet"
          />
        </noscript>

        {/* AdSense — async so it never blocks rendering */}
        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Google Analytics — deferred, non-blocking */}
        {settings.googleAnalyticsId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}',{send_page_view:false});`,
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
