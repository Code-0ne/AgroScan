'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { Camera, Upload } from '@phosphor-icons/react'

const MAX_FILE_BYTES = 8 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export function Dropzone({ 
  file, 
  previewUrl, 
  status, 
  onFileSelect, 
  onReset,
  scanProgress 
}) {
  const [dragActive, setDragActive] = useState(false)
  const [hoverProgress, setHoverProgress] = useState(0)
  const inputRef = useRef(null)
  const dropzoneRef = useRef(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(0, { stiffness: 100, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 100, damping: 20 })

  const handleMouseMove = useCallback((e) => {
    if (!dropzoneRef.current) return
    const rect = dropzoneRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)
    x.set(deltaX * 8)
    y.set(deltaY * 8)
    rotateY.set(deltaX * 3)
    rotateX.set(-deltaY * 3)
  }, [])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
    rotateX.set(0)
    rotateY.set(0)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
    setHoverProgress(1)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragActive(false)
    setHoverProgress(0)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    setHoverProgress(0)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) onFileSelect(droppedFile)
  }, [onFileSelect])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) onFileSelect(selectedFile)
    e.target.value = ''
  }, [onFileSelect])

  useEffect(() => {
    if (status === 'scanning') {
      setHoverProgress(1)
    } else if (!dragActive) {
      setHoverProgress(0)
    }
  }, [status, dragActive])

  const isScanning = status === 'scanning'
  const hasImage = !!previewUrl

  return (
    <motion.div
      ref={dropzoneRef}
      className={`dropzone ${dragActive ? 'active' : ''} ${hasImage ? 'has-image' : ''} ${isScanning ? 'scanning' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Dropzone for leaf photo. Click or drag a file here to upload."
      aria-describedby="dropzone-hint"
      style={{ x, y, rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      whileHover={!hasImage && !isScanning ? { scale: 1.01 } : {}}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileChange}
        aria-hidden="true"
        disabled={isScanning}
      />

      {hasImage ? (
        <motion.img
          src={previewUrl}
          alt="Selected leaf photo for diagnosis"
          className="preview-img"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      ) : (
        <motion.div
          className="dropzone-copy"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
          style={{ pointerEvents: 'none' }}
        >
          <motion.div
            className="dropzone-icon"
            animate={{ 
              scale: dragActive ? 1.1 : hoverProgress > 0 ? 1.05 : 1,
              rotate: dragActive ? [0, -5, 5, 0] : 0
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 20,
              repeat: dragActive ? Infinity : 0,
              duration: 0.5
            }}
          >
            <Camera size={48} weight="duotone" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--fg)', margin: '0 0 10px' }}
          >
            Drop a photo here, or click to choose one
          </motion.p>
          <motion.p
            id="dropzone-hint"
            className="dropzone-hint"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            JPG, PNG or WEBP · under 8MB · one leaf, filling most of the frame
          </motion.p>
        </motion.div>
      )}

      {isScanning && (
        <motion.div className="scan-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="scan-line"
            animate={{ 
              y: ['-15%', '115%'],
              opacity: [0, 1, 1, 0]
            }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity, 
              ease: [0.16, 1, 0.3, 1] 
            }}
          />
        </motion.div>
      )}
    </motion.div>
  )
}