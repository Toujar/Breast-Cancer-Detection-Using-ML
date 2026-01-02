import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { AIChatbotProvider } from '@/components/ai-chatbot-provider';
import { ClerkProvider } from "@clerk/nextjs";
// import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Breast Cancer Detection System',
  description: 'Advanced AI-powered breast cancer detection and analysis platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${inter.className} bg-gray-900 text-gray-100`}>
          <AIChatbotProvider>
            {children}
            <Toaster />
          </AIChatbotProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}