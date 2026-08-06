import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react'
import './App.css'
import splashImage from '/IMG_2880.png'

type Transform = {
  x: number
  y: number
  scale: number
  rotation: number
}
type Point = {
  x: number
  y: number
}

const defaultTransform: Transform = {
  x: 0,
  y: 0,
  scale: 1,
  rotation: 0,
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const distance = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y)
const angle = (a: Point, b: Point) =>
  (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
const centerPoint = (a: Point, b: Point) => ({
  x: (a.x + b.x) / 2,
  y: (a.y + b.y) / 2,
})

const toOverlayTransform = (transform: Transform) =>
  `translate(-50%, -50%) translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${transform.rotation}deg) scale(${transform.scale})`

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h3l1.2-2.3A2 2 0 0 1 10 4h4a2 2 0 0 1 1.8 1.1L17 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm8 2.5A4.5 4.5 0 1 0 16.5 14 4.5 4.5 0 0 0 12 9.5Zm0 2A2.5 2.5 0 1 1 9.5 14 2.5 2.5 0 0 1 12 11.5Z" />
  </svg>
)

const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm2 3v8h10V7Zm2 2h6v2H9Zm0 4h4v2H9Z" />
  </svg>
)

const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 10V8a5 5 0 1 1 10 0v2h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm2 0h6V8a3 3 0 0 0-6 0Zm-1 2v7h8v-7Z" />
  </svg>
)

const UnlockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 10V8a5 5 0 0 1 8.7-3.7l-1.4 1.4A3 3 0 0 0 9 8v2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Zm2 2v7h8v-7Z" />
  </svg>
)

const OpacityIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 4c4.4 4.4 7 7.1 7 10a7 7 0 1 1-14 0c0-2.9 2.6-5.6 7-10Zm0 3.3c-2.3 2.3-4 4.2-4 6.7a4 4 0 0 0 8 0c0-2.5-1.7-4.4-4-6.7Z" />
  </svg>
)

const MoreIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 12a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm7 0a2 2 0 1 1-2-2 2 2 0 0 1 2 2Zm7 0a2 2 0 1 1-2-2 2 2 0 0 1 2 2Z" />
  </svg>
)

const FocusIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3a1 1 0 0 1 1 1v2.2a6.8 6.8 0 0 1 6.8 6.8H22a1 1 0 0 1 1 1 1 1 0 0 1-1 1h-2.2A6.8 6.8 0 0 1 13 20.8V23a1 1 0 0 1-1 1 1 1 0 0 1-1-1v-2.2A6.8 6.8 0 0 1 4.2 13H2a1 1 0 0 1-1-1 1 1 0 0 1 1-1h2.2A6.8 6.8 0 0 1 11 4.2V2a1 1 0 0 1 1-1Zm0 4.8A4.2 4.2 0 0 0 7.8 12 4.2 4.2 0 0 0 12 16.2 4.2 4.2 0 0 0 16.2 12 4.2 4.2 0 0 0 12 7.8Z" />
  </svg>
)

const MirrorIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 4 4 8l4 4M16 4l4 4-4 4M12 4v16M4 12h16" />
  </svg>
)

const RotateIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M21 12a9 9 0 1 1-2.6-6.2L21 3v6h-6" />
  </svg>
)

const SplashLogo = () => (
  <img src={splashImage} alt="" className="splash-logo__image" aria-hidden="true" />
)

function App() {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(0.65)
  const [isLocked, setIsLocked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showOpacityControl, setShowOpacityControl] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [precisionMode, setPrecisionMode] = useState(false)
  const [autoSaveSession, setAutoSaveSession] = useState(false)
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [focusCloseButtonState, setFocusCloseButtonState] = useState<'hidden' | 'visible' | 'hiding'>('hidden')
  const [isMirrored, setIsMirrored] = useState(false)
  const [splashStage, setSplashStage] = useState<'entering' | 'visible' | 'exiting' | 'hidden'>('entering')
  const [moreMenuState, setMoreMenuState] = useState<'closed' | 'opening' | 'open' | 'closing'>('closed')
  const [moreMenuDragOffset, setMoreMenuDragOffset] = useState(0)
  const [lockIconAnimating, setLockIconAnimating] = useState(false)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const cameraInputRef = useRef<HTMLInputElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previousImageUrl = useRef<string | null>(null)
  const pointerMap = useRef<Map<number, Point>>(new Map())
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const focusCloseButtonTimeoutRef = useRef<number | null>(null)
  const preFocusUiStateRef = useRef({ showOpacityControl: false, showMoreMenu: false })
  const moreMenuAnimationTimeoutRef = useRef<number | null>(null)
  const moreMenuPointerIdRef = useRef<number | null>(null)
  const moreMenuStartYRef = useRef(0)
  const transformRef = useRef<Transform>(defaultTransform)
  const pendingTransformRef = useRef<Transform>(defaultTransform)
  const rafRef = useRef<number | null>(null)
  const gestureActiveRef = useRef(false)
  const gesture = useRef({
    mode: 'none' as 'none' | 'pan' | 'pinch',
    startX: 0,
    startY: 0,
    startCenterX: 0,
    startCenterY: 0,
    startDistance: 0,
    startAngle: 0,
    baseX: 0,
    baseY: 0,
    baseScale: 1,
    baseRotation: 0,
  })
  useEffect(() => {
    let active = true

    async function initCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        return
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })

        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        // Keep the camera flow unchanged while avoiding UI-only status messaging.
      }
    }

    initCamera()

    return () => {
      active = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      if (focusCloseButtonTimeoutRef.current !== null) {
        window.clearTimeout(focusCloseButtonTimeoutRef.current)
        focusCloseButtonTimeoutRef.current = null
      }
      if (previousImageUrl.current) {
        URL.revokeObjectURL(previousImageUrl.current)
        previousImageUrl.current = null
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (focusCloseButtonTimeoutRef.current !== null) {
        window.clearTimeout(focusCloseButtonTimeoutRef.current)
        focusCloseButtonTimeoutRef.current = null
      }
      if (moreMenuAnimationTimeoutRef.current !== null) {
        window.clearTimeout(moreMenuAnimationTimeoutRef.current)
        moreMenuAnimationTimeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!lockIconAnimating) {
      return
    }

    const timer = window.setTimeout(() => setLockIconAnimating(false), 120)
    return () => window.clearTimeout(timer)
  }, [lockIconAnimating])

  useEffect(() => {
    const enterTimer = window.setTimeout(() => setSplashStage('visible'), 300)
    const exitTimer = window.setTimeout(() => setSplashStage('exiting'), 1800)
    const hideTimer = window.setTimeout(() => setSplashStage('hidden'), 2300)

    return () => {
      window.clearTimeout(enterTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const cameraIsVisible = splashStage === 'exiting' || splashStage === 'hidden'
  const toolbarIsVisible = splashStage === 'exiting' || splashStage === 'hidden'

  const triggerHapticFeedback = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(1)
    }
  }

  const openMoreMenu = () => {
    if (moreMenuState === 'open' || moreMenuState === 'opening') {
      return
    }

    triggerHapticFeedback()
    setShowOpacityControl(false)
    setShowMoreMenu(true)
    setMoreMenuDragOffset(0)
    setMoreMenuState('opening')

    if (moreMenuAnimationTimeoutRef.current !== null) {
      window.clearTimeout(moreMenuAnimationTimeoutRef.current)
    }

    moreMenuAnimationTimeoutRef.current = window.setTimeout(() => {
      setMoreMenuState('open')
      moreMenuAnimationTimeoutRef.current = null
    }, 20)
  }

  const closeMoreMenu = () => {
    if (moreMenuState === 'closed' || moreMenuState === 'closing') {
      return
    }

    triggerHapticFeedback()
    setMoreMenuDragOffset(0)
    setMoreMenuState('closing')

    if (moreMenuAnimationTimeoutRef.current !== null) {
      window.clearTimeout(moreMenuAnimationTimeoutRef.current)
    }

    moreMenuAnimationTimeoutRef.current = window.setTimeout(() => {
      setMoreMenuState('closed')
      setShowMoreMenu(false)
      moreMenuAnimationTimeoutRef.current = null
    }, 180)
  }

  const handleMoreMenuToggle = () => {
    if (moreMenuState === 'open' || moreMenuState === 'opening') {
      closeMoreMenu()
    } else {
      openMoreMenu()
    }
  }

  const handleMoreMenuPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (moreMenuState !== 'open' && moreMenuState !== 'opening') {
      return
    }

    moreMenuPointerIdRef.current = event.pointerId
    moreMenuStartYRef.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleMoreMenuPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (moreMenuPointerIdRef.current !== event.pointerId) {
      return
    }

    const deltaY = event.clientY - moreMenuStartYRef.current
    if (deltaY > 0) {
      setMoreMenuDragOffset(deltaY)
    }
  }

  const handleMoreMenuPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (moreMenuPointerIdRef.current !== event.pointerId) {
      return
    }

    moreMenuPointerIdRef.current = null
    if (moreMenuDragOffset > 120) {
      closeMoreMenu()
    } else {
      setMoreMenuDragOffset(0)
    }
  }

  const applyTransformToOverlay = (nextTransform: Transform) => {
    transformRef.current = nextTransform
    if (overlayRef.current) {
      overlayRef.current.style.transform = toOverlayTransform(nextTransform)
    }
  }

  const scheduleTransformUpdate = (nextTransform: Transform) => {
    pendingTransformRef.current = nextTransform

    if (rafRef.current !== null) {
      return
    }

    rafRef.current = window.requestAnimationFrame(() => {
      applyTransformToOverlay(pendingTransformRef.current)
      rafRef.current = null
    })
  }

  const resetTransform = () => {
    triggerHapticFeedback()
    setIsMirrored(false)
    const nextTransform = defaultTransform
    applyTransformToOverlay(nextTransform)
    pendingTransformRef.current = nextTransform
  }

  const handleFlipImage = () => {
    triggerHapticFeedback()
    setIsMirrored((current) => !current)
  }

  const handleRotate90 = () => {
    triggerHapticFeedback()
    const normalizedRotation = ((transformRef.current.rotation % 360) + 360) % 360
    const nextTransform = {
      ...transformRef.current,
      rotation: (normalizedRotation + 90) % 360,
    }
    applyTransformToOverlay(nextTransform)
    pendingTransformRef.current = nextTransform
  }

  const enterFocusMode = () => {
    triggerHapticFeedback()
    preFocusUiStateRef.current = {
      showOpacityControl,
      showMoreMenu,
    }
    setShowOpacityControl(false)
    setShowMoreMenu(false)
    setMoreMenuState('closed')
    setMoreMenuDragOffset(0)
    setIsFocusMode(true)
    setFocusCloseButtonState('visible')
  }

  const exitFocusMode = () => {
    triggerHapticFeedback()
    if (focusCloseButtonTimeoutRef.current !== null) {
      window.clearTimeout(focusCloseButtonTimeoutRef.current)
    }

    setIsFocusMode(false)
    setFocusCloseButtonState('hiding')
    setShowOpacityControl(preFocusUiStateRef.current.showOpacityControl)
    setShowMoreMenu(preFocusUiStateRef.current.showMoreMenu)

    focusCloseButtonTimeoutRef.current = window.setTimeout(() => {
      setFocusCloseButtonState('hidden')
      focusCloseButtonTimeoutRef.current = null
    }, 180)
  }

  const applyImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }

    const url = URL.createObjectURL(file)
    if (previousImageUrl.current) {
      URL.revokeObjectURL(previousImageUrl.current)
    }
    previousImageUrl.current = url
    setImageSrc(url)
    setImageLoaded(false)
    setIsLocked(false)
    setIsMirrored(false)
    setShowOpacityControl(false)
    setShowMoreMenu(false)
    applyTransformToOverlay(defaultTransform)
    pendingTransformRef.current = defaultTransform
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      applyImageFile(file)
    }
    event.target.value = ''
  }

  const openGallery = () => {
    triggerHapticFeedback()
    fileInputRef.current?.click()
  }
  const openCameraPicker = () => {
    triggerHapticFeedback()
    cameraInputRef.current?.click()
  }

  const beginPan = (point: Point) => {
    gesture.current.mode = 'pan'
    gesture.current.startX = point.x
    gesture.current.startY = point.y
    gesture.current.baseX = transformRef.current.x
    gesture.current.baseY = transformRef.current.y
  }

  const beginPinch = (first: Point, second: Point) => {
    const center = centerPoint(first, second)
    gesture.current.mode = 'pinch'
    gesture.current.startCenterX = center.x
    gesture.current.startCenterY = center.y
    gesture.current.startDistance = distance(first, second)
    gesture.current.startAngle = angle(first, second)
    gesture.current.baseX = transformRef.current.x
    gesture.current.baseY = transformRef.current.y
    gesture.current.baseScale = transformRef.current.scale
    gesture.current.baseRotation = transformRef.current.rotation
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (isLocked || !imageSrc) {
      return
    }

    const point = { x: event.clientX, y: event.clientY }
    event.preventDefault()
    pointerMap.current.set(event.pointerId, point)
    event.currentTarget.setPointerCapture(event.pointerId)
    gestureActiveRef.current = true

    if (overlayRef.current) {
      overlayRef.current.style.transition = 'none'
    }

    if (pointerMap.current.size === 1) {
      beginPan(point)
    } else if (pointerMap.current.size === 2) {
      const [first, second] = Array.from(pointerMap.current.values())
      beginPinch(first, second)
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (isLocked || !pointerMap.current.has(event.pointerId)) {
      return
    }

    const point = { x: event.clientX, y: event.clientY }
    pointerMap.current.set(event.pointerId, point)
    const precisionScale = precisionMode ? 0.45 : 1

    if (pointerMap.current.size === 1 && gesture.current.mode === 'pan') {
      const [current] = Array.from(pointerMap.current.values())
      const dx = (current.x - gesture.current.startX) * precisionScale
      const dy = (current.y - gesture.current.startY) * precisionScale
      scheduleTransformUpdate({
        ...transformRef.current,
        x: gesture.current.baseX + dx,
        y: gesture.current.baseY + dy,
      })
    }

    if (pointerMap.current.size === 2) {
      const [first, second] = Array.from(pointerMap.current.values())
      const currentCenter = centerPoint(first, second)
      const currentDistance = distance(first, second)
      const currentAngle = angle(first, second)
      const nextScale = clamp(
        (gesture.current.baseScale * currentDistance) /
          Math.max(gesture.current.startDistance, 1),
        0.2,
        6,
      )
      const rotationDelta = (currentAngle - gesture.current.startAngle) * precisionScale
      const dx = (currentCenter.x - gesture.current.startCenterX) * precisionScale
      const dy = (currentCenter.y - gesture.current.startCenterY) * precisionScale

      scheduleTransformUpdate({
        ...transformRef.current,
        x: gesture.current.baseX + dx,
        y: gesture.current.baseY + dy,
        scale: precisionMode ? Math.max(0.2, nextScale) : nextScale,
        rotation: gesture.current.baseRotation + rotationDelta,
      })
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointerMap.current.has(event.pointerId)) {
      return
    }

    pointerMap.current.delete(event.pointerId)

    if (pointerMap.current.size === 1) {
      const [remaining] = Array.from(pointerMap.current.values())
      beginPan(remaining)
    }

    if (pointerMap.current.size === 0) {
      gesture.current.mode = 'none'
      gestureActiveRef.current = false
      if (overlayRef.current) {
        overlayRef.current.style.transition = ''
      }
    }
  }

  const showInstructionCards = !isFocusMode && (!imageSrc || !imageLoaded)
  const isMoreMenuVisible = moreMenuState !== 'closed'

  return (
    <div className="app-shell">
      <div
        className={`splash-screen ${splashStage === 'entering' ? 'splash-screen--entering' : ''} ${splashStage === 'visible' ? 'splash-screen--visible' : ''} ${splashStage === 'exiting' ? 'splash-screen--exiting' : ''} ${splashStage === 'hidden' ? 'splash-screen--hidden' : ''}`}
        aria-hidden={splashStage === 'hidden'}
      >
        <div className="splash-card">
          <div className="splash-logo">
            <SplashLogo />
          </div>
          <div className="splash-copy">
            <h1 className="splash-title">TraceDraw</h1>
            <p className="splash-subtitle">Professional Drawing Tool</p>
          </div>
        </div>
      </div>

      <div className={`camera-stage ${cameraIsVisible ? 'camera-stage--visible' : ''}`}>
        <video
          ref={videoRef}
          className="camera-view"
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
        />

        <div className="overlay-area">
          {imageSrc ? (
            <div
              ref={overlayRef}
              className={`overlay-draggable ${isLocked ? 'locked' : ''}`}
              style={{
                transform: toOverlayTransform(transformRef.current),
                opacity,
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onContextMenu={(event) => event.preventDefault()}
            >
              <img
                src={imageSrc}
                alt="Tracing stencil overlay"
                draggable={false}
                className="trace-image"
                style={{ transform: isMirrored ? 'scaleX(-1)' : 'none' }}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="overlay-loading">Preparing overlay…</div>
              )}
            </div>
          ) : (
            showInstructionCards ? (
              <div className="empty-state">
                <div className="empty-card">
                  <div className="empty-badge">Live tracing mode</div>
                  <p className="empty-title">Trace on top of the live camera.</p>
                  <p className="empty-text">
                    Load a stencil from your gallery or capture a photo to begin.
                  </p>
                  <div className="instruction-list">
                    <div className="instruction-step">
                      <span>1</span>
                      <p>Choose a reference image</p>
                    </div>
                    <div className="instruction-step">
                      <span>2</span>
                      <p>Move and resize it with your fingers</p>
                    </div>
                    <div className="instruction-step">
                      <span>3</span>
                      <p>Lock it in place when you are ready to trace</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          )}
        </div>

        {isFocusMode ? null : (
          <div className={`floating-toolbar ${toolbarIsVisible ? 'floating-toolbar--visible' : ''}`} role="toolbar" aria-label="Trace controls">
          <div className="toolbar-copy">
            <span className="toolbar-label">Trace controls</span>
            <span className="toolbar-hint">
              {imageSrc ? 'Pinch • Drag • Rotate' : 'Capture or import an image'}
            </span>
          </div>
          <div className="toolbar-actions">
            <button
              className="icon-button"
              onClick={openCameraPicker}
              aria-label="Capture from camera"
              title="Capture from camera"
            >
              <CameraIcon />
            </button>
            <button
              className="icon-button"
              onClick={openGallery}
              aria-label="Replace image"
              title="Replace image"
            >
              <GalleryIcon />
            </button>
            <button
              className={`icon-button ${isLocked ? 'active' : ''}`}
              onClick={() => {
                triggerHapticFeedback()
                setLockIconAnimating(true)
                setIsLocked((current) => !current)
              }}
              disabled={!imageSrc}
              aria-label="Lock overlay"
              title="Lock overlay"
            >
              <span className={`icon-button-icon ${lockIconAnimating ? 'icon-button-icon--animating' : ''}`}>
                {isLocked ? <LockIcon /> : <UnlockIcon />}
              </span>
            </button>
            <button
              className={`icon-button ${showOpacityControl ? 'active' : ''}`}
              onClick={() => {
                triggerHapticFeedback()
                setShowOpacityControl((current) => !current)
                setShowMoreMenu(false)
                setMoreMenuState('closed')
                setMoreMenuDragOffset(0)
              }}
              disabled={!imageSrc}
              aria-label="Adjust opacity"
              title="Adjust opacity"
            >
              <OpacityIcon />
            </button>
            <button
              className={`icon-button ${isFocusMode ? 'active' : ''}`}
              onClick={enterFocusMode}
              aria-label="Focus mode"
              title="Focus mode"
            >
              <FocusIcon />
            </button>
            <button
              className={`icon-button ${showMoreMenu ? 'active' : ''}`}
              onClick={handleMoreMenuToggle}
              aria-label="Advanced tools"
              title="Advanced tools"
            >
              <MoreIcon />
            </button>
          </div>
        </div>
        )}

        {(isFocusMode || focusCloseButtonState !== 'hidden') ? (
          <button
            className={`focus-close-button ${focusCloseButtonState === 'visible' ? 'visible' : 'hiding'}`}
            type="button"
            onClick={exitFocusMode}
            aria-label="Exit focus mode"
            title="Exit focus mode"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        ) : null}

        {showOpacityControl && !isFocusMode ? (
          <div className="compact-sheet" role="dialog" aria-label="Opacity controls">
            <div className="sheet-title">Overlay opacity</div>
            <input
              className="opacity-input"
              type="range"
              min="0"
              max="100"
              value={Math.round(opacity * 100)}
              onChange={(event) => {
                triggerHapticFeedback()
                setOpacity(Number(event.target.value) / 100)
              }}
              aria-label="Overlay opacity"
            />
          </div>
        ) : null}

        {isMoreMenuVisible && !isFocusMode ? (
          <>
            <div className={`more-menu-backdrop ${moreMenuState === 'open' || moreMenuState === 'opening' ? 'more-menu-backdrop--visible' : ''}`} onPointerDown={closeMoreMenu} />
            <div
              className={`compact-sheet compact-sheet--tools ${moreMenuState === 'opening' ? 'compact-sheet--opening' : ''} ${moreMenuState === 'open' ? 'compact-sheet--open' : ''} ${moreMenuState === 'closing' ? 'compact-sheet--closing' : ''}`}
              role="dialog"
              aria-label="Advanced tools"
              onPointerDown={handleMoreMenuPointerDown}
              onPointerMove={handleMoreMenuPointerMove}
              onPointerUp={handleMoreMenuPointerUp}
              onPointerCancel={handleMoreMenuPointerUp}
              style={{ ['--sheet-drag-y' as string]: `${moreMenuDragOffset}px` }}
            >
              <div className="sheet-handle" />
              <div className="sheet-title">Advanced tools</div>
              <div className="sheet-option-row">
                <div>
                  <p className="sheet-option-title">Precision Mode</p>
                  <p className="sheet-text">Fine-tune small moves with greater control.</p>
                </div>
                <button
                  className={`sheet-toggle ${precisionMode ? 'on' : ''}`}
                  onClick={() => setPrecisionMode((current) => !current)}
                  aria-pressed={precisionMode}
                >
                  <span />
                </button>
              </div>
              <div className="sheet-option-row">
                <div>
                  <p className="sheet-option-title">Auto Save Session</p>
                  <p className="sheet-text">Keep your current placement for later.</p>
                </div>
                <button
                  className={`sheet-toggle ${autoSaveSession ? 'on' : ''}`}
                  onClick={() => setAutoSaveSession((current) => !current)}
                  aria-pressed={autoSaveSession}
                >
                  <span />
                </button>
              </div>
              <button className="sheet-action" onClick={resetTransform}>
                Reset Position
              </button>
              <button className="sheet-action" onClick={handleFlipImage}>
                <span className="sheet-action__row">
                  <span>Flip Image</span>
                  <MirrorIcon />
                </span>
              </button>
              <button className="sheet-action" onClick={handleRotate90}>
                <span className="sheet-action__row">
                  <span>Rotate 90°</span>
                  <RotateIcon />
                </span>
              </button>
            </div>
          </>
        ) : null}
      </div>

      <input
        ref={cameraInputRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        className="hidden-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  )
}

export default App
