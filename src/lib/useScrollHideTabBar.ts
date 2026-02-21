import { useRef, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, GestureResponderEvent } from 'react-native';
import { useTabBar } from './TabBarContext';

export function useScrollHideTabBar() {
  const { setVisible } = useTabBar();
  const lastOffsetY = useRef(0);
  const lastTime = useRef(0);
  const touchStartY = useRef(0);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const time = e.timeStamp;
    
    // Calculate velocity manually
    const dt = time - lastTime.current;
    const dy = offsetY - lastOffsetY.current;
    
    if (dt > 0) {
      const velocity = dy / dt;
      
      // If at the very top, always show
      if (offsetY <= 0) {
        setVisible(true);
      } 
      // If scrolling down fast, hide
      else if (velocity > 1.5) {
        setVisible(false);
      } 
      // If scrolling up fast, show
      else if (velocity < -1.5) {
        setVisible(true);
      }
    }

    lastOffsetY.current = offsetY;
    lastTime.current = time;
  }, [setVisible]);

  const onTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartY.current = e.nativeEvent.pageY;
  }, []);

  const onTouchEnd = useCallback((e: GestureResponderEvent) => {
    const touchEndY = e.nativeEvent.pageY;
    const dy = touchStartY.current - touchEndY;
    
    // If swiped up (finger moves up, page moves down)
    if (dy > 50) {
      setVisible(false);
    } 
    // If swiped down (finger moves down, page moves up)
    else if (dy < -50) {
      setVisible(true);
    }
  }, [setVisible]);

  return { onScroll, onTouchStart, onTouchEnd, scrollEventThrottle: 16 };
}
