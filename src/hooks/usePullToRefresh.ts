import { useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number;
  maxPull?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 60,
  maxPull = 120,
}: UsePullToRefreshOptions) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing) return;
    
    // Only trigger if at the top of the page
    if (window.scrollY !== 0) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0 && diff < maxPull) {
      setPullDistance(diff);
    }
  }, [isRefreshing, startY, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
  }, [pullDistance, threshold, onRefresh]);

  return {
    pullDistance,
    isRefreshing,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
