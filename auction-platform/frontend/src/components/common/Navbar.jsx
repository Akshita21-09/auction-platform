import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { getInitials } from '../../utils/helpers';
import {
  FiHome, FiList, FiPlusCircle, FiUser, FiLogOut,
  FiLogIn, FiSun, FiMoon, FiMenu, FiX, FiZap
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: <FiHome /> },
    { to: '/auctions', label: 'Auctions', icon: <FiList /> },
    ...(user ? [{ to: '/create-auction', label: 'Sell', icon: <FiPlusCircle /> }] : []),
    ...(user ? [{ to: '/dashboard', label: 'Dashboard', icon: <FiZap /> }] : []),
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass shadow-xl shadow-black/20 border-b border-dark-600/80' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-primary-500/40 transition-all duration-300">
              B
            </div>
            <span className="font-display font-bold text-lg text-white">
              Bid<span className="text-gradient">Verse</span>
            </span>
            {isConnected && (
              <span className="hidden sm:flex items-center gap-1 text-xs text-green-400 font-medium">
                <span className="live-dot" />
                LIVE
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-dark-700'
                  }`
                }
              >
                {icon} {label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                  <span className="text-sm text-slate-200 font-medium max-w-24 truncate">{user.name}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 card border border-dark-600 shadow-2xl shadow-black/50 animate-fade-in">
                    <div className="p-3 border-b border-dark-600">
                      <p className="text-sm font-medium text-white truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all">
                        <FiUser size={14} /> Profile
                      </Link>
                      <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-dark-600 rounded-lg transition-all">
                        <FiZap size={14} /> Dashboard
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">
                  <FiLogIn size={14} /> Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-dark-700 transition-all"
          >
            {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-dark-600 animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-primary-500/15 text-primary-400' : 'text-slate-400 hover:text-white hover:bg-dark-700'
                  }`
                }
              >
                {icon} {label}
              </NavLink>
            ))}
            <div className="pt-3 border-t border-dark-600 flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700">
                {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              {user ? (
                <button onClick={handleLogout} className="btn-danger text-sm py-2 px-4 flex-1">
                  <FiLogOut size={14} /> Sign Out
                </button>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4 flex-1 text-center">Sign In</Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close profile */}
      {profileOpen && (
        <div className="fixed inset-0 z-[-1]" onClick={() => setProfileOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;
