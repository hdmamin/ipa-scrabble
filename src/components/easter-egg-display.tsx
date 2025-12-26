'use client';

import React, { useEffect, useState } from 'react';
import { EasterEggTrigger } from '@/lib/scoring';
import { motion, AnimatePresence } from 'framer-motion';

interface EasterEggDisplayProps {
  easterEgg: EasterEggTrigger;
  onComplete: () => void;
}

const Wug: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <motion.div
    style={{
      ...style,
      fontSize: '24px',
      position: 'absolute',
      userSelect: 'none',
      pointerEvents: 'none'
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    🐛
  </motion.div>
);

const EasterEggDisplay: React.FC<EasterEggDisplayProps> = ({ easterEgg, onComplete }) => {
  const [wugs, setWugs] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (easterEgg.type === 'wug-rain') {
      // Generate wugs falling from the sky
      const newWugs = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * -50,
        delay: i * 0.1
      }));
      setWugs(newWugs);

      // Clear after animation
      const timer = setTimeout(onComplete, 5000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [easterEgg, onComplete]);

  if (easterEgg.type === 'wug-rain') {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {wugs.map((wug) => (
            <motion.div
              key={wug.id}
              initial={{ y: wug.y, x: wug.x, opacity: 0 }}
              animate={{
                y: '110vh',
                opacity: [0, 1, 1, 0],
                rotate: [0, 360]
              }}
              transition={{
                duration: 4,
                delay: wug.delay,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                left: `${wug.x}%`,
                fontSize: '40px'
              }}
            >
              🐛
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg shadow-2xl">
            <h2 className="text-3xl font-bold mb-2">🐛 THE WUG TEST! 🐛</h2>
            <p className="text-lg">Jean Berko Gleason would be so proud!</p>
            <p className="text-sm mt-2 opacity-80">
              Words: {easterEgg.englishWords.join(', ')}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (easterEgg.type === 'chomsky-reaction') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 pointer-events-none"
        onClick={onComplete}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-8 py-6 rounded-lg shadow-2xl max-w-md"
        >
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-3">CHOMSKY APPROVES!</h2>
          <blockquote className="italic text-lg border-l-4 border-white/30 pl-4 mb-3">
            "Colorless green ideas sleep furiously."
          </blockquote>
          <p className="text-sm opacity-90">
            Your words demonstrate linguistic creativity that would make Noam proud!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (easterEgg.type === 'cognitive-fireworks') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              scale: [0, 2, 3],
              opacity: [1, 0.5, 0]
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: 'easeOut'
            }}
            style={{
              position: 'absolute',
              left: `${30 + Math.random() * 40}%`,
              top: `${30 + Math.random() * 40}%`,
              background: `hsl(${i * 36}, 70%, 60%)`
            }}
            className="w-32 h-32 rounded-full"
          />
        ))}

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-lg shadow-2xl z-10"
        >
          <h2 className="text-2xl font-bold mb-2">🎭 Cognitive Development!</h2>
          <p>
            Jean Piaget would celebrate this milestone in linguistic understanding!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (easterEgg.type === 'structural-sparkles') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: 0 }}
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              delay: i * 0.05,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`
            }}
          >
            <span style={{ fontSize: `${20 + Math.random() * 20}px` }}>✨</span>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-lg shadow-2xl z-10"
        >
          <h2 className="text-2xl font-bold mb-2">✨ Structural Brilliance! ✨</h2>
          <p>
            Louis Hjelmslev would recognize this as a masterful application of glossematics!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (easterEgg.type === 'signifier-glow') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(59, 130, 246, 0.5)',
              '0 0 40px rgba(59, 130, 246, 0.8)',
              '0 0 20px rgba(59, 130, 246, 0.5)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg shadow-2xl z-10"
        >
          <h2 className="text-2xl font-bold mb-2">💎 Sign & Signifier!</h2>
          <p>
            Ferdinand de Saussure would marvel at this perfect union of signifier and signified!
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default EasterEggDisplay;
