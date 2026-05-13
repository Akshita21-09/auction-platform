import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionService, bidService } from '../services/auctionService';
import { useAuth } from '../context/AuthContext';
import AuctionCard from '../components/auction/AuctionCard';
import Loader from '../components/common/Loader';
import { formatCurrency, formatTimeAgo } from '../utils/helpers';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import {
  FiZap, FiTrendingUp, FiAward, FiList, FiPlusCircle,
  FiClock, FiDollarSign, FiActivity, FiArrowRight
} from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartDefaults = {
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      padding: 10,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(51,65,85,0.5)' }, ticks: { color: '#64748b', font: { size: 11 } } },
  },
  responsive: true,
  maintainAspectRatio: false,
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [myWins, setMyWins] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, listingsRes, winsRes, bidsRes] = await Promise.all([
          auctionService.getDashboardStats(),
          auctionService.getMyListings(),
          auctionService.getMyWins(),
          bidService.getUserHistory(),
        ]);
        setStats(statsRes.data.stats);
        setMyListings(listingsRes.data.auctions);
        setMyWins(winsRes.data.auctions);
        setBidHistory(bidsRes.data.bids);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Loader size="lg" text="Loading dashboard..." />
    </div>
  );

  // Chart data
  const bidActivityLabels = stats?.bidActivity?.map(b => b._id) || [];
  const bidActivityData = stats?.bidActivity?.map(b => b.count) || [];

  const lineChartData = {
    labels: bidActivityLabels.length > 0 ? bidActivityLabels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: bidActivityData.length > 0 ? bidActivityData : [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#0ea5e9',
      backgroundColor: 'rgba(14,165,233,0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0ea5e9',
      pointRadius: 4,
    }]
  };

  const statCards = [
    {
      label: 'Active Auctions',
      value: stats?.activeAuctions ?? 0,
      icon: <FiZap size={20} />,
      color: 'from-primary-600 to-primary-400',
      bg: 'bg-primary-500/10',
      text: 'text-primary-400',
      link: '/auctions',
    },
    {
      label: 'My Listings',
      value: stats?.myListings ?? 0,
      icon: <FiList size={20} />,
      color: 'from-violet-600 to-violet-400',
      bg: 'bg-violet-500/10',
      text: 'text-violet-400',
      link: null,
    },
    {
      label: 'Auctions Won',
      value: stats?.myWins ?? 0,
      icon: <FiAward size={20} />,
      color: 'from-amber-600 to-amber-400',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      link: null,
    },
    {
      label: 'Total Bids',
      value: stats?.totalBidsPlaced ?? 0,
      icon: <FiTrendingUp size={20} />,
      color: 'from-green-600 to-green-400',
      bg: 'bg-green-500/10',
      text: 'text-green-400',
      link: null,
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiActivity size={15} /> },
    { id: 'listings', label: `My Listings (${myListings.length})`, icon: <FiList size={15} /> },
    { id: 'wins', label: `Won (${myWins.length})`, icon: <FiAward size={15} /> },
    { id: 'bids', label: `Bid History (${bidHistory.length})`, icon: <FiTrendingUp size={15} /> },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-8 border-b border-dark-600 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 mt-1">Here's what's happening with your auctions</p>
          </div>
          <Link to="/create-auction" className="btn-primary self-start sm:self-auto">
            <FiPlusCircle size={16} /> New Auction
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, value, icon, bg, text, link }) => (
            <div key={label} className="card p-5 hover:border-dark-500 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`stat-icon w-10 h-10 ${bg} ${text}`}>
                  {icon}
                </div>
                {link && (
                  <Link to={link} className="text-slate-600 hover:text-primary-400 transition-colors">
                    <FiArrowRight size={14} />
                  </Link>
                )}
              </div>
              <p className="text-2xl font-display font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-dark-600 mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Charts row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bid activity chart */}
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-1">Bid Activity (Last 7 Days)</h3>
                <p className="text-xs text-slate-500 mb-4">Number of bids you placed per day</p>
                <div className="h-48">
                  <Line data={lineChartData} options={chartDefaults} />
                </div>
              </div>

              {/* Summary stats */}
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-4">Account Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), icon: <FiClock size={14} /> },
                    { label: 'Total Bids Placed', value: user?.totalBids || 0, icon: <FiTrendingUp size={14} /> },
                    { label: 'Auctions Won', value: user?.totalWins || 0, icon: <FiAward size={14} /> },
                    { label: 'Active Listings', value: myListings.filter(a => a.status === 'active').length, icon: <FiList size={14} /> },
                  ].map(({ label, value, icon }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-dark-600 last:border-0">
                      <span className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="text-primary-400">{icon}</span>
                        {label}
                      </span>
                      <span className="text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {stats?.recentActivity?.length > 0 && (
              <div className="card overflow-hidden">
                <div className="px-5 py-4 border-b border-dark-600">
                  <h3 className="font-semibold text-white">Recent Bid Activity</h3>
                </div>
                <div className="divide-y divide-dark-600">
                  {stats.recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-4 px-5 py-3.5 hover:bg-dark-600/30 transition-colors">
                      <img
                        src={activity.auction?.image || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=60&h=60&fit=crop'}
                        alt={activity.auction?.title}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1560472355-536de3962603?w=60&h=60&fit=crop'}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{activity.auction?.title}</p>
                        <p className="text-xs text-slate-500">{formatTimeAgo(activity.createdAt)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold text-primary-400 text-sm">{formatCurrency(activity.amount)}</p>
                        <span className={`text-xs ${activity.auction?.status === 'active' ? 'text-green-400' : 'text-slate-500'}`}>
                          {activity.auction?.status === 'active' ? '● Active' : 'Ended'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div className="animate-fade-in">
            {myListings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No listings yet</h3>
                <p className="text-slate-400 mb-6">Create your first auction and start selling</p>
                <Link to="/create-auction" className="btn-primary">
                  <FiPlusCircle size={16} /> Create Auction
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myListings.map(auction => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Won Auctions Tab */}
        {activeTab === 'wins' && (
          <div className="animate-fade-in">
            {myWins.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No wins yet</h3>
                <p className="text-slate-400 mb-6">Bid on active auctions to win amazing items</p>
                <Link to="/auctions" className="btn-primary">Browse Auctions</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {myWins.map(auction => (
                  <AuctionCard key={auction._id} auction={auction} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bid History Tab */}
        {activeTab === 'bids' && (
          <div className="animate-fade-in">
            {bidHistory.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔨</div>
                <h3 className="text-xl font-display font-bold text-white mb-2">No bid history</h3>
                <p className="text-slate-400 mb-6">Start bidding on live auctions</p>
                <Link to="/auctions" className="btn-primary">Find Auctions</Link>
              </div>
            ) : (
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-dark-600">
                        <th className="text-left px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Auction</th>
                        <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider">Your Bid</th>
                        <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider hidden sm:table-cell">Final Price</th>
                        <th className="text-center px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                        <th className="text-right px-5 py-3.5 text-xs font-medium text-slate-400 uppercase tracking-wider hidden lg:table-cell">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-600">
                      {bidHistory.map((bid, i) => (
                        <tr key={bid._id || i} className="hover:bg-dark-600/30 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={bid.auction?.image || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=60&h=60&fit=crop'}
                                alt={bid.auction?.title}
                                className="w-10 h-10 rounded-lg object-cover shrink-0 hidden sm:block"
                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1560472355-536de3962603?w=60&h=60&fit=crop'}
                              />
                              <div className="min-w-0">
                                <Link
                                  to={`/auctions/${bid.auction?._id}`}
                                  className="text-sm font-medium text-white hover:text-primary-400 transition-colors truncate block max-w-48"
                                >
                                  {bid.auction?.title || 'Deleted Auction'}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="font-mono font-bold text-primary-400 text-sm">{formatCurrency(bid.amount)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right hidden sm:table-cell">
                            <span className="font-mono text-sm text-slate-300">{formatCurrency(bid.auction?.currentBid)}</span>
                          </td>
                          <td className="px-5 py-3.5 text-center hidden md:table-cell">
                            <span className={`badge text-xs border ${
                              bid.auction?.status === 'active'
                                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                                : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                            }`}>
                              {bid.auction?.status === 'active' ? 'Live' : 'Ended'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right hidden lg:table-cell">
                            <span className="text-xs text-slate-500">{formatTimeAgo(bid.createdAt)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
