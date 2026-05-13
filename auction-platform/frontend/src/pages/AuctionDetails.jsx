import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { auctionService } from '../services/auctionService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import BidPanel from '../components/bid/BidPanel';
import CountdownTimer from '../components/auction/CountdownTimer';
import Loader from '../components/common/Loader';
import { formatCurrency, formatDate, formatTimeAgo, getStatusColor } from '../utils/helpers';
import {
  FiArrowLeft, FiShare2, FiUser, FiCalendar, FiTag,
  FiTrendingUp, FiCheckCircle, FiAlertTriangle, FiExternalLink
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [auction, setAuction] = useState(null);
  const [recentBids, setRecentBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  const [isEnded, setIsEnded] = useState(false);

  const loadAuction = useCallback(async () => {
    try {
      const res = await auctionService.getOne(id);
      setAuction(res.data.auction);
      setRecentBids(res.data.recentBids || []);
      setIsEnded(res.data.auction.status !== 'active' || new Date() > new Date(res.data.auction.endTime));
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Auction not found');
        navigate('/auctions');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadAuction();
  }, [loadAuction]);

  const handleAuctionEnd = useCallback(() => {
    setIsEnded(true);
    setAuction(prev => prev ? { ...prev, status: 'ended' } : prev);
  }, []);

  const handleShare = async () => {
    try {
      await navigator.share({ title: auction?.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader size="lg" text="Loading auction..." />
      </div>
    );
  }

  if (!auction) return null;

  const isOwner = user && auction.seller?._id === user._id;
  const isActive = auction.status === 'active' && !isEnded;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-6 text-sm">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors">
            <FiArrowLeft size={16} /> Back
          </button>
          <span className="text-dark-600">›</span>
          <Link to="/auctions" className="text-slate-400 hover:text-white transition-colors">Auctions</Link>
          <span className="text-dark-600">›</span>
          <span className="text-slate-300 truncate max-w-48">{auction.title}</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column - image & details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Main image */}
            <div className="card overflow-hidden">
              <div className="relative">
                <img
                  src={auction.image || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop'}
                  alt={auction.title}
                  className="w-full aspect-video object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&h=500&fit=crop';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />

                {/* Status & category overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`badge border ${getStatusColor(isActive ? 'active' : 'ended')}`}>
                    {isActive ? '🟢 LIVE' : '⚪ Ended'}
                  </span>
                  <span className="badge-category">{auction.category}</span>
                </div>

                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-dark-800/80 backdrop-blur text-slate-300 hover:text-white border border-dark-600/80 transition-all"
                  >
                    <FiShare2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-display font-bold text-white mb-2 leading-tight">
                  {auction.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                  {auction.seller && (
                    <span className="flex items-center gap-1.5">
                      <FiUser size={14} className="text-primary-400" />
                      Sold by <span className="text-white ml-1">{auction.seller.name}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <FiCalendar size={14} className="text-primary-400" />
                    Listed {formatTimeAgo(auction.createdAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FiTrendingUp size={14} className="text-primary-400" />
                    {auction.totalBids} bids placed
                  </span>
                </div>

                {/* Timer */}
                {isActive && (
                  <div className="bg-dark-800 rounded-xl p-4 mb-4">
                    <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider font-medium">Auction Ends In</p>
                    <CountdownTimer
                      endTime={auction.endTime}
                      onEnd={handleAuctionEnd}
                    />
                    <p className="text-xs text-slate-500 mt-3">
                      Ends: {formatDate(auction.endTime, 'MMM dd, yyyy • hh:mm a')}
                    </p>
                  </div>
                )}

                {!isActive && auction.status === 'ended' && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4 flex items-start gap-3">
                    <FiCheckCircle className="text-green-400 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="text-sm font-semibold text-white">Auction Completed</p>
                      <p className="text-sm text-slate-400 mt-0.5">
                        {auction.winner
                          ? <>Won by <span className="text-white font-medium">{auction.winner.name}</span> for <span className="price-tag font-bold">{formatCurrency(auction.currentBid)}</span></>
                          : 'No bids were placed on this auction'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="flex gap-1 border-b border-dark-600 mb-5">
                  {['details', 'bids', 'seller'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-400'
                          : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                {activeTab === 'details' && (
                  <div className="space-y-4 animate-fade-in">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                      <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                        {auction.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Starting Price', value: formatCurrency(auction.startingPrice) },
                        { label: 'Current Bid', value: formatCurrency(auction.currentBid) },
                        { label: 'Total Bids', value: auction.totalBids.toString() },
                        { label: 'Category', value: auction.category },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-dark-800 rounded-xl p-3">
                          <p className="text-xs text-slate-500 mb-1">{label}</p>
                          <p className="text-sm font-semibold text-white font-mono">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'bids' && (
                  <div className="space-y-2 animate-fade-in">
                    {recentBids.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-8">No bids yet. Be the first!</p>
                    ) : (
                      recentBids.map((bid, i) => (
                        <div key={bid._id} className={`flex items-center justify-between p-3 rounded-xl ${
                          i === 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-dark-800'
                        }`}>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-white text-xs font-bold">
                              {bid.bidder?.name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{bid.bidder?.name || bid.bidderName}</p>
                              <p className="text-xs text-slate-500">{formatTimeAgo(bid.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-primary-400">{formatCurrency(bid.amount)}</p>
                            {i === 0 && <p className="text-xs text-green-400">Highest bid</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === 'seller' && auction.seller && (
                  <div className="animate-fade-in">
                    <div className="flex items-start gap-4 p-4 bg-dark-800 rounded-xl">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {auction.seller.name?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{auction.seller.name}</p>
                        <p className="text-sm text-slate-500">{auction.seller.email}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Member since {formatDate(auction.seller.createdAt, 'MMMM yyyy')}
                        </p>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                        <FiAlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-amber-300">This is your auction. You cannot bid on it.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column - bid panel */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
              {/* Price summary card */}
              <div className="card p-5 border border-dark-600">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm text-slate-400">
                    {auction.totalBids > 0 ? 'Current Bid' : 'Starting Price'}
                  </p>
                  <span className={`badge border text-xs ${getStatusColor(isActive ? 'active' : 'ended')}`}>
                    {isActive ? '● Live' : 'Ended'}
                  </span>
                </div>
                <p className="price-tag text-4xl font-bold mb-1">
                  {formatCurrency(auction.currentBid)}
                </p>
                {auction.highestBidderName && (
                  <p className="text-sm text-slate-400 mb-3">
                    Leading: <span className="text-white font-medium">{auction.highestBidderName}</span>
                  </p>
                )}
              </div>

              {/* Bid Panel */}
              <BidPanel
                auction={auction}
                socket={socket}
                recentBids={recentBids}
                onBidPlaced={(data) => {
                  setAuction(prev => ({
                    ...prev,
                    currentBid: data.currentBid,
                    highestBidderName: data.highestBidder,
                    totalBids: data.totalBids,
                  }));
                  setRecentBids(prev => [data.bid, ...prev].slice(0, 20));
                }}
              />

              {/* Auction rules */}
              <div className="card p-4 text-xs space-y-2 text-slate-500">
                <p className="font-medium text-slate-400 mb-2">Auction Rules</p>
                <p>• Each bid must exceed the current highest bid by at least $1</p>
                <p>• Bids are binding — you're committing to purchase if you win</p>
                <p>• Seller cannot bid on their own items</p>
                <p>• Auction closes automatically at end time</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
