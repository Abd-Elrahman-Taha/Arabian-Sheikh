import React from 'react';

export function ProductSkeleton() {
  return (
    <div className="bg-[#1C120E] border border-[#C6A15B]/15 flex flex-col justify-between overflow-hidden">
      <div className="aspect-[4/5] skeleton-shimmer w-full" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/3 skeleton-shimmer" />
        <div className="h-5 w-3/4 skeleton-shimmer" />
        <div className="h-3 w-1/2 skeleton-shimmer" />
        <div className="flex justify-between items-center pt-2 border-t border-[#C6A15B]/10">
          <div className="h-4 w-12 skeleton-shimmer" />
          <div className="h-4 w-16 skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className="border-b border-[#C6A15B]/10 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-[#241712] rounded w-full" />
        </td>
      ))}
    </tr>
  );
}
