import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Navbar(){
  const { user, role, logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="font-bold text-lg">Team Task Manager</Link>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/tasks">Tasks</Link>
          <Link href="/teams">Teams</Link>
          {user ? (
            <>
              <span className="text-sm text-gray-600">{role}</span>
              <button onClick={logout} className="ml-2 px-3 py-1 bg-red-500 text-white rounded">Logout</button>
            </>
          ) : (
            <Link href="/auth/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
