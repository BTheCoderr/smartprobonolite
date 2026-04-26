import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProviders } from './providers/AppProviders';
import { WebVitals } from '@/components/WebVitals';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartProBono — Legal help tools for everyday people',
  description:
    'Understand legal documents in plain English, chat with Ermi, generate drafts, and follow guided workflows—including DIY record-clearing prep and Rhode Island eviction help.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebVitals />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

