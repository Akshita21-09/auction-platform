import { Link } from 'react-router-dom';
import { formatCurrency, truncate } from '../../utils/helpers';
import CountdownTimer from './CountdownTimer';
import { FiUsers, FiArrowRight, FiZap } from 'react-icons/fi';

const AuctionCard = ({ auction, className = '' }) => {
  const { _id, title, image, category, currentBid, startingPrice, totalBids, endTime, status, seller, highestBidderName } = auction;

  const isActive = status === 'active' && new Date() < new Date(endTime);

  return (
    <Link to={`/auctions/${_id}`} className={`card-hover group block ${className}`}>
      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={image || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop'}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop';
          }}
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isActive ? (
            <span className="badge-active">
              <FiZap size={10} /> LIVE
            </span>
          ) : (
            <span className="badge-ended">Ended</span>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3">
          <span className="badge-category">{category}</span>
        </div>

        {/* Timer overlay */}
        {isActive && (
          <div className="absolute bottom-3 left-3 right-3">
            <CountdownTimer endTime={endTime} compact />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-white text-base leading-snug group-hover:text-primary-300 transition-colors line-clamp-2 mb-2">
          {title}
        </h3>

        {seller && (
          <p className="text-xs text-slate-500 mb-3">
            by <span className="text-slate-400">{seller.name}</span>
          </p>
        )}

        {/* Bid info */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">
              {totalBids > 0 ? 'Current Bid' : 'Starting Price'}
            </p>
            <p className="price-tag text-lg font-bold">
              {formatCurrency(totalBids > 0 ? currentBid : startingPrice)}
            </p>
            {highestBidderName && (
              <p className="text-xs text-slate-500 mt-0.5">
                by {highestBidderName}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <FiUsers size={13} />
            <span className="text-xs">{totalBids} {totalBids === 1 ? 'bid' : 'bids'}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isActive ? 'Click to bid live' : `Won by ${auction.winner?.name || 'No bidder'}`}
          </span>
          <span className="text-primary-400 group-hover:translate-x-1 transition-transform">
            <FiArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
