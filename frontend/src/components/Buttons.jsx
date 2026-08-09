'use client'

import { motion, useMotionValue } from 'framer-motion'
import { Leaf, ArrowCounterClockwise } from '@phosphor-icons/react'

const spring = { type: 'spring', stiffness: 100, damping: 20 }

function magneticHandlers(disabled, strength = 0.15) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)

  const onMouseMove = (e) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * strength)
    y.set((e.clientY - rect.top - rect.height / 2) * strength)
  }
  const onMouseLeave = () => { x.set(0); y.set(0) }
  const onMouseDown = () => { if (!disabled) scale.set(0.97) }
  const onMouseUp = () => { scale.set(1) }

  return { x, y, scale, onMouseMove, onMouseLeave, onMouseDown, onMouseUp }
}

export function PrimaryButton({ children, disabled = false, loading = false, className = '', ...props }) {
  const m = magneticHandlers(disabled, 0.15)
  return (
    <motion.button
      className={`btn-primary ${className}`}
      style={{ x: m.x, y: m.y, scale: m.scale }}
      onMouseMove={m.onMouseMove}
      onMouseLeave={m.onMouseLeave}
      onMouseDown={m.onMouseDown}
      onMouseUp={m.onMouseUp}
      disabled={disabled}
      aria-busy={loading}
      transition={spring}
      whileHover={!disabled ? { y: -2, boxShadow: '0 6px 20px rgba(143, 184, 79, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)' } : {}}
      {...props}
    >
      {loading ? (
        <>
          <motion.svg width="18" height="18" viewBox="0 0 24 24" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: 'center', transformBox: 'fill-box' }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round" />
          </motion.svg>
          Reading leaf…
        </>
      ) : (
        <> <Leaf size={18} weight="duotone" /> {children} </>
      )}
    </motion.button>
  )
}

export function GhostButton({ children, disabled = false, className = '', ...props }) {
  const m = magneticHandlers(disabled, 0.1)
  return (
    <motion.button
      className={`btn-ghost ${className}`}
      style={{ x: m.x, y: m.y, scale: m.scale }}
      onMouseMove={m.onMouseMove}
      onMouseLeave={m.onMouseLeave}
      onMouseDown={m.onMouseDown}
      onMouseUp={m.onMouseUp}
      disabled={disabled}
      transition={spring}
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