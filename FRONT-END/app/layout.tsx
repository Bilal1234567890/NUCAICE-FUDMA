import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NUCAICE – NUC AI Centre of Excellence | FUDMA',
  description: 'NUC Artificial Intelligence Center of Excellence at Federal University Dutsinma',
  keywords: ['AI', 'Artificial Intelligence', 'FUDMA', 'NUCAICE', 'Research'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}