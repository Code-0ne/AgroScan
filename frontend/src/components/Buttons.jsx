'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Leaf, ArrowCounterClockwise } from '@phosphor-icons/react'

export function PrimaryButton({ 
  children, 
  disabled = false, 
  loading = false, 
  className = '', 
  ...props 
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const handleMouseMove = (e) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.15)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.15)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleMouseDown = () => {
    if (!disabled) scale.set(0.97)
  }

  const handleMouseUp = () => {
    scale.set(1)
  }

  return (
    <motion.button
      className={`btn-primary ${className}`}
      style={{ x, y, scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
      aria-busy={loading}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      whileHover={!disabled ? { y: -2, boxShadow: '0 6px 20px rgba(143, 184, 79, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)' } : {}}
      {...props}
    >
      {loading ? (
        <>
          <motion.svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeDasharray="31.4 31.4"
              strokeLinecap="round"
            />
          </motion.svg>
          Reading leaf…
        </>
      ) : (
        <>
          <Leaf size={18} weight="duotone" />
          {children}
        </>
      )}
    </motion.button>
  )
}

export function GhostButton({ 
  children, 
  disabled = false, 
  className = '', 
  ...props 
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const handleMouseMove = (e) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.1)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.1)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const handleMouseDown = () => {
    if (!disabled) scale.set(0.98)
  }

  const handleMouseUp = () => {
    scale.set(1)
  }

  return (
    <motion.button
      className={`btn-ghost ${className}`}
      style={{ x, y, scale }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      whileHover={!disabled ? { backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-light)' } : {}}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export function ResetButton({ onClick, disabled = false }) {
  return (
    <GhostButton onClick={onClick} disabled={disabled}>
      <ArrowCounterClockwise size={18} weight="duotone" />
      Start over
    </GhostButton>
  )
}