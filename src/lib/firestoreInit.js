import { getDocument, setDocument } from './firestoreService';
import { policyStarterContent } from './policyStarterContent';

export const initializeFirestoreCollections = async () => {
  const defaults = {
    settings: {
      general: {
        storeName: 'My Store',
        currencySymbol: 'AED',
        currencyPosition: 'before',
        deliveryCharge: '',
        freeShippingThreshold: '',
      },
      contactPageSettings: {
        heading: "Get in Touch",
        subtitle: "We'd love to hear from you. Send us your question and our team will get back to you.",
        cards: {
          phone: { enabled: true, title: 'Phone', value: '+1 (555) 123-4567', order: 1 },
          whatsapp: { enabled: true, title: 'WhatsApp', value: '+1 (555) 987-6543', order: 2 },
          email: { enabled: true, title: 'Email', value: 'support@example.com', order: 3 },
          address: { enabled: true, title: 'Address', value: '123 Commerce St, Suite 100\nNew York, NY 10001', order: 4 },
          workingHours: { enabled: true, title: 'Working Hours', value: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: Closed', order: 5 }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    },
    checkout: {
      default: {
        enableCreditCard: false,
        enableCashOnDelivery: true,
        deliveryCharge: '',
        freeShippingThreshold: '',
        enableGoogleMaps: true,
        checkoutFields: []
      }
    },
    whatsapp: {
      default: {
        enabled: true,
        phoneNumber: '',
        defaultMessage: 'Hello!',
        position: 'right'
      }
    },
    seo: {
      default: {
        general: { title: 'Store', metaDescription: '', searchEngineVisibility: 'on' }
      }
    },
    puzzlePopupSettings: {
      default: {
        enabled: false,
        triggerType: 'exit-intent',
        delay: 5,
        title: 'Solve the Puzzle & Win!',
        description: 'Put the image back together to reveal your secret discount code.',
        image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=500&auto=format&fit=crop',
        couponCode: 'PUZZLE15',
        discountType: 'percentage',
        discountValue: 15,
        puzzleType: 'sliding',
        difficulty: 3,
        timeLimit: 60,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        buttonColor: '#8B5CF6',
        fontFamily: 'Inter',
        animationStyle: 'spring',
        showFrequency: 'once_session',
        successTitle: 'Congratulations!',
        successMessage: 'You solved it! Here is your reward:',
        buttonText: 'Shop Now',
        allowReshuffle: true,
        allowHint: true
      }
    }
  };

  try {
    for (const [collection, docs] of Object.entries(defaults)) {
      for (const [docId, data] of Object.entries(docs)) {
        const existing = await getDocument(collection, docId);
        if (!existing) {
          await setDocument(collection, docId, data);
        }
      }
    }

    // Initialize Policy Pages
    for (const [slug, contentData] of Object.entries(policyStarterContent)) {
      const docId = `policy-${slug}`;
      const existingPolicy = await getDocument('pages', docId);
      if (!existingPolicy) {
        await setDocument('pages', docId, {
          ...contentData,
          slug,
          path: `/${slug}`,
          status: 'publish',
          isPolicy: true,
          showOnStore: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    console.log("Firestore initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firestore:", error);
  }
};