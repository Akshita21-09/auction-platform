import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import Loader from '../components/common/Loader';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const getPasswordStrength = (pw) => {
    if (!pw) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    const levels = [
      { level: 0, label: '', color: '' },
      { level: 1, label: 'Weak', color: 'text-red-400' },
      { level: 2, label: 'Fair', color: 'text-amber-400' },
      { level: 3, label: 'Good', color: 'text-blue-400' },
      { level: 4, label: 'Strong', color: 'text-green-400' },
    ];
    return levels[score] || levels[0];
  };

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill in all fields');
    if (form.name.length < 2) return toast.error('Name must be at least 2 characters');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created! Welcome to BidVerse! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    'Bid on thousands of live auctions',
    'Create and manage your own auctions',
    'Real-time notifications & updates',
    'Secure payments & buyer protection',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4 py-12">
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-primary-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -left-40 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl relative animate-slide-up">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left - perks */}
          <div className="hidden lg:block pt-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">B</div>
              <span className="font-display font-bold text-xl text-white">BidVerse</span>
            </Link>

            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Start winning <span className="text-gradient">amazing deals</span> today
            </h2>
            <p className="text-slate-400 mb-8">
              Join over 18,000 buyers and sellers on the most exciting real-time auction platform.
            </p>

            <div className="space-y-3">
              {perks.map(perk => (
                <div key={perk} className="flex items-center gap-3">
                  <FiCheckCircle size={18} className="text-primary-400 shrink-0" />
                  <span className="text-slate-300 text-sm">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - form */}
          <div className="card border border-dark-600 p-8">
            <div className="text-center mb-7">
              <h1 className="text-2xl font-display font-bold text-white">Create Account</h1>
              <p className="text-slate-400 text-sm mt-2">Free forever. No credit card required.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="input pl-10"
                    required
                    minLength={2}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <div className="relative">
                  <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                <div className="relative">
                  <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="input pl-10 pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {form.password && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.level
                              ? strength.level <= 1 ? 'bg-red-400'
                              : strength.level === 2 ? 'bg-amber-400'
                              : strength.level === 3 ? 'bg-blue-400'
                              : 'bg-green-400'
                              : 'bg-dark-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <FiLock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className={`input pl-10 ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-500 focus:border-red-500'
                        : form.confirmPassword && form.password === form.confirmPassword
                        ? 'border-green-500 focus:border-green-500'
                        : ''
                    }`}
                    required
                  />
                  {form.confirmPassword && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {form.password === form.confirmPassword
                        ? <FiCheckCircle size={16} className="text-green-400" />
                        : <span className="text-red-400 text-xs">✗</span>
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* T&C */}
              <p className="text-xs text-slate-500 text-center">
                By creating an account, you agree to our{' '}
                <span className="text-primary-400 cursor-pointer hover:underline">Terms of Service</span> and{' '}
                <span className="text-primary-400 cursor-pointer hover:underline">Privacy Policy</span>
              </p>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? <Loader size="sm" /> : (
                  <><FiUserPlus size={18} /> Create Free Account</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
