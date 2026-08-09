'use client'

import { motion } from 'framer-motion'
import { CloudRain, Drop } from '@phosphor-icons/react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

export function AdvisoryCard({ advisory }) {
  const { crop, forecast_summary, recommendations } = advisory

  return (
    <motion.article
      className="card advisory"
      aria-labelledby="advisory-title"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      layout
    >
      <motion.header className="card-head" variants={headerVariants}>
        <div>
          <motion.p className="card-crop" variants={itemVariants}>{crop}</motion.p>
          <motion.h2 id="advisory-title" className="card-disease" variants={itemVariants}>Weather Advisory</motion.h2>
        </div>
        <motion.div className="weather-summary" variants={itemVariants} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <motion.span
            layout
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 100, damping: 20 } }}
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.7rem', 
              fontWeight: 400, 
              color: 'var(--fg-muted)', 
              background: 'var(--bg)', 
              padding: '8px 14px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}
          >
            <CloudRain size={14} weight="duotone" />
            {forecast_summary.rain_next_3_days_mm}mm rain
          </motion.span>
          <motion.span
            layout
            whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 100, damping: 20 } }}
            style={{ 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.7rem', 
              fontWeight: 400, 
              color: 'var(--fg-muted)', 
              background: 'var(--bg)', 
              padding: '8px 14px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1px solid var(--border)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px'
            }}
          >
            <Drop size={14} weight="duotone" />
            {forecast_summary.avg_humidity_pct}% humidity
          </motion.span>
        </motion.div>
      </motion.header>

      <motion.div className="advisory-grid" variants={containerVariants}>
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            className="advisory-item"
            variants={itemVariants}
            layout
            whileHover={{ x: 4, transition: { type: 'spring', stiffness: 100, damping: 20 } }}
          >
            <motion.p className="advisory-category" variants={itemVariants}>{rec.category}</motion.p>
            <motion.p variants={itemVariants}>{rec.advice}</motion.p>
          </motion.div>
        ))}
      </motion.div>
    </motion.article>
  )
}