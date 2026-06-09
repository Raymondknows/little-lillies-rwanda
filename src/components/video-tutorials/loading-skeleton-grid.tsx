'use client';

export function LoadingSkeletonGrid({ itemCount = 6 }: { itemCount?: number }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
          background: linear-gradient(
            90deg,
            #f1f5f9 25%,
            #e2e8f0 50%,
            #f1f5f9 75%
          );
          background-size: 1000px 100%;
        }
      `}</style>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(itemCount)].map((_, i) => (
          <div key={i} className="animate-shimmer rounded-xl h-64" />
        ))}
      </div>
    </div>
  );
}
