export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
}: {
  pullDistance: number;
  isRefreshing: boolean;
}) => {
  return (
    <>
      {/* Pull-to-Refresh Visual Indicator */}
      {pullDistance > 0 && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center bg-brand/10 transition-all z-40"
          style={{ height: `${Math.min(pullDistance, 80)}px` }}
        >
          <div className="text-center">
            <div
              className="inline-flex items-center justify-center rounded-full bg-brand text-white transition-transform"
              style={{
                width: `${Math.min(pullDistance / 2, 40)}px`,
                height: `${Math.min(pullDistance / 2, 40)}px`,
                transform: `rotate(${pullDistance * 3}deg)`,
              }}
            >
              ↓
            </div>
            <p className="text-xs text-brand font-semibold mt-1">Pull to refresh</p>
          </div>
        </div>
      )}

      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className="flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-full shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span className="text-xs font-semibold">Refreshing...</span>
          </div>
        </div>
      )}
    </>
  );
};
