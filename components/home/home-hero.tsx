"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Pause, Play, Volume2, VolumeX } from "lucide-react"

export default function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (video && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      void video.play().catch(() => setPlaying(false))
    }
  }, [])

  const togglePlayback = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) void video.play().catch(() => setPlaying(false))
    else video.pause()
  }

  return (
    <section className="home-hero">
      <div className="container mx-auto px-4">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>Больше чем<br /><span>пиломатериалы</span></h1>
            <p className="hero-description">От фундамента до кровли - все материалы для вашего строительства с доставкой по всему региону.</p>
            <div className="hero-actions">
              <Link href="/catalog" className="primary-link">Перейти в каталог <ArrowUpRight size={20} /></Link>
              <Link href="/contacts" className="text-link">Связаться с нами <span aria-hidden>↗</span></Link>
            </div>
          </div>
          <div className="hero-media">
            <video ref={videoRef} src="/media/vyborplus.mp4" poster="/media/vyborplus-poster.jpg"
              muted={muted} loop playsInline preload="metadata" aria-label="Видео распиловки древесины"
              onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setFailed(true)} />
            <div className="video-caption"><span className="video-tag">ВЫБОР+</span></div>
            {!failed && <div className="video-controls">
              <button type="button" onClick={togglePlayback} aria-label={playing ? "Приостановить видео" : "Воспроизвести видео"}>{playing ? <Pause size={18} /> : <Play size={18} />}</button>
              <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? "Включить звук" : "Выключить звук"}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button>
            </div>}
            {failed && <p className="video-fallback">Видео временно недоступно</p>}
          </div>
        </div>
      </div>
    </section>
  )
}
