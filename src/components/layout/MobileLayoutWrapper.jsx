
import React from 'react';
import { useMobileLayout } from '@/context/MobileLayoutContext';
import { useGlobalMobileSpacing } from '@/hooks/useGlobalMobileSpacing';
import MobileTopStrip from './mobile/MobileTopStrip';
import MobileHeader from './mobile/MobileHeader';
import MobileShopBar from './mobile/MobileShopBar';

const MobileLayoutWrapper = ({ children }) => {
  const { settings, loading } = useMobileLayout();
  const { style, validPaddingX, negativeMarginX } = useGlobalMobileSpacing();

  if (loading || !settings) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen mobile-global-container" style={style}>
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 1023px) {
          .mobile-spacing-wrapper {
            padding-left: var(--mobile-valid-padding-x) !important;
            padding-right: var(--mobile-valid-padding-x) !important;
            padding-top: var(--mobile-valid-padding-y) !important;
            padding-bottom: var(--mobile-valid-padding-y) !important;
            margin-left: var(--mobile-negative-margin-x) !important;
            margin-right: var(--mobile-negative-margin-x) !important;
            margin-top: var(--mobile-negative-margin-y) !important;
            margin-bottom: var(--mobile-negative-margin-y) !important;
            display: flex;
            flex-direction: column;
            gap: var(--mobile-valid-gap) !important;
          }
          .mobile-spacing-wrapper > section, .mobile-spacing-wrapper > div {
            margin-bottom: var(--mobile-negative-gap) !important;
          }
          .mobile-spacing-wrapper > section:last-child, .mobile-spacing-wrapper > div:last-child {
            margin-bottom: 0 !important;
          }
        }
      `}} />
      
      {/* Mobile only headers */}
      <div className="block lg:hidden w-full z-40 sticky top-0 bg-white" style={{ paddingLeft: `${validPaddingX}px`, paddingRight: `${validPaddingX}px`, marginLeft: `${negativeMarginX}px`, marginRight: `${negativeMarginX}px` }}>
        <MobileTopStrip />
        <MobileHeader />
        <MobileShopBar />
      </div>

      <main className="flex-1 w-full overflow-x-hidden">
        <div className="lg:!p-0 lg:!gap-0 lg:!m-0 mobile-spacing-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MobileLayoutWrapper;
