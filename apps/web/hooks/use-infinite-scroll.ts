import { useState, useEffect, useRef } from "react";

export function useInfiniteScroll<T>(items: T[], pageSize: number) {
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Start again from the first page whenever the list or page size changes.
  // Adjusting state during render (rather than in an effect) avoids a wasted
  // render with the stale count.
  const [prevItems, setPrevItems] = useState(items);
  const [prevPageSize, setPrevPageSize] = useState(pageSize);
  if (items !== prevItems || pageSize !== prevPageSize) {
    setPrevItems(items);
    setPrevPageSize(pageSize);
    setVisibleCount(pageSize);
  }

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + pageSize, items.length));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, pageSize]);

  return {
    visibleItems: items.slice(0, visibleCount),
    sentinelRef,
    hasMore: visibleCount < items.length,
  };
}
