import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import AuctionCard from '../components/auction/AuctionCard';
import { FiArrowRight, FiZap, FiShield, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { formatCurrency } from '../utils/helpers';

const STATS = [
  { label: 'Active Auctions', value: '2,400+', icon: <FiZap /> },
  { label: 'Registered Users', value: '18,000+', icon: <FiUsers /> },
  { label: 'Total Sold', value: '$4.2M+', icon: <FiTrendingUp /> },
  { label: 'Avg. Auction Time', value: '72hrs', icon: <FiClock /> },
];

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', count: 240 },
  { name: 'Art', emoji: '🎨', count: 180 },
  { name: 'Collectibles', emoji: '🏆', count: 320 },
  { name: 'Jewelry', emoji: '💎', count: 95 },
  { name: 'Vehicles', emoji: '🚗', count: 60 },
  { name: 'Fashion', emoji: '👗', count: 150 },
];

const Home = () => {
  const [featuredAuctions, setFeaturedAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await auctionService.getAll({ limit: 6, sort: '-totalBids' });
        setFeaturedAuctions(res.data.auctions);
      } catch (e) {
        // Silently fail - show empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-400 text-sm font-medium mb-8">
              <span className="live-dot" />
              Live Bidding Active Now
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-[1.05] mb-6">
              Win Big with{' '}
              <span className="text-gradient block">Real-Time</span>
              Auctions
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed mb-10 max-w-lg">
              Bid live on thousands of unique items. Watch prices update in real-time,
              compete with bidders worldwide, and win incredible deals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auctions" className="btn-primary text-base px-8 py-3.5 shadow-2xl shadow-primary-500/30">
                Browse Auctions <FiArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn-secondary text-base px-8 py-3.5">
                Start Selling Free
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-dark-600">
              {[
                { icon: <FiShield size={16} />, text: 'Secure Payments' },
                { icon: <FiZap size={16} />, text: 'Real-Time Bidding' },
                { icon: <FiUsers size={16} />, text: '18K+ Users' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="text-primary-400">{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:block relative animate-fade-in">
            <div className="relative">
              {/* Main card */}
              <div className="card glow-border p-6 max-w-sm mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=280&fit=crop"
                  alt="Featured auction"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="badge-active mb-2 w-fit"><FiZap size={10} /> LIVE AUCTION</div>
                <h3 className="font-display font-bold text-white mb-3">Vintage Rolex Submariner</h3>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500">Current Bid</p>
                    <p className="price-tag text-2xl font-bold">$8,400</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Ends in</p>
                    <p className="text-sm font-mono text-red-400 font-bold animate-pulse">2h 14m 33s</p>
                  </div>
                </div>
              </div>

              {/* Floating bid notification */}
              <div className="absolute -top-4 -right-4 card p-3 border border-green-500/30 shadow-lg shadow-green-500/10 animate-bounce-slow">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-xs">↑</div>
                  <div>
                    <p className="text-xs font-bold text-white">New Bid!</p>
                    <p className="text-xs text-green-400 font-mono">+$200</p>
                  </div>
                </div>
              </div>

              {/* Live viewers */}
              <div className="absolute -bottom-4 -left-4 card p-3 border border-primary-500/20">
                <div className="flex items-center gap-2">
                  <FiUsers size={14} className="text-primary-400" />
                  <p className="text-xs text-white font-medium">247 watching live</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-dark-600 bg-dark-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon }) => (
              <div key={label} className="text-center">
                <div className="text-primary-400 flex justify-center mb-2 text-xl">{icon}</div>
                <p className="text-3xl font-display font-bold text-white">{value}</p>
                <p className="text-slate-500 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Featured Auctions</h2>
            <p className="text-slate-400 mt-2">Hottest items with the most bidding activity</p>
          </div>
          <Link to="/auctions" className="btn-secondary text-sm hidden sm:flex">
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-48 bg-dark-600 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-dark-600 rounded w-3/4" />
                  <div className="h-3 bg-dark-600 rounded w-1/2" />
                  <div className="h-6 bg-dark-600 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredAuctions.map(auction => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg mb-4">No auctions yet. Be the first to create one!</p>
            <Link to="/create-auction" className="btn-primary">Create First Auction</Link>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link to="/auctions" className="btn-secondary">View All Auctions <FiArrowRight size={14} /></Link>
        </div>
      </section>

      {/* Categories */}
      <section className="page-container border-t border-dark-600">
        <h2 className="section-title mb-2">Browse by Category</h2>
        <p className="text-slate-400 mb-8">Find auctions in your area of interest</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(({ name, emoji, count }) => (
            <Link
              key={name}
              to={`/auctions?category=${name}`}
              className="card p-4 text-center hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {emoji}
              </div>
              <p className="font-semibold text-white text-sm">{name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{count} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="page-container mb-8">
        <div className="card p-10 lg:p-16 text-center relative overflow-hidden glow-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-accent-500/10" />
          <div className="relative">
            <h2 className="section-title mb-4">Ready to Start Winning?</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of bidders and sellers on the most exciting live auction platform.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 shadow-2xl shadow-primary-500/30">
                Create Free Account
              </Link>
              <Link to="/auctions" className="btn-secondary text-base px-8 py-3.5">
                Browse Auctions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-xs">B</div>
            <span className="font-display font-bold text-white">BidVerse</span>
          </div>
          <p className="text-slate-500 text-sm">© 2024 BidVerse. Real-Time Auction Platform. Built with ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
