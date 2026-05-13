import { useState, useEffect } from 'react';
import { getTimeRemaining } from '../../utils/helpers';
import { FiClock } from 'react-icons/fi';

const CountdownTimer = ({ endTime, onEnd, compact = false, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(endTime));

  useEffect(() => {
    if (timeLeft.total <= 0) {
      onEnd?.();
      return;
    }

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(endTime);
      setTimeLeft(remaining);

      if (remaining.total <= 0) {
        clearInterval(timer);
        onEnd?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (timeLeft.total <= 0) {
    return (
      <span className={`flex items-center gap-1.5 text-slate-400 font-medium ${className}`}>
        <FiClock size={14} />
        Auction Ended
      </span>
    );
  }

  if (compact) {
    const { days, hours, minutes, seconds, isUrgent } = timeLeft;
    const display = days > 0
      ? `${days}d ${hours}h`
      : hours > 0
      ? `${hours}h ${minutes}m`
      : `${minutes}m ${seconds}s`;

    return (
      <span className={`flex items-center gap-1.5 font-mono font-medium text-sm ${
        isUrgent ? 'text-red-400 animate-pulse' : 'text-primary-400'
      } ${className}`}>
        <FiClock size={13} />
        {display}
      </span>
    );
  }

  const { days, hours, minutes, seconds, isUrgent } = timeLeft;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {days > 0 && (
        <TimeBlock value={days} label="days" urgent={isUrgent} />
      )}
      <TimeBlock value={hours} label="hrs" urgent={isUrgent} />
      <TimeBlock value={minutes} label="min" urgent={isUrgent} />
      <TimeBlock value={seconds} label="sec" urgent={isUrgent} />
    </div>
  );
};

const TimeBlock = ({ value, label, urgent }) => (
  <div className={`flex flex-col items-center px-3 py-2 rounded-xl min-w-[60px] border transition-colors ${
    urgent
      ? 'bg-red-500/10 border-red-500/30 text-red-400'
      : 'bg-dark-800 border-dark-600 text-primary-400'
  }`}>
    <span className={`font-mono font-bold text-xl leading-none tabular-nums ${urgent ? 'animate-pulse' : ''}`}>
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-xs text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{label}</span>
  </div>
);

export default CountdownTimer;
