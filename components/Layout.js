import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AUTH_ROUTES = ['/auth/login', '/auth/signup'];
const LANDING = '/';

export default function Layout({ children }) {
  const router = useRouter();
  const isAuthPage = AUTH_ROUTES.some(r => router.pathname.startsWith(r));
  const isLanding = router.pathname === LANDING;

  if (isAuthPage || isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="page-content">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
