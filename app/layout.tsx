import './globals.css';
import type { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import SessionProvider from '../components/layout/SessionProvider';

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-[#f1f5f9] font-sans min-h-screen">
        <SessionProvider session={session}>{children}</SessionProvider>
      </body>
    </html>
  );
}
