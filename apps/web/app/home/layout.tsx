import ProtectedRoute from '@/components/ProtectedRoute';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
