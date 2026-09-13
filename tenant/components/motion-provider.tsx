"use client";

import { useEffect, useState } from "react";
import { animate, AnimatePresence, LazyMotion, MotionConfig, domAnimation, m, stagger, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const formalEase = [0.22, 1, 0.36, 1] as const;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const elements = root?.querySelectorAll(
      "main > header, main > section, main > article, main > form, .page-head, .stat-card, .content-card, .data-table",
    );
    if (!elements?.length) return;
    animate(
      elements,
      { opacity: [0, 1], y: [7, 0] },
      { duration: 0.34, delay: stagger(0.035, { startDelay: 0.06 }), ease: formalEase },
    );
  }, [pathname, reduceMotion, root]);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user" transition={{ duration: 0.32, ease: formalEase }}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            ref={setRoot}
            key={pathname}
            className="app-route-motion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: formalEase }}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </MotionConfig>
    </LazyMotion>
  );
}
