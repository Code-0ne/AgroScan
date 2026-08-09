'use client'

import { motion, useSpring, useTransform } from 'framer-motion'

export function ConfidenceRing({ value, healthy, lowConfidence }) {
  const r = 38
  const c = 2 * Math.PI * r
  
  const ringClass = lowConfidence ? 'uncertain' : healthy ? 'ok' : 'warn'
  
  const progress = useSpring(value / 100, { 
    stiffness: 100, 
    damping: 20,
    mass: 0.8
  })
  
  const offset = useTransform(progress, p => c - p * c)
  
  const pulseScale = useSpring(lowConfidence ? 1 : 0, { 
    stiffness: 100, 
    damping: 20,
    repeat: lowConfidence ? Infinity : 0,
    repeatType: 'mirror',
    duration: 1.5
  })
  
  const pulseOpacity = useTransform(pulseScale, s => [1, 0.6, 1].find((_, i) => i === Math.floor(s * 2)) ?? 1)

  return (
    <div className="ring" aria-label={`Confidence: ${value}%`}>
      <motion.svg 
        width="96" 
        height="96" 
        viewBox="0 0 96 96" 
        role="img" 
        aria-label={`Confidence ring at ${value} percent`}
        style={{ filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3))' }}
      >
        <circle cx="48" cy="48" r={r} className="ring-track" />
        <motion.circle
          cx="48"
          cy="48"
          r={r}
          className={`ring-value ${ringClass}`}
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          style={{ 
            transformOrigin: '48px 48px',
            transformBox: 'fill-box',
            scale: pulseScale
          }}
        />
      </motion.svg>
      <motion.span 
        className="ring-number"
        animate={{ scale: pulseScale }}
        style={{ transformOrigin: 'center' }}
      >
        {value}%
      </motion.span>
    </div>
  )
}