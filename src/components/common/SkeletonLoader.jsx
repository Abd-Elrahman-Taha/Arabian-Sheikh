import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 flex flex-col justify-between overflow-hidden shadow-sm">
      <div className="aspect-[4/5] skeleton-shimmer w-full" />
      <div className="p-4 sm:p-5 space-y-3 bg-[var(--color-desert-light)]/40">
        <div className="h-3 w-1/3 skeleton-shimmer" />
        <div className="h-5 w-3/4 skeleton-shimmer" />
        <div className="h-3 w-1/2 skeleton-shimmer" />
        <div className="flex justify-between items-center pt-3 border-t border-[var(--color-terracotta-deep)]/15">
          <div className="h-4 w-12 skeleton-shimmer" />
          <div className="h-4 w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="pt-28 pb-20 max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 space-y-12">
      <div className="h-4 w-48 skeleton-shimmer" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/5] skeleton-shimmer w-full border border-[var(--color-terracotta-deep)]/25" />
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-20 h-24 skeleton-shimmer border border-[var(--color-terracotta-deep)]/20" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-6 space-y-6">
          <div className="h-4 w-32 skeleton-shimmer" />
          <div className="h-10 w-3/4 skeleton-shimmer" />
          <div className="h-6 w-1/2 skeleton-shimmer" />
          <div className="h-8 w-28 skeleton-shimmer" />
          <div className="space-y-2 pt-4 border-t border-[var(--color-terracotta-deep)]/15">
            <div className="h-4 w-full skeleton-shimmer" />
            <div className="h-4 w-5/6 skeleton-shimmer" />
            <div className="h-4 w-4/6 skeleton-shimmer" />
          </div>
          <div className="h-12 w-full skeleton-shimmer pt-4" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-[var(--color-terracotta-deep)]/15">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 skeleton-shimmer rounded w-full" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="p-6 bg-[var(--color-desert-primary)]/30 border border-[var(--color-terracotta-deep)]/20 space-y-3">
      <div className="h-3 w-1/2 skeleton-shimmer" />
      <div className="h-8 w-3/4 skeleton-shimmer" />
      <div className="h-3 w-1/3 skeleton-shimmer" />
    </div>
  );
}
