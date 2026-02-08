import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KidActivity - Find Camps & Classes',
  description: 'The best way to find local activities for your children.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
              <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                Built by Antigravity. The source code is available on{' '}
                <a href="#" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4">GitHub</a>.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
