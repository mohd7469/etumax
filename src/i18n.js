import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		debug: false,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
		resources: {
			en: {
				translation: {
					// English translations can be added here if needed,
					// but by default it will show the keys.
				}
			},
			ar: {
				translation: {
					"Discover Amazing Deals": "اكتشف عروض مذهلة",
					"Shop from thousands of quality products at unbeatable prices": "تسوق من آلاف المنتجات عالية الجودة بأسعار لا تقبل المنافسة",
					"Shop Now": "تسوق الآن",
					"New Arrivals Are Here": "وصلت المنتجات الجديدة",
					"Check out the latest trends in our collection": "اطلع على أحدث الصيحات في مجموعتنا",
					"Explore New": "استكشف الجديد",
					"Free Shipping": "شحن مجاني",
					"On orders over $50": "للطلبات فوق 50 دولار",
					"Secure Payment": "دفع آمن",
					"100% protected": "محمي 100٪",
					"Easy Returns": "إرجاع سهل",
					"30-day guarantee": "ضمان 30 يوم",
					"Best Quality": "أفضل جودة",
					"Top-rated products": "منتجات الأعلى تقييمًا",
					"Shop by Category": "تسوق حسب الفئة",
					"Explore our wide range of products": "استكشف مجموعتنا الواسعة من المنتجات",
					"Featured Products": "منتجات مميزة",
					"Hand-picked items just for you": "عناصر منتقاة خصيصًا لك",
					"View All": "عرض الكل",
					"Best Sellers": "الأكثر مبيعًا",
					"Most popular products this month": "المنتجات الأكثر شعبية هذا الشهر",
					"New Arrivals": "وصل حديثًا",
					"Fresh products just added": "منتجات جديدة تمت إضافتها للتو",
				}
			}
		}
	});

export default i18n;