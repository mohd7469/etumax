import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useSeo } from '@/context/SeoContext';

const MetaInjector = () => {
	const { generalSettings } = useSeo();
	const location = useLocation();

	if (generalSettings.searchEngineVisibility === 'off') {
		return (
			<Helmet>
				<meta name="robots" content="noindex, nofollow" />
			</Helmet>
		);
	}

	// In a real app, you'd have more sophisticated logic to get
	// page-specific SEO data here, based on `location.pathname`.
	// For now, we're just handling the global `noindex` toggle.

	return null;
};

export default MetaInjector;