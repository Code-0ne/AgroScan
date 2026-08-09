'use client'

import { motion } from 'framer-motion'
import { ShieldCheck } from '@phosphor-icons/react'
import { ConfidenceRing } from './ConfidenceRing'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

const bannerVariants = {
  hidden: { opacity: 0, y: -8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  }
}

export function DiagnosisCard({ result }) {
  const { crop, disease, is_healthy, confidence, low_confidence, treatment, alternatives } = result

  return (
    <motion.article
      className={`card ${is_healthy ? 'healthy' : 'sick'}`}
      aria-labelledby="diagnosis-title"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      layout
    >
      {low_confidence && (
        <motion.div
          className="low-confidence-banner"
          role="alert"
          variants={bannerVariants}
        >
          <motion.span style={{ flexShrink: 0, fontSize: '1.125rem', marginTop: 2 }}>
            ⚠
          </motion.span>
          <span>
            Low confidence ({confidence}%) — the model isn't sure. Try a closer, better-lit
            photo of a single leaf before trusting this diagnosis.
          </span>
        </motion.div>
      )}

      <header className="card-head">
        <div>
          <motion.p 
            className="card-crop" 
            variants={itemVariants}
          >{crop}</motion.p>
          <motion.h2 
            id="diagnosis-title" 
            className="card-disease" 
            variants={itemVariants}
          >{disease}</motion.h2>
        </div>
        <motion.div variants={itemVariants} style={{ flexShrink: 0 }}>
          <ConfidenceRing value={confidence} healthy={is_healthy} lowConfidence={low_confidence} />
        </motion.div>
      </header>

      {!is_healthy && (
        <motion.div className="treatment-grid" variants={containerVariants}>
          <motion.div className="treatment organic" variants={itemVariants} layout>
            <motion.p className="treatment-label" variants={itemVariants}>Organic</motion.p>
            <motion.p variants={itemVariants}>{treatment.organic}</motion.p>
          </motion.div>
          <motion.div className="treatment chemical" variants={itemVariants} layout>
            <motion.p className="treatment-label" variants={itemVariants}>Chemical</motion.p>
            <motion.p variants={itemVariants}>{treatment.chemical}</motion.p>
          </motion.div>
        </motion.div>
      )}

      {is_healthy && (
        <motion.p
          className="healthy-note"
          variants={itemVariants}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <motion.span 
            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShieldCheck size={18} weight="duotone" />
          </motion.span>
          No signs of disease detected. {treatment.organic}
        </motion.p>
      )}

      {alternatives?.length > 0 && (
        <motion.div className="alt-list" variants={containerVariants} initial="hidden" animate="show">
          <motion.p className="alt-label" variants={itemVariants}>Other possibilities considered</motion.p>
          <motion.ul variants={containerVariants}>
            {alternatives.map((alt) => (
              <motion.li 
                key={alt.raw_label} 
                variants={itemVariants}
                layout
                whileHover={{ x: 4, transition: { type: 'spring', stiffness: 100, damping: 20 } }}
              >
                <span>{alt.crop} — {alt.disease}</span>
                <motion.span 
                  className="alt-conf"
                  layoutId={`conf-${alt.raw_label}`}
                >
                  {alt.confidence}%
                </motion.span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </motion.article>
  )
}