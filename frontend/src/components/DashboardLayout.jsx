import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const roleLabels = {
  admin: 'Administrator',
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
};

const adminNavLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/staff', label: 'Staff & Parents' },
  { to: '/admin/timetable', label: 'Timetable' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/exams', label: 'Exams' },
];

const DashboardLayout = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg">EduTrack</span>
            <span className="text-slate-300 text-sm ml-3">{title}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-slate-300">{roleLabels[user?.role]}</div>
            </div>
            <Link
              to="/account"
              className="text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              Account
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm bg-white/10 hover:bg-white/20 rounded-lg px-3 py-1.5 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
        {user?.role === 'admin' && (
          <div className="max-w-6xl mx-auto px-6 flex gap-1 border-t border-white/10">
            {adminNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm px-3 py-2 border-b-2 transition-colors ${
                  location.pathname === link.to
                    ? 'border-white text-white'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8 flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
