"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({ children }) {
  // usePathname helps create a unique key on route change.
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: .25 }}
        style={{ position: "relative", zIndex: 10 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}