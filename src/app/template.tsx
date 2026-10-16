'use client';

import { motion } from 'framer-motion';

const variants = {
  hidden: { opacity: 0, y: 10 },
  enter: { opacity: 1, y: 0 },
};

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.main
      variants={variants}
      initial="hidden"
      animate="enter"
      transition={{ type: 'tween', ease: 'easeOut', duration: 0.3 }}
      className="flex-1 w-full"
    >
      {children}
    </motion.main>
  );
}
