import { useState, useEffect } from 'react';
import performanceManager from './performanceManager';

/**
 * React hook to access current performance tier and visibility
 */
export function usePerformanceTier() {
  const [state, setState] = useState({
    tier: performanceManager.tier,
    isLowEnd: performanceManager.isLowEnd,
    isMobile: performanceManager.isMobile,
    isTabVisible: performanceManager.isTabVisible,
    fps: performanceManager.fps
  });

  useEffect(() => {
    return performanceManager.subscribe(setState);
  }, []);

  return state;
}

export default usePerformanceTier;
