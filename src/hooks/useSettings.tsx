import { createContext, useContext, useMemo, useState } from 'react'

type SupportedLanguage = 'fr' | 'en'
type SupportedCurrency = 'HTG' | 'USD'

type SettingsContextType = {
  language: SupportedLanguage
  setLanguage: (l: SupportedLanguage) => void
  currency: SupportedCurrency
  setCurrency: (c: SupportedCurrency) => void
  formatPrice: (usdAmount: number) => string
  convertToHtg: (usdAmount: number) => number
  convertToUsd: (htgAmount: number) => number
  t: (key: string) => string
}

const I18N: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    'welcome': 'Bienvenue à Luxury Haiti',
    'subtitle': 'Découvrez des produits de qualité d’Haïti et d’ailleurs',
    'sign_in_to_sell': 'Se connecter pour vendre',
    'admin_login': 'Connexion Admin',
    'explore_marketplace': 'Voir le Marché',
    'learn_more': 'En savoir plus',
    'featured_products': 'Produits en vedette',
    'view_all': 'Tout voir',
    'best_sellers': 'Meilleures ventes',
    'add_to_cart': 'Ajouter au panier',
    'add_to_wishlist': 'Ajouter à la liste',
    'in_wishlist': 'Dans la liste',
    'whatsapp_seller': 'WhatsApp Vendeur',
    'related_products': 'Produits similaires',
  },
  en: {
    'welcome': 'Welcome to Luxury Haiti',
    'subtitle': 'Discover premium products from Haiti and beyond',
    'sign_in_to_sell': 'Sign In to Sell',
    'admin_login': 'Admin Login',
    'explore_marketplace': 'Explore Marketplace',
    'learn_more': 'Learn More',
    'featured_products': 'Featured Products',
    'view_all': 'View All',
    'best_sellers': 'Best Sellers',
    'add_to_cart': 'Add to Cart',
    'add_to_wishlist': 'Add to Wishlist',
    'in_wishlist': 'In Wishlist',
    'whatsapp_seller': 'WhatsApp Seller',
    'related_products': 'Related products',
  }
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language] = useState<SupportedLanguage>('fr')
  const [currency, setCurrency] = useState<SupportedCurrency>('HTG')
  // Simple conversion rate USD -> HTG. Can be made dynamic later.
  const usdToHtg = 132

  const formatPrice = (usdAmount: number) => {
    const amount = currency === 'HTG' ? Math.round(usdAmount * usdToHtg) : usdAmount
    const locale = language === 'fr' ? 'fr-HT' : 'en-US'
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
      maximumFractionDigits: currency === 'HTG' ? 0 : 2,
    })
    return formatter.format(amount)
  }

  const convertToHtg = (usdAmount: number) => {
    return Math.round(usdAmount * usdToHtg)
  }

  const convertToUsd = (htgAmount: number) => {
    return htgAmount / usdToHtg
  }

  const t = useMemo(() => {
    const dict = I18N[language]
    return (key: string) => dict[key] ?? key
  }, [language])

  const value: SettingsContextType = {
    language,
    setLanguage: () => {},
    currency,
    setCurrency,
    formatPrice,
    convertToHtg,
    convertToUsd,
    t,
  }

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}


