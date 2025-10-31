import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PostHogProvider from './providers/PostHogProvider';
import ClientAuthListener from './client-auth-listener';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartProBono Lite - AI Legal Assistant',
  description: 'AI-powered intake assistant for small law firms',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PostHogProvider>
          <ClientAuthListener />
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}

