/**
 * Countdown Component
 * Real-time countdown timer for auction end time with color-coded urgency
 */

import { useState, useEffect } from 'react';
import { formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns';
import PropTypes from 'prop-types';

const Countdown = ({ endTime, onExpire, showFull = false }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime);

      if (isPast(end)) {
        setIsExpired(true);
        setTimeLeft('Auction ended');
        setSecondsLeft(0);
        if (onExpire) onExpire();
        return;
      }

      const seconds = differenceInSeconds(end, new Date());
      setSecondsLeft(seconds);

      if (showFull) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${secs}s`);
        } else {
          setTimeLeft(`${minutes}m ${secs}s`);
        }
      } else {
        setTimeLeft(formatDistanceToNow(end, { addSuffix: false }));
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire, showFull]);

  // Determine color based on time left
  const getColorClass = () => {
    if (isExpired) {
      return 'text-red-600';
    }

    // Less than 1 hour (3600 seconds) - Red/Urgent
    if (secondsLeft < 3600) {
      return 'text-red-600 animate-pulse';
    }

    // Less than 6 hours - Orange/Warning
    if (secondsLeft < 21600) {
      return 'text-orange-600';
    }

    // Less than 12 hours - Yellow/Caution
    if (secondsLeft < 43200) {
      return 'text-yellow-600';
    }

    // More than 12 hours - Green/Safe
    return 'text-green-600';
  };

  return (
    <span className={`font-medium ${getColorClass()}`}>
      {timeLeft}
    </span>
  );
};

Countdown.propTypes = {
  endTime: PropTypes.string.isRequired,
  onExpire: PropTypes.func,
  showFull: PropTypes.bool
};

Countdown.defaultProps = {
  onExpire: null,
  showFull: false
};

export default Countdown;
