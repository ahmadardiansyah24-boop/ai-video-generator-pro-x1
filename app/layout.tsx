import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI World Studio X — AI Video Generator PRO',
  description: 'AI Video Generator PRO by Ahmad Yurid Ardiansah, S.Pd.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
