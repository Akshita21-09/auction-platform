import { formatDistanceToNow, format, differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatTimeAgo = (date) => {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

export const formatDate = (date, fmt = 'MMM dd, yyyy HH:mm') => {
  try {
    return format(new Date(date), fmt);
  } catch {
    return 'Unknown date';
  }
};

export const getTimeRemaining = (endTime) => {
  const now = new Date();
  const end = new Date(endTime);
  const totalSeconds = Math.max(0, Math.floor((end - now) / 1000));

  if (totalSeconds <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isUrgent: false };

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isUrgent = totalSeconds < 3600; // Less than 1 hour

  return { days, hours, minutes, seconds, total: totalSeconds, isUrgent };
};

export const formatCountdown = ({ days, hours, minutes, seconds, total }) => {
  if (total <= 0) return 'Ended';
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const getStatusColor = (status) => {
  const colors = {
    active: 'text-green-400 bg-green-500/10 border-green-500/20',
    ended: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
  };
  return colors[status] || colors.ended;
};

export const CATEGORIES = [
  'All', 'Electronics', 'Fashion', 'Art', 'Collectibles',
  'Vehicles', 'Real Estate', 'Jewelry', 'Sports', 'Books', 'Other'
];

export const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Ending Soon', value: 'endTime' },
  { label: 'Highest Bid', value: '-currentBid' },
  { label: 'Lowest Bid', value: 'currentBid' },
  { label: 'Most Bids', value: '-totalBids' },
];
