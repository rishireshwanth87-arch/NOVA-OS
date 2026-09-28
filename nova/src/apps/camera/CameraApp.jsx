import React, { useState, useRef, useEffect } from 'react'
import { Camera, RefreshCw, Download, Image as ImageIcon, Zap } from 'lucide-react'
import { useNotificationStore } from '../../stores/notificationStore'

export function CameraApp() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [filter, setFilter] = useState('none') // 'none' | 'cyberpunk' | 'mono' | 'sepia' | 'invert'
  const [capturedImages, setCapturedImages] = useState([])
  const [cameraError, setCameraError] = useState(null)
  const [countdown, setCountdown] = useState(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  useEffect(() => {
    let activeStream = null
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })
        activeStream = s
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
        setCameraError(null)
      } catch (err) {
        setCameraError('Camera access unavailable or permission denied. Test pattern mode active.')
      }
    }

    startCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const takePhoto = () => {
    if (countdown !== null) return
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count -= 1
      if (count <= 0) {
        clearInterval(interval)
        setCountdown(null)
        captureFrame()
      } else {
        setCountdown(count)
      }
    }, 1000)
  }

  const captureFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!canvas) return

    const width = video?.videoWidth || 640
    const height = video?.videoHeight || 480
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    if (filter === 'cyberpunk') {
      ctx.filter = 'contrast(1.4) saturate(1.8) hue-rotate(180deg)'
    } else if (filter === 'mono') {
      ctx.filter = 'grayscale(1) contrast(1.2)'
    } else if (filter === 'sepia') {
      ctx.filter = 'sepia(0.8) contrast(1.1)'
    } else if (filter === 'invert') {
      ctx.filter = 'invert(1)'
    } else {
      ctx.filter = 'none'
    }

    if (video && stream) {
      ctx.drawImage(video, 0, 0, width, height)
    } else {
      // Draw test pattern
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#00F0FF'
      ctx.font = '24px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('NOVA WEBCAM SIMULATION', width / 2, height / 2 - 20)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '16px monospace'
      ctx.fillText(new Date().toLocaleString(), width / 2, height / 2 + 20)
    }

    const dataUrl = canvas.toDataURL('image/png')
    setCapturedImages((prev) => [dataUrl, ...prev])
    addNotification({
      title: 'Camera',
      message: 'Photo captured and saved to session!',
      type: 'success',
    })
  }

  const getFilterStyle = () => {
    switch (filter) {
      case 'cyberpunk':
        return 'contrast(1.4) saturate(1.8) hue-rotate(180deg)'
      case 'mono':
        return 'grayscale(1) contrast(1.2)'
      case 'sepia':
        return 'sepia(0.8) contrast(1.1)'
      case 'invert':
        return 'invert(1)'
      default:
        return 'none'
    }
  }

  return (
    <div className="h-full w-full bg-[#0a0b12] text-slate-200 flex flex-col select-none overflow-hidden font-sans">
      {/* Viewfinder */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ filter: getFilterStyle() }}
            className="w-full h-full object-cover transition-all"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-[#0a0b14] p-6 text-center space-y-3">
            <Camera size={48} className="text-[#00F0FF] opacity-70 animate-pulse" />
            <p className="text-xs text-slate-400 max-w-xs">{cameraError || 'Initializing Camera...'}</p>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-30">
            <span className="text-7xl font-bold text-[#00F0FF] animate-ping">{countdown}</span>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="h-20 bg-[#12131C] border-t border-white/10 px-4 flex items-center justify-between gap-4">
        {/* Filter selection */}
        <div className="flex items-center gap-1.5 text-xs">
          {['none', 'cyberpunk', 'mono', 'sepia', 'invert'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-md capitalize transition-colors text-[11px] ${
                filter === f
                  ? 'bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/50 font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Shutter Button */}
        <button
          onClick={takePhoto}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          title="Take Photo"
        >
          <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-white flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition-colors" />
          </div>
        </button>

        {/* Gallery count / thumbnail preview */}
        <div className="flex items-center gap-2">
          {capturedImages.length > 0 ? (
            <a
              href={capturedImages[0]}
              download="nova-photo.png"
              className="w-10 h-10 rounded-lg overflow-hidden border border-white/20 relative group block"
              title="Download latest photo"
            >
              <img src={capturedImages[0]} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Download size={12} className="text-white" />
              </div>
            </a>
          ) : (
            <div className="w-10 h-10 rounded-lg border border-dashed border-white/10 flex items-center justify-center text-slate-600">
              <ImageIcon size={16} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
