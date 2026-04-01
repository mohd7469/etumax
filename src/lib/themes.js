// src/lib/themes.js

// Base theme used as default + as a base for "custom"
export const defaultTheme = {
	name: "Default Classic",
	colors: {
		background: '#F8FAFC',
		foreground: '#0F172A',
		card: '#FFFFFF',
		'card-foreground': '#0F172A',
		popover: '#FFFFFF',
		'popover-foreground': '#0F172A',

		primary: '#2563EB',
		'primary-foreground': '#FFFFFF',

		secondary: '#7C3AED',
		'secondary-foreground': '#FFFFFF',

		muted: '#E2E8F0',
		'muted-foreground': '#64748B',

		accent: '#14B8A6',
		'accent-foreground': '#FFFFFF',

		destructive: '#DC2626',
		'destructive-foreground': '#FFFFFF',

		border: '#E2E8F0',
		input: '#E2E8F0',
		ring: '#2563EB',
	},
	typography: {
		headingFont: 'Poppins',
		bodyFont: 'Inter',
	},
	button: {
		shape: '10px',
		shadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
	},
};

export const themes = {
	// 1) DEFAULT CLASSIC LIGHT
	default: defaultTheme,

	// 2) MODERN CLEAN – premium light SaaS style
	"modern-clean": {
		name: "Modern Clean",
		colors: {
			background: '#F7FAFC',
			foreground: '#0F172A',
			card: '#FFFFFF',
			'card-foreground': '#0F172A',
			popover: '#FFFFFF',
			'popover-foreground': '#0F172A',

			primary: '#0F766E',
			'primary-foreground': '#FFFFFF',

			secondary: '#334155',
			'secondary-foreground': '#FFFFFF',

			muted: '#EEF2F7',
			'muted-foreground': '#64748B',

			accent: '#2563EB',
			'accent-foreground': '#FFFFFF',

			destructive: '#DC2626',
			'destructive-foreground': '#FFFFFF',

			border: '#E2E8F0',
			input: '#E2E8F0',
			ring: '#0F766E',
		},
		typography: {
			headingFont: 'Inter',
			bodyFont: 'Inter',
		},
		button: {
			shape: '10px',
			shadow: '0 8px 22px rgba(15, 23, 42, 0.08)',
		},
	},

	// 3) ULTRA MINIMAL – elegant grayscale
	"ultra-minimal": {
		name: "Ultra Minimal",
		colors: {
			background: '#FAFAF9',
			foreground: '#111827',
			card: '#FFFFFF',
			'card-foreground': '#111827',
			popover: '#FFFFFF',
			'popover-foreground': '#111827',

			primary: '#18181B',
			'primary-foreground': '#FFFFFF',

			secondary: '#52525B',
			'secondary-foreground': '#FFFFFF',

			muted: '#F4F4F5',
			'muted-foreground': '#71717A',

			accent: '#27272A',
			'accent-foreground': '#FFFFFF',

			destructive: '#B91C1C',
			'destructive-foreground': '#FFFFFF',

			border: '#E4E4E7',
			input: '#E4E4E7',
			ring: '#18181B',
		},
		typography: {
			headingFont: 'Helvetica Neue',
			bodyFont: 'Helvetica Neue',
		},
		button: {
			shape: '8px',
			shadow: '0 6px 14px rgba(0,0,0,0.05)',
		},
	},

	// 4) LUXURY PREMIUM – premium ivory + gold
	"luxury-dark": {
		name: "Luxury Premium",
		colors: {
			background: '#FDF8F2',
			foreground: '#2C1E12',

			card: '#FFFFFF',
			'card-foreground': '#2C1E12',

			popover: '#FFFFFF',
			'popover-foreground': '#2C1E12',

			primary: '#C9A24A',
			'primary-foreground': '#FFFFFF',

			secondary: '#F1E4CF',
			'secondary-foreground': '#2C1E12',

			muted: '#F6EFE5',
			'muted-foreground': '#7C6A58',

			accent: '#A16207',
			'accent-foreground': '#FFFFFF',

			destructive: '#C2410C',
			'destructive-foreground': '#FFFFFF',

			border: '#EADBC8',
			input: '#EADBC8',
			ring: '#C9A24A',
		},
		typography: {
			headingFont: 'Playfair Display',
			bodyFont: 'Inter',
		},
		button: {
			shape: '14px',
			shadow: '0 12px 40px rgba(160,120,40,0.20)',
		},
	},

	// 5) TECH FRESH – cleaner futuristic premium
	"tech-store": {
		name: "Tech Fresh",
		colors: {
			background: '#F4F7FB',
			foreground: '#0F172A',

			card: '#FFFFFF',
			'card-foreground': '#0F172A',

			popover: '#FFFFFF',
			'popover-foreground': '#0F172A',

			primary: '#2563EB',
			'primary-foreground': '#FFFFFF',

			secondary: '#0F766E',
			'secondary-foreground': '#FFFFFF',

			muted: '#E8EEF5',
			'muted-foreground': '#64748B',

			accent: '#7C3AED',
			'accent-foreground': '#FFFFFF',

			destructive: '#DC2626',
			'destructive-foreground': '#FFFFFF',

			border: '#D9E2EC',
			input: '#D9E2EC',
			ring: '#2563EB',
		},
		typography: {
			headingFont: 'Inter',
			bodyFont: 'Inter',
		},
		button: {
			shape: '10px',
			shadow: '0 10px 24px rgba(37, 99, 235, 0.14)',
		},
	},

	// 6) BOLD IMAGE FOCUS – stronger ecommerce/editorial premium
	"bold-image-focus": {
		name: "Bold Image Focus",
		colors: {
			background: '#FFFDF8',
			foreground: '#111827',

			card: '#FFFFFF',
			'card-foreground': '#111827',

			popover: '#FFFFFF',
			'popover-foreground': '#111827',

			primary: '#EA580C',
			'primary-foreground': '#FFFFFF',

			secondary: '#111827',
			'secondary-foreground': '#FFFFFF',

			muted: '#F3F4F6',
			'muted-foreground': '#6B7280',

			accent: '#D97706',
			'accent-foreground': '#FFFFFF',

			destructive: '#DC2626',
			'destructive-foreground': '#FFFFFF',

			border: '#E5E7EB',
			input: '#E5E7EB',
			ring: '#EA580C',
		},
		typography: {
			headingFont: 'Montserrat',
			bodyFont: 'Open Sans',
		},
		button: {
			shape: '8px',
			shadow: '0 8px 0px rgba(17, 24, 39, 0.88)',
		},
	},

	// 7) ADVANCE – upgraded premium corporate / ecommerce
	advance: {
		name: "Advance",
		colors: {
			background: '#F5F7FB',
			foreground: '#0B1220',

			card: '#FFFFFF',
			'card-foreground': '#0B1220',

			popover: '#FFFFFF',
			'popover-foreground': '#0B1220',

			primary: '#2563EB',
			'primary-foreground': '#FFFFFF',

			secondary: '#0EA5A4',
			'secondary-foreground': '#FFFFFF',

			muted: '#EDF2F7',
			'muted-foreground': '#64748B',

			accent: '#F59E0B',
			'accent-foreground': '#111827',

			destructive: '#DC2626',
			'destructive-foreground': '#FFFFFF',

			border: '#E2E8F0',
			input: '#E2E8F0',
			ring: '#2563EB',
		},
		typography: {
			headingFont: 'Inter',
			bodyFont: 'Inter',
		},
		button: {
			shape: '10px',
			shadow: '0 10px 30px rgba(37, 99, 235, 0.15)',
		},
	},

	// 8) GOOD LOOK – soft premium modern brand
	"good-look": {
		name: "Good Look",
		colors: {
			background: '#FCFCFD',
			foreground: '#1E293B',

			card: '#FFFFFF',
			'card-foreground': '#1E293B',

			popover: '#FFFFFF',
			'popover-foreground': '#1E293B',

			primary: '#4F46E5',
			'primary-foreground': '#FFFFFF',

			secondary: '#EC4899',
			'secondary-foreground': '#FFFFFF',

			muted: '#F1F5F9',
			'muted-foreground': '#64748B',

			accent: '#14B8A6',
			'accent-foreground': '#FFFFFF',

			destructive: '#F43F5E',
			'destructive-foreground': '#FFFFFF',

			border: '#E2E8F0',
			input: '#E2E8F0',
			ring: '#4F46E5',
		},
		typography: {
			headingFont: 'SF Pro Display',
			bodyFont: 'SF Pro Text',
		},
		button: {
			shape: '14px',
			shadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
		},
	},

	// 9) NEW – premium dark theme
	"premium-dark": {
		name: "Premium Dark",
		colors: {
			background: '#0B0F19',
			foreground: '#E5E7EB',

			card: '#111827',
			'card-foreground': '#E5E7EB',

			popover: '#111827',
			'popover-foreground': '#E5E7EB',

			primary: '#3B82F6',
			'primary-foreground': '#FFFFFF',

			secondary: '#10B981',
			'secondary-foreground': '#FFFFFF',

			muted: '#1F2937',
			'muted-foreground': '#9CA3AF',

			accent: '#F59E0B',
			'accent-foreground': '#111827',

			destructive: '#EF4444',
			'destructive-foreground': '#FFFFFF',

			border: '#1F2937',
			input: '#1F2937',
			ring: '#3B82F6',
		},
		typography: {
			headingFont: 'Inter',
			bodyFont: 'Inter',
		},
		button: {
			shape: '12px',
			shadow: '0 10px 30px rgba(0,0,0,0.45)',
		},
	},

	// 10) CUSTOM – stays as base; real colors come from database theme settings
	custom: {
		name: "Custom",
		colors: defaultTheme.colors,
		typography: defaultTheme.typography,
		button: defaultTheme.button,
	},
};