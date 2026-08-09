'use client'

import { motion } from 'framer-motion'
import { Sun, Moon } from '@phosphor-icons/react'

export function ThemeToggle({ theme, onToggle }) {
  return (
    <motion.button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={theme === 'dark'}
      whileHover={{ scale: 1.05, transition: { type: 'spring', stiffness: 100, damping: 20 } }}
      whileTap={{ scale: 0.95 }}
      layout
    >
      <motion.div
        layoutId="theme-icon"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Sun size={20} weight="duotone" />
        ) : (
          <Moon size={20} weight="duotone" />
        )}
      </motion.div>
    </motion.button>
  )
}