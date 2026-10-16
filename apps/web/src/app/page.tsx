'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Briefcase, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[var(--color-secondary)] flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-[var(--color-primary)]/30 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--color-accent)]/20 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-white text-[var(--color-primary)] rounded-2xl flex items-center justify-center shadow-2xl mb-8"
        >
          <Briefcase className="w-10 h-10 sm:w-12 sm:h-12" />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 rounded-full px-3 py-1.5 mb-4 border border-white/10"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          Karyerangiz shu yerdan boshlanadi
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight leading-tight"
        >
          Orzuingizdagi ishni bugun toping
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-gray-400 mb-10 text-base sm:text-lg leading-relaxed max-w-sm"
        >
          Koʻnikmalaringizga mos minglab imkoniyatlarni kashf eting. Eʼlon joylang, qidiring va bevosita bogʻlaning — barchasi bir joyda.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full space-y-3"
        >
          <Link href="/login" className="w-full block">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Kirish
            </Button>
          </Link>
          <Link href="/home" className="w-full block">
            <Button
              size="lg"
              className="w-full bg-[var(--color-accent)] hover:bg-orange-600 text-white flex items-center justify-between group shadow-lg shadow-orange-500/25 border-0"
            >
              <span className="font-semibold text-lg">Boshlash</span>
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Button>
          </Link>
          <p className="text-xs text-gray-500">
            Bepul koʻrish · <Link href="/register" className="underline hover:text-gray-300">Roʻyxatdan oʻtish</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
