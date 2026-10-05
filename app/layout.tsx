import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Dapur Mamak Management System | Bakery Private OS',
  description: 'Sistem pencatatan produksi resep, stok bahan baku, dan pembukuan keuangan toko roti Dapur Mamak.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950">
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
