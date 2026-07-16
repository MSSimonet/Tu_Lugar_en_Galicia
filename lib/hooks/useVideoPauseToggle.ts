'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'

interface UseVideoPauseToggle {
  videoRef: RefObject<HTMLVideoElement | null>
  isPlaying: boolean
  toggle: () => void
}

/**
 * WCAG 2.2.2: video autoplay/loop necesita un mecanismo de pausa visible.
 * Arranca pausado si el usuario tiene activado prefers-reduced-motion.
 */
export function useVideoPauseToggle(): UseVideoPauseToggle {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(
    () => typeof window === 'undefined' || !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Sincroniza el <video> con el estado inicial (external system, no setState acá)
  useEffect(() => {
    if (!isPlaying) videoRef.current?.pause()
  }, [isPlaying])

  function toggle() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return { videoRef, isPlaying, toggle }
}
