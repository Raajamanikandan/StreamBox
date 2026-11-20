import React, { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  AlertTriangle,
  ArrowLeft,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

const VideoPlayer = ({
  streamUrl,
  token,
  title = 'Video Stream',
  initialPosition = 0,
  onProgressUpdate, // (position, duration)
  onBack
}) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 is Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isBuffering, setIsBuffering] = useState(true);

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Initialize HLS & Media Player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    setErrorMessage(null);
    setIsBuffering(true);

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        // Requirement: Attach the signed token to every HLS request using hls.js xhrSetup
        xhrSetup: (xhr, url) => {
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.setRequestHeader('X-Stream-Token', token);
          }
        }
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsBuffering(false);
        // Extract quality levels
        const formattedLevels = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          name: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
          bitrate: Math.round(lvl.bitrate / 1000)
        }));
        setLevels(formattedLevels);

        // Resume position if provided
        if (initialPosition > 0 && initialPosition < video.duration) {
          video.currentTime = initialPosition;
        }

        // Try playing
        video.play().catch(() => {
          setIsPlaying(false);
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Try loading once or fail gracefully
              console.warn('HLS Network Error, attempting recovery...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, attempting recovery...');
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setErrorMessage('Video temporarily unavailable');
              setIsBuffering(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari HLS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        if (initialPosition > 0) {
          video.currentTime = initialPosition;
        }
        video.play().catch(() => setIsPlaying(false));
      });
      video.addEventListener('error', () => {
        setErrorMessage('Video temporarily unavailable');
        setIsBuffering(false);
      });
    } else {
      setErrorMessage('Video playback is not supported on this browser.');
      setIsBuffering(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, token, initialPosition]);

  // 2. Playback progress reporting every 15s to backend
  useEffect(() => {
    progressIntervalRef.current = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && video.duration > 0 && onProgressUpdate) {
        onProgressUpdate(Math.floor(video.currentTime), Math.floor(video.duration));
      }
    }, 15000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onProgressUpdate]);

  // 3. Auto-hide controls after 3 seconds of inactivity
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowQualityMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleMouseMove = () => resetControlsTimer();
    const handleTouchStart = () => resetControlsTimer();

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleTouchStart);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleTouchStart);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [resetControlsTimer]);

  // 4. Video Events Handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimer();
  };

  const handleSkip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    resetControlsTimer();
  };

  const handleSeekChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    const seekTo = parseFloat(e.target.value);
    video.currentTime = seekTo;
    setCurrentTime(seekTo);
    resetControlsTimer();
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (video) {
      video.volume = newVol;
      video.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      video.volume = volume > 0 ? volume : 1;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
    resetControlsTimer();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
    resetControlsTimer();
  };

  const handleSelectQuality = (index) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = index; // -1 for auto
      setCurrentLevel(index);
    }
    setShowQualityMenu(false);
    resetControlsTimer();
  };

  // Keyboard accessibility controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] bg-bg-deep flex items-center justify-center select-none overflow-hidden group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        playsInline
      />

      {/* Buffering Indicator */}
      {isBuffering && !errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-16 h-16 border-4 border-text-muted/30 border-t-blue-prime rounded-full animate-spin" />
        </div>
      )}

      {/* Error Screen: Friendly message if media server is unreachable */}
      {errorMessage && (
        <div className="absolute inset-0 bg-bg-deep/95 z-40 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-surface flex items-center justify-center text-error mb-4 border border-error/30">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            {errorMessage}
          </h2>
          <p className="text-sm text-text-muted max-w-md mb-6 leading-relaxed">
            The media stream could not be loaded. Please ensure the Cloudflare tunnel media server is online, or try again in a few moments.
          </p>
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                if (onBack) onBack();
                else navigate(-1);
              }}
            >
              Go Back
            </Button>
            <Button
              variant="primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Top Header Overlay: Back button & Title */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-bg-deep/90 via-bg-deep/40 to-transparent z-30 transition-opacity duration-300 flex items-center gap-4 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={() => {
            if (onBack) onBack();
            else navigate(-1);
          }}
          className="p-2 rounded-full bg-bg-surface/80 hover:bg-bg-surface text-text-primary border border-text-muted/20 transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
          aria-label="Back to browse"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h3 className="text-base sm:text-lg font-bold text-text-primary truncate">
          {title}
        </h3>
      </div>

      {/* Bottom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 pt-16 pb-4 sm:pb-6 px-4 sm:px-8 bg-gradient-to-t from-bg-deep via-bg-deep/80 to-transparent z-30 transition-opacity duration-300 flex flex-col gap-3 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek Bar: track #B6BDC6 at 30% opacity, progress #00A8E1 */}
        <div className="relative w-full group/seek flex items-center cursor-pointer py-2">
          {/* Background track */}
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-text-muted/30 overflow-hidden relative">
            {/* Progress fill: #00A8E1 */}
            <div
              className="h-full bg-blue-prime rounded-full transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Hidden range input for precision dragging & keyboard seek */}
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeekChange}
            aria-label="Video seek bar"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {/* Scrubber thumb on hover */}
          <div
            className="absolute w-4 h-4 rounded-full bg-blue-prime shadow-md pointer-events-none -translate-x-1/2 opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Lower Controls Row */}
        <div className="flex items-center justify-between text-text-primary">
          {/* Left Controls: Play/Pause, Skip 10s, Volume, Time */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Play / Pause button */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="p-2 rounded-lg text-text-primary hover:text-blue-prime transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            {/* Skip 10s back */}
            <button
              onClick={() => handleSkip(-10)}
              aria-label="Skip backward 10 seconds"
              className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Skip 10s forward */}
            <button
              onClick={() => handleSkip(10)}
              aria-label="Skip forward 10 seconds"
              className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume slider"
                className="w-16 sm:w-20 h-1.5 rounded-full bg-text-muted/30 accent-blue-prime cursor-pointer hidden sm:block"
              />
            </div>

            {/* Time display */}
            <div className="text-xs sm:text-sm font-medium text-text-muted tracking-wide ml-1">
              <span className="text-text-primary font-semibold">{formatTime(currentTime)}</span> / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls: Quality Selector & Fullscreen */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Quality Selector */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                aria-label="Quality settings"
                aria-haspopup="true"
                aria-expanded={showQualityMenu}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors border border-text-muted/20 focus-visible:ring-2 focus-visible:ring-blue-prime"
              >
                <Settings className="w-4 h-4" />
                <span>
                  {currentLevel === -1
                    ? 'Auto'
                    : levels[currentLevel]?.name || 'Auto'}
                </span>
              </button>

              {/* Quality Dropdown Menu: #232F3E */}
              {showQualityMenu && (
                <div className="absolute right-0 bottom-full mb-3 w-40 bg-bg-surface border border-text-muted/20 rounded-lg shadow-xl py-2 z-50 animate-fade-in text-xs font-medium">
                  <div className="px-3 py-1.5 text-text-muted uppercase text-[10px] font-bold border-b border-text-muted/20">
                    Resolution
                  </div>
                  <button
                    onClick={() => handleSelectQuality(-1)}
                    className="w-full flex items-center justify-between px-3 py-2 text-text-primary hover:bg-bg-base/60 transition-colors"
                  >
                    <span>Auto</span>
                    {currentLevel === -1 && <Check className="w-3.5 h-3.5 text-blue-prime" />}
                  </button>
                  {levels.map((lvl) => (
                    <button
                      key={lvl.index}
                      onClick={() => handleSelectQuality(lvl.index)}
                      className="w-full flex items-center justify-between px-3 py-2 text-text-primary hover:bg-bg-base/60 transition-colors"
                    >
                      <span>{lvl.name}</span>
                      {currentLevel === lvl.index && (
                        <Check className="w-3.5 h-3.5 text-blue-prime" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen button */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-blue-prime"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
