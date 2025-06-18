import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface FlashcardGalleryProps {
  flashcards: { front: string; back: string }[];
  onClose: () => void;
}

const COLORS = [
  'bg-siksha-yellow',
  'bg-siksha-purple-light',
  'bg-siksha-green',
  'bg-siksha-orange',
  'bg-siksha-blue',
  'bg-siksha-pink',
];

const getColor = (idx: number) => COLORS[idx % COLORS.length];

const cardFaceStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  fontSize: '1.125rem',
  fontWeight: 500,
  textAlign: 'center',
  borderRadius: '0.75rem',
  backfaceVisibility: 'hidden',
};

const FlashcardGallery: React.FC<FlashcardGalleryProps> = ({ flashcards, onClose }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset animation state after each transition
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 400);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const handleSwipe = (dir: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setFlipped(false);
    setDirection(dir === 1 ? 'left' : 'right');
    setCurrent((prev) => {
      if (dir === 1) return prev < flashcards.length - 1 ? prev + 1 : 0;
      if (dir === -1) return prev > 0 ? prev - 1 : flashcards.length - 1;
      return prev;
    });
  };

  const handleSideCardClick = (idx: number) => {
    if (isAnimating || idx === current) return;
    setIsAnimating(true);
    setDirection(idx > current ? 'left' : 'right');
    setFlipped(false);
    setCurrent(idx);
  };

  if (!flashcards.length) return null;

  const leftIdx = current > 0 ? current - 1 : flashcards.length - 1;
  const rightIdx = current < flashcards.length - 1 ? current + 1 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
        <Button size="icon" variant="ghost" className="absolute top-2 right-2 z-10" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
        <div className="flex items-center justify-center w-full h-[340px] relative select-none overflow-x-visible">
          {/* Left teaser */}
          <motion.div
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-[220px] rounded-xl shadow-md scale-90 opacity-70 ${getColor(leftIdx)} flex items-center justify-center text-center text-base font-medium cursor-pointer`}
            style={{ zIndex: 1 }}
            initial={false}
            animate={{ x: -40, opacity: 0.7 }}
            onClick={() => handleSideCardClick(leftIdx)}
            layout
          >
            <span className="truncate px-2">{flashcards[leftIdx].front}</span>
          </motion.div>

          {/* Center card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current}-${flipped}`}
              className={`w-2/4 h-[260px] z-10 cursor-pointer ${getColor(current)} rounded-xl shadow-lg`}
              style={{ 
                perspective: 1000, 
                position: 'relative', 
                transformStyle: 'preserve-3d',
                transformOrigin: '50% 50%'
              }}
              initial={{ 
                x: direction === 'left' ? 200 : direction === 'right' ? -200 : 0,
                opacity: direction ? 0 : 1,
                rotateY: 0 
              }}
              animate={{ 
                x: 0,
                opacity: 1,
                rotateY: flipped ? 180 : 0
              }}
              exit={{ 
                x: direction === 'left' ? -200 : direction === 'right' ? 200 : 0,
                opacity: 0,
                rotateY: flipped ? 180 : 0
              }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4
              }}
              drag={!isAnimating ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_e, info) => {
                if (info.offset.x < -80) handleSwipe(1);
                else if (info.offset.x > 80) handleSwipe(-1);
                else setFlipped(f => !f);
              }}
              onClick={() => !isAnimating && setFlipped(f => !f)}
            >
              {/* Front face */}
              <div
                style={{
                  ...cardFaceStyle,
                  transform: 'rotateY(0deg)',
                  opacity: flipped ? 0 : 1,
                  transition: 'opacity 0.15s ease-in-out'
                }}
              >
                {flashcards[current].front}
              </div>
              {/* Back face */}
              <div
                style={{
                  ...cardFaceStyle,
                  transform: 'rotateY(180deg)',
                  opacity: flipped ? 1 : 0,
                  transition: 'opacity 0.15s ease-in-out'
                }}
              >
                {flashcards[current].back}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right teaser */}
          <motion.div
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-[220px] rounded-xl shadow-md scale-90 opacity-70 ${getColor(rightIdx)} flex items-center justify-center text-center text-base font-medium cursor-pointer`}
            style={{ zIndex: 1 }}
            initial={false}
            animate={{ x: 40, opacity: 0.7 }}
            onClick={() => handleSideCardClick(rightIdx)}
            layout
          >
            <span className="truncate px-2">{flashcards[rightIdx].front}</span>
          </motion.div>
        </div>
        <span className="text-sm text-white mt-2">{current + 1} / {flashcards.length}</span>
      </div>
    </div>
  );
};

export default FlashcardGallery; 