import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auctionService';
import toast from 'react-hot-toast';
import { getInitials, formatDate } from '../utils/helpers';
import { FiUser, FiMail, FiEdit2, FiSave, FiLock, FiCalendar, FiAward, FiTrendingUp } from 'react-icons/fi';
import Loader from '../components/common/Loader';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPw, setLoadingPw] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async () => {
    if (!form.name.trim()) return toast.error('Name cannot be empty');
    setLoadingProfile(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Please fill all fields');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');

    setLoadingPw(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoadingPw(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-display font-bold text-white mb-1">My Profile</h1>
          <p className="text-slate-400">Manage your account information and security</p>
        </div>

        {/* Profile header card */}
        <div className="card border border-dark-600 p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary-500/20">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-display font-bold text-white">{user?.name}</h2>
              <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
              {user?.bio && <p className="text-slate-400 text-sm mt-2">{user.bio}</p>}
              <p className="text-xs text-slate-600 mt-2 flex items-center gap-1.5">
                <FiCalendar size={12} />
                Member since {formatDate(user?.createdAt, 'MMMM yyyy')}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-dark-600">
            {[
              { label: 'Total Bids', value: user?.totalBids || 0, icon: <FiTrendingUp size={14} />, color: 'text-primary-400' },
              { label: 'Auctions Won', value: user?.totalWins || 0, icon: <FiAward size={14} />, color: 'text-amber-400' },
              { label: 'Account Age', value: `${Math.floor((Date.now() - new Date(user?.createdAt)) / (1000 * 60 * 60 * 24))} days`, icon: <FiCalendar size={14} />, color: 'text-green-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="text-center p-3 bg-dark-800 rounded-xl">
                <div className={`flex justify-center mb-1.5 ${color}`}>{icon}</div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-dark-600 mb-6">
          {[
            { id: 'profile', label: 'Edit Profile', icon: <FiUser size={14} /> },
            { id: 'security', label: 'Security', icon: <FiLock size={14} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card border border-dark-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Personal Information</h3>
              {!editMode ? (
                <button
                  onClick={() => setEditMode(true)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  <FiEdit2 size={13} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditMode(false); setForm({ name: user?.name || '', bio: user?.bio || '' }); }}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProfileSave}
                    disabled={loadingProfile}
                    className="btn-primary text-sm py-2 px-4"
                  >
                    {loadingProfile ? <Loader size="sm" /> : <><FiSave size={13} /> Save</>}
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <FiUser size={13} className="inline mr-1.5" /> Full Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input"
                    maxLength={50}
                  />
                ) : (
                  <p className="text-white font-medium py-3 px-4 bg-dark-800 rounded-xl">{user?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  <FiMail size={13} className="inline mr-1.5" /> Email Address
                </label>
                <p className="text-slate-400 py-3 px-4 bg-dark-800 rounded-xl text-sm">
                  {user?.email}
                  <span className="ml-2 text-xs text-slate-600">(cannot be changed)</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Bio</label>
                {editMode ? (
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    className="input resize-none h-24"
                    maxLength={200}
                  />
                ) : (
                  <p className="text-white py-3 px-4 bg-dark-800 rounded-xl text-sm min-h-16">
                    {user?.bio || <span className="text-slate-600 italic">No bio set</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card border border-dark-600 p-6 animate-fade-in">
            <h3 className="font-semibold text-white mb-5">Change Password</h3>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
                { name: 'newPassword', label: 'New Password', placeholder: 'Min. 6 characters' },
                { name: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Re-enter new password' },
              ].map(({ name, label, placeholder }) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-slate-400 mb-2">{label}</label>
                  <input
                    type="password"
                    value={pwForm[name]}
                    onChange={e => setPwForm(p => ({ ...p, [name]: e.target.value }))}
                    placeholder={placeholder}
                    className="input"
                    required
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={loadingPw}
                className="btn-primary w-full py-3"
              >
                {loadingPw ? <Loader size="sm" /> : (
                  <><FiLock size={16} /> Update Password</>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-dark-600">
              <h4 className="text-sm font-semibold text-white mb-3">Password Requirements</h4>
              <ul className="text-xs text-slate-500 space-y-1.5">
                <li className="flex items-center gap-2"><span className="text-primary-400">•</span> At least 6 characters long</li>
                <li className="flex items-center gap-2"><span className="text-primary-400">•</span> Use a mix of letters and numbers for better security</li>
                <li className="flex items-center gap-2"><span className="text-primary-400">•</span> Avoid using easily guessable information</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
