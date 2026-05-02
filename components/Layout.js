import { useRouter } from 'next/router';
import Sidebar from './Sidebar';

const AUTH_ROUTES = ['/auth/login', '/auth/signup'];

export default function Layout({ children }) {
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.some(r => router.pathname.startsWith(r));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
