import { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns';
import PropTypes from 'prop-types';

const Countdown = ({ endTime, onExpire = null, showFull = false, className = '' }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  // Keep the latest callback without restarting the interval on every parent render
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    let fired = false;
    const calculateTimeLeft = () => {
      const end = new Date(endTime);

      if (isPast(end)) {
        setIsExpired(true);
        setTimeLeft('Ended');
        setSecondsLeft(0);
        if (!fired && onExpireRef.current) {
          fired = true;
          onExpireRef.current();
        }
        return;
      }

      const seconds = differenceInSeconds(end, new Date());
      setSecondsLeft(seconds);

      if (showFull) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        const pad = (n) => String(n).padStart(2, '0');

        if (days > 0) {
          setTimeLeft(`${days}d ${pad(hours)}h ${pad(minutes)}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${pad(minutes)}m ${pad(secs)}s`);
        } else {
          setTimeLeft(`${minutes}m ${pad(secs)}s`);
        }
      } else {
        setTimeLeft(formatDistanceToNow(end, { addSuffix: false }));
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, showFull]);

  // Urgency scale: ended → under 1h → under 6h → calm
  const getColorClass = () => {
    if (isExpired) return 'text-muted';
    if (secondsLeft < 3600) return 'text-flare';
    if (secondsLeft < 21600) return 'text-[#c46a0a]';
    return 'text-ink';
  };

  return (
    <span className={`tabular font-mono font-medium ${getColorClass()} ${className}`}>
      {timeLeft}
    </span>
  );
};

Countdown.propTypes = {
  endTime: PropTypes.string.isRequired,
  onExpire: PropTypes.func,
  showFull: PropTypes.bool,
  className: PropTypes.string,
};

export default Countdown;
