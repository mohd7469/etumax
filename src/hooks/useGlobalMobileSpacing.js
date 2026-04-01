
import { useMobileLayout } from '@/context/MobileLayoutContext';

export const useGlobalMobileSpacing = () => {
  const { settings, loading } = useMobileLayout();
  
  if (loading || !settings) {
    return {
      paddingX: 12,
      paddingY: 12,
      sectionSpacing: 16,
      style: {
        '--mobile-valid-padding-x': '12px',
        '--mobile-negative-margin-x': '0px',
        '--mobile-valid-padding-y': '12px',
        '--mobile-negative-margin-y': '0px',
        '--mobile-valid-gap': '16px',
        '--mobile-negative-gap': '0px',
      }
    };
  }

  const paddingX = settings.pagePadding?.horizontal ?? 12;
  const paddingY = settings.pagePadding?.vertical ?? 12;
  const sectionSpacing = settings.sectionSpacing ?? 16;

  // CSS cannot handle negative padding or gap natively.
  // We convert negative values to negative margins.
  const validPaddingX = Math.max(0, paddingX);
  const negativeMarginX = Math.min(0, paddingX);
  
  const validPaddingY = Math.max(0, paddingY);
  const negativeMarginY = Math.min(0, paddingY);
  
  const validGap = Math.max(0, sectionSpacing);
  const negativeGap = Math.min(0, sectionSpacing);

  return {
    paddingX,
    paddingY,
    sectionSpacing,
    validPaddingX,
    negativeMarginX,
    validPaddingY,
    negativeMarginY,
    validGap,
    negativeGap,
    style: {
      '--mobile-valid-padding-x': `${validPaddingX}px`,
      '--mobile-negative-margin-x': `${negativeMarginX}px`,
      '--mobile-valid-padding-y': `${validPaddingY}px`,
      '--mobile-negative-margin-y': `${negativeMarginY}px`,
      '--mobile-valid-gap': `${validGap}px`,
      '--mobile-negative-gap': `${negativeGap}px`,
    }
  };
};
