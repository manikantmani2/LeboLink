import './globals.css';
import { ReactNode } from 'react';
import Providers from './providers';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme-context';

export const metadata = {
  title: 'LeboLink - 30 Min Labour Delivery',
  description: 'Book trusted local workers instantly. Electricians, plumbers, cleaners & more delivered in 30 minutes',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <ThemeProvider>
          <AuthProvider>
            <Providers>
              <main className="flex-1 w-full">{children}</main>
            </Providers>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
