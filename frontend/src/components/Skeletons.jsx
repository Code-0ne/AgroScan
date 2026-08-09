'use client'

import { motion } from 'framer-motion'

const shimmerVariants = {
  hidden: { backgroundPosition: '-200% 0' },
  visible: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const skeletonStyle = {
  background: 'linear-gradient(90deg, var(--bg-elevated) 25%, var(--bg-card) 50%, var(--bg-elevated) 75%)',
  backgroundSize: '200% 100%',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)'
}

export function DiagnosisSkeleton() {
  return (
    <motion.article className="card" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} style={{ pointerEvents: 'none' }}>
      <motion.div className="card-head" variants={{ hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}>
        <motion.div className="skeleton-line" style={{ width: '60%', height: '1.5rem', ...skeletonStyle }} variants={shimmerVariants} />
        <motion.div className="skeleton-line" style={{ width: '80%', height: '2.5rem', ...skeletonStyle }} variants={shimmerVariants} />
        <motion.div className="skeleton-ring" style={{ width: 88, height: 88, borderRadius: '50%', ...skeletonStyle }} variants={shimmerVariants} />
      </motion.div>
      <motion.div className="treatment-grid" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}>
        <motion.div className="skeleton-block" style={{ padding: '22px', ...skeletonStyle }} variants={shimmerVariants} />
        <motion.div className="skeleton-block" style={{ padding: '22px', ...skeletonStyle }} variants={shimmerVariants} />
      </motion.div>
    </motion.article>
  )
}

export function AdvisorySkeleton() {
  return (
    <motion.article className="card advisory" initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } }} style={{ pointerEvents: 'none' }}>
      <motion.header className="card-head" variants={{ hidden: { opacity: 0, y: -8 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } } }}>
        <div>
          <motion.div className="skeleton-line" style={{ width: '40%', height: '1rem', ...skeletonStyle }} variants={shimmerVariants} />
          <motion.div className="skeleton-line" style={{ width: '70%', height: '2rem', ...skeletonStyle }} variants={shimmerVariants} />
        </div>
        <div className="weather-summary" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <motion.div style={{ width: '100px', height: '32px', ...skeletonStyle }} variants={shimmerVariants} />
          <motion.div style={{ width: '120px', height: '32px', ...skeletonStyle }} variants={shimmerVariants} />
        </div>
      </motion.header>
      <motion.div className="advisory-grid" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}>
        {[1, 2, 3].map((i) => (
          <motion.div key={i} className="advisory-item" style={{ padding: '18px', ...skeletonStyle }} variants={shimmerVariants} />
        ))}
      </motion.div>
    </motion.article>
  )
}

export function ScanningSkeleton() {
  return (
    <motion.div 
      className="placeholder scanning-placeholder" 
      role="status" 
      aria-live="polite" 
      aria-busy="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.75rem', 
        fontWeight: 400, 
        color: 'var(--accent)', 
        borderColor: 'var(--accent)', 
        background: 'var(--accent-bg)',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '18px',
        padding: '56px 40px',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--accent)'
      }}
    >
      <motion.div
        className="placeholder-icon"
        animate={{ 
          scale: [1, 1.06, 1],
          opacity: [0.35, 1, 0.35]
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '3rem', opacity: 0.35 }}
      >
        ⏱
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Resizing to 224×224, running convolutional layers…
      </motion.p>
      <motion.div style={{ width: '120px', height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginTop: '8px' }}>
        <motion.div
          style={{ width: 0, height: '100%', background: 'var(--accent)', borderRadius: '2px' }}
          animate={{ width: '100%' }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </motion.div>
  )
}

export function AdvisoryLoadingSkeleton() {
  return (
    <motion.div 
      className="placeholder scanning-placeholder" 
      role="status" 
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        fontFamily: 'var(--font-mono)', 
        fontSize: '0.75rem', 
        fontWeight: 400, 
        color: 'var(--accent)', 
        borderColor: 'var(--accent)', 
        background: 'var(--accent-bg)',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: '18px',
        padding: '56px 40px',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--accent)'
      }}
    >
      <motion.div
        className="placeholder-icon"
        animate={{ 
          scale: [1, 1.06, 1],
          opacity: [0.35, 1, 0.35]
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: '3rem', opacity: 0.35 }}
      >
        ☁
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Fetching local weather forecast…
      </motion.p>
    </motion.div>
  )
}