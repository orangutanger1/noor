import { Dimensions } from 'react-native';
import { useState, useEffect } from 'react';

const TABLET_BREAKPOINT = 768;
const PHONE_MAX_CONTENT_WIDTH = 500;

export function useResponsive() {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const isTablet = dimensions.width >= TABLET_BREAKPOINT;

  return {
    isTablet,
    screenWidth: dimensions.width,
    contentMaxWidth: isTablet ? PHONE_MAX_CONTENT_WIDTH : undefined,
  };
}
