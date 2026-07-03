"use client";

import { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";

interface ParentPageShellProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
}

export default function ParentPageShell({
  children,
  onRefresh,
  className = "space-y-8 px-0 pb-12 pt-6 sm:px-2 md:px-4 lg:px-8",
}: ParentPageShellProps) {
  const { pullDistance, isRefreshing, handleTouchStart, handleTouchMove, handleTouchEnd } = usePullToRefresh({
    onRefresh,
  });

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} />
      {children}
    </div>
  );
}
