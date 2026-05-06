import '@/presentation/styles/globals.css';
import { ReduxProvider } from '@/presentation/store/Provider';

export const metadata = {
  title: 'Split Bill - Modern Bill Splitting App',
  description: 'Easily split bills with friends using OCR and PDF export.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
