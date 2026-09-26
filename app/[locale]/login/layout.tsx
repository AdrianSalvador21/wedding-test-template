import type { ReactNode } from 'react';
import { AuthProvider } from '../../../lib/auth-context';
import AdminAnalytics from '../../../components/analytics/AdminAnalytics';

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminAnalytics />
      {children}
    </AuthProvider>
  );
}
