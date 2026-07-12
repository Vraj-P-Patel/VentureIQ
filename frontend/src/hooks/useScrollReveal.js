// ============================================
// useScrollReveal — shared scroll animation hook
// Attaches an IntersectionObserver to a ref.
// When element enters viewport, adds .revealed class.
// Usage:
//   const ref = useScrollReveal();
//   <div ref={ref} className="reveal-on-scroll"> ... </div>
// ============================================
import { useEffect, useRef } from "react";

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.unobserve(el); // fire once
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
