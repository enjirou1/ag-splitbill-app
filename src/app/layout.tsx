import '@/presentation/styles/globals.css';
import { ReduxProvider } from '@/presentation/store/Provider';

export const metadata = {
  title: 'Enwari - Split bills, made easy',
  description: 'Split bills made easy. Easily split bills with friends using Enwari.',
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
