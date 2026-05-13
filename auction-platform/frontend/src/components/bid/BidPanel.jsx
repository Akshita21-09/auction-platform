import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatTimeAgo } from '../../utils/helpers';
import { FiZap, FiUsers, FiArrowUp, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';

const BidPanel = ({ auction, socket, recentBids = [], onBidPlaced }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [bids, setBids] = useState(recentBids);
  const [currentBid, setCurrentBid] = useState(auction.currentBid || auction.startingPrice);
  const [highestBidder, setHighestBidder] = useState(auction.highestBidderName);
  const [totalBids, setTotalBids] = useState(auction.totalBids || 0);
  const [viewerCount, setViewerCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [auctionEnded, setAuctionEnded] = useState(auction.status !== 'active');
  const [winner, setWinner] = useState(null);
  const [lastBidHighlighted, setLastBidHighlighted] = useState(false);
  const bidListRef = useRef(null);
  const auctionId = auction._id;

  const minBid = currentBid + 1;
  const isOwner = user && auction.seller?._id === user._id;

  // Quick bid suggestions
  const quickBids = [
    minBid,
    Math.ceil(currentBid * 1.05),
    Math.ceil(currentBid * 1.10),
    Math.ceil(currentBid * 1.25),
  ];

  // Join auction room & set up socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinAuction', auctionId);

    socket.on('highestBidUpdate', (data) => {
      if (data.auctionId !== auctionId) return;

      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      setTotalBids(data.totalBids);

      // Add new bid to feed
      setBids(prev => [data.bid, ...prev].slice(0, 20));

      // Highlight animation
      setLastBidHighlighted(true);
      setTimeout(() => setLastBidHighlighted(false), 800);

      // Show toast if it's someone else's bid
      if (data.bid.bidderId !== user?._id) {
        toast(`${data.highestBidder} bid ${formatCurrency(data.currentBid)}!`, {
          icon: '💰',
          duration: 3000,
        });
      }

      onBidPlaced?.(data);
    });

    socket.on('auctionEnded', (data) => {
      if (data.auctionId !== auctionId) return;
      setAuctionEnded(true);
      setWinner(data.winner);
      toast.success(data.message, { duration: 8000 });
    });

    socket.on('viewerCount', ({ count }) => setViewerCount(count));

    socket.on('bidError', ({ message }) => {
      toast.error(message);
      setLoading(false);
    });

    socket.on('bidSuccess', ({ message }) => {
      toast.success(message, { icon: '🎉' });
      setAmount('');
      setLoading(false);
    });

    socket.on('auctionState', (state) => {
      if (state.auctionId !== auctionId) return;
      setCurrentBid(state.currentBid);
      setHighestBidder(state.highestBidder);
      setTotalBids(state.totalBids);
      setAuctionEnded(state.status !== 'active');
    });

    return () => {
      socket.emit('leaveAuction', auctionId);
      socket.off('highestBidUpdate');
      socket.off('auctionEnded');
      socket.off('viewerCount');
      socket.off('bidError');
      socket.off('bidSuccess');
      socket.off('auctionState');
    };
  }, [socket, auctionId, user]);

  const handleBid = () => {
    if (!user) return toast.error('Please login to place a bid');
    if (!amount || Number(amount) < minBid) {
      return toast.error(`Minimum bid is ${formatCurrency(minBid)}`);
    }
    if (isOwner) return toast.error("You can't bid on your own auction");
    if (auctionEnded) return toast.error('This auction has ended');

    setLoading(true);
    socket.emit('placeBid', { auctionId, amount: Number(amount) });

    // Timeout fallback
    setTimeout(() => setLoading(false), 5000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleBid();
  };

  const handleTyping = () => {
    if (user && socket) {
      socket.emit('userTyping', { auctionId });
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Bid Card */}
      <div className={`card p-5 transition-all duration-300 ${lastBidHighlighted ? 'border-green-500/50 shadow-green-500/10 shadow-xl' : 'border-dark-600'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-slate-400 mb-1">
              {totalBids > 0 ? 'Current Highest Bid' : 'Starting Price'}
            </p>
            <p className={`font-mono font-bold text-3xl transition-all duration-300 ${
              lastBidHighlighted ? 'text-green-400' : 'text-primary-400'
            }`}>
              {formatCurrency(currentBid)}
            </p>
            {highestBidder && (
              <p className="text-sm text-slate-400 mt-1">
                by <span className="text-white font-medium">{highestBidder}</span>
                {highestBidder === user?.name && (
                  <span className="ml-2 badge-active text-xs">You're winning!</span>
                )}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalBids}</p>
            <p className="text-xs text-slate-500">total bids</p>
            <div className="flex items-center gap-1 mt-1 justify-end text-slate-500">
              <FiUsers size={12} />
              <span className="text-xs">{viewerCount} watching</span>
            </div>
          </div>
        </div>

        {/* Auction Ended State */}
        {auctionEnded ? (
          <div className="bg-slate-500/10 border border-slate-500/20 rounded-xl p-4 text-center">
            <FiCheckCircle size={24} className="text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-white">Auction Ended</p>
            {winner && (
              <p className="text-sm text-slate-400 mt-1">
                Winner: <span className="text-white font-medium">{winner}</span>
              </p>
            )}
          </div>
        ) : isOwner ? (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <FiAlertCircle className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">You're the seller. You cannot bid on your own auction.</p>
          </div>
        ) : !user ? (
          <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-300 mb-3">Sign in to place bids</p>
            <a href="/login" className="btn-primary text-sm py-2">Sign In to Bid</a>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Quick bid buttons */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Quick bid amounts:</p>
              <div className="grid grid-cols-4 gap-2">
                {quickBids.map((bid, i) => (
                  <button
                    key={i}
                    onClick={() => setAmount(bid.toString())}
                    className={`py-2 px-1 text-xs rounded-lg border transition-all font-mono ${
                      Number(amount) === bid
                        ? 'border-primary-500 bg-primary-500/20 text-primary-300'
                        : 'border-dark-600 bg-dark-800 text-slate-400 hover:border-primary-500/50 hover:text-primary-400'
                    }`}
                  >
                    {formatCurrency(bid)}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom bid input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); handleTyping(); }}
                  onKeyDown={handleKeyDown}
                  placeholder={`Min. ${formatCurrency(minBid)}`}
                  min={minBid}
                  className="input pl-7 font-mono"
                />
              </div>
              <button
                onClick={handleBid}
                disabled={loading || !amount || Number(amount) < minBid}
                className="btn-accent px-5 shrink-0"
              >
                {loading ? <Loader size="sm" /> : (
                  <><FiZap size={16} /> Bid!</>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-500 text-center">
              Minimum bid: <span className="font-mono text-primary-400">{formatCurrency(minBid)}</span>
            </p>
          </div>
        )}
      </div>

      {/* Live Bid Feed */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="live-dot" /> Live Bid Feed
          </h3>
          <span className="text-xs text-slate-500">{bids.length} recent</span>
        </div>

        <div ref={bidListRef} className="max-h-64 overflow-y-auto no-scrollbar">
          {bids.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-slate-500 text-sm">No bids yet. Be the first!</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-600/50">
              {bids.map((bid, idx) => (
                <div
                  key={bid._id || idx}
                  className={`flex items-center justify-between px-4 py-3 bid-entry ${
                    idx === 0 ? 'bg-green-500/5' : 'hover:bg-dark-600/30'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-700 to-primary-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {bid.bidderName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-none">
                        {bid.bidderName}
                        {bid.bidderId === user?._id && (
                          <span className="ml-1.5 text-xs text-primary-400">(you)</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {bid.createdAt ? formatTimeAgo(bid.createdAt) : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {idx === 0 && <FiArrowUp size={12} className="text-green-400" />}
                    <span className="font-mono font-bold text-sm text-primary-400">
                      {formatCurrency(bid.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidPanel;
