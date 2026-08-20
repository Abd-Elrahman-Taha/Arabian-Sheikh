/**
 * Performance Manager Utility
 * 
 * Provides:
 * 1. Hardware capability detection (CPU cores, memory, mobile/touch, DPR)
 * 2. Adaptive performance tier classification ('high' | 'balanced' | 'low')
 * 3. Dynamic FPS monitor that downgrades visual intensity if frames drop
 * 4. Global visibility tracker (sleeps canvas & animation loops when tab is hidden)
 */

class PerformanceManager {
  constructor() {
    this.tier = 'high';
    this.isLowEnd = false;
    this.isMobile = false;
    this.isTabVisible = true;
    this.subscribers = new Set();
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = typeof performance !== 'undefined' ? performance.now() : 0;
    this.isMonitoring = false;

    this.detectHardware();
    this.initVisibilityListener();
  }

  detectHardware() {
    if (typeof window === 'undefined') return;

    const nav = window.navigator || {};
    const cores = nav.hardwareConcurrency || 8;
    const memory = nav.deviceMemory || 8; // in GB
    const isTouch = 'ontouchstart' in window || (nav.maxTouchPoints && nav.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth < 768;

    this.isMobile = isSmallScreen || (isTouch && window.innerWidth < 1024);

    // Prefer-reduced-motion check
    const prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

    // Check for low-end device constraints
    if (prefersReducedMotion || cores <= 4 || memory < 4 || (this.isMobile && cores <= 6)) {
      this.tier = 'low';
      this.isLowEnd = true;
    } else if (cores <= 6 || memory <= 4 || this.isMobile) {
      this.tier = 'balanced';
      this.isLowEnd = false;
    } else {
      this.tier = 'high';
      this.isLowEnd = false;
    }
  }

  initVisibilityListener() {
    if (typeof document === 'undefined') return;

    this.isTabVisible = !document.hidden;

    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      this.notify();
    }, { passive: true });
  }

  /**
   * Start lightweight background FPS monitoring for adaptive tier adjustment
   */
  startFpsMonitor() {
    if (this.isMonitoring || typeof window === 'undefined') return;
    this.isMonitoring = true;

    let frames = 0;
    let prevTime = performance.now();
    let lowFpsStreak = 0;

    const checkFps = (time) => {
      if (!this.isMonitoring) return;
      frames++;

      if (time >= prevTime + 1000) {
        this.fps = Math.round((frames * 1000) / (time - prevTime));
        frames = 0;
        prevTime = time;

        // If FPS drops below 35 for 3 consecutive seconds on non-low tier, step down
        if (this.fps < 35 && this.isTabVisible) {
          lowFpsStreak++;
          if (lowFpsStreak >= 3 && this.tier !== 'low') {
            this.tier = this.tier === 'high' ? 'balanced' : 'low';
            this.isLowEnd = this.tier === 'low';
            this.notify();
            lowFpsStreak = 0;
          }
        } else {
          lowFpsStreak = Math.max(0, lowFpsStreak - 1);
        }
      }

      requestAnimationFrame(checkFps);
    };

    requestAnimationFrame(checkFps);
  }

  getOptimalDpr(maxDpr = 2) {
    if (typeof window === 'undefined') return 1;
    if (this.tier === 'low') return 1.0;
    if (this.tier === 'balanced' || this.isMobile) return Math.min(window.devicePixelRatio || 1, 1.25);
    return Math.min(window.devicePixelRatio || 1, maxDpr);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => cb({
      tier: this.tier,
      isLowEnd: this.isLowEnd,
      isMobile: this.isMobile,
      isTabVisible: this.isTabVisible,
      fps: this.fps
    }));
  }
}

export const performanceManager = new PerformanceManager();

if (typeof window !== 'undefined') {
  performanceManager.startFpsMonitor();
}

export default performanceManager;
