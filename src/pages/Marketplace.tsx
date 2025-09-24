import { useEffect, useMemo, useState } from "react"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSettings } from "@/hooks/useSettings"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useWishlist } from "@/hooks/useWishlist"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Marketplace() {
  const { t } = useSettings()
  const translateCategoryName = (name: string = "") => {
    const key = name.toLowerCase().replace(/\s*&\s*/g, ' & ').trim()
    const map: Record<string, string> = {
      // Adult
      "18+ (adults)": "18+ (Adultes)",
      "adult": "18+ (Adultes)",
      // Art & Crafts
      "art": "Art",
      "arts & crafts": "Arts & Artisanat",
      "art & crafts": "Arts & Artisanat",
      "crafts": "Artisanat",
      "art & paintings": "Art & Peintures",
      // Audio
      "audio & casques": "Audio & Casques",
      "audio & headphones": "Audio & Casques",
      // Automotive
      "automotive": "Automobile",
      // Bags & Luggage
      "bags & luggage": "Sacs & Bagages",
      // Beauty
      "beauté": "Beauté",
      "beauty & personal care": "Beauté & Soins personnels",
      // Bicycles
      "bicycles": "Vélos",
      // Books
      "livres": "Livres",
      "books": "Livres",
      // Cameras & Photography
      "cameras & photography": "Appareils photo & Photographie",
      // Coffee & Spices / Café
      "café": "Café",
      "coffee": "Café",
      "coffee & spices": "Café & Épices",
      // Collectibles
      "collectibles": "Objets de collection",
      // Computers & Laptops
      "ordinateurs & portables": "Ordinateurs & Portables",
      "computers & laptops": "Ordinateurs & Portables",
      // Electronics
      "électronique": "Électronique",
      "electronics": "Électronique",
      // Fashion
      "mode": "Mode",
      "men's fashion": "Mode Homme",
      "women's fashion": "Mode Femme",
      // Food
      "food": "Alimentation",
      "food & beverages": "Alimentation & Boissons",
      "gourmet & specialty foods": "Produits gourmets & spécialisés",
      // Furniture
      "furniture": "Meubles",
      // Gaming
      "jeux": "Jeux",
      "gaming": "Jeux",
      // Garden & Outdoor
      "garden & outdoor": "Jardin & Plein air",
      // Health
      "health & wellness": "Santé & Bien‑être",
      // Home
      "home & kitchen": "Maison & Cuisine",
      "home & living": "Maison & Vie",
      "home decor": "Décoration d’intérieur",
      "home": "Maison",
      // Industrial
      "industrial & scientific": "Industrie & Scientifique",
      // Jewelry
      "bijoux": "Bijoux",
      "jewelry & accessories": "Bijoux & Accessoires",
      // Kids & Baby
      "kids & baby": "Enfants & Bébé",
      // Medical
      "medical supplies": "Fournitures médicales",
      // Movies, Music
      "movies & tv": "Films & TV",
      "music": "Musique",
      // Office
      "office supplies": "Fournitures de bureau",
      // Outdoor Recreation
      "outdoor recreation": "Activités de plein air",
      // Pets
      "pet supplies": "Articles pour animaux",
      // Phones & Accessories
      "phones & accessories": "Téléphones & Accessoires",
      "phones and accessories": "Téléphones & Accessoires",
      // Shoes
      "shoes": "Chaussures",
      // Sports
      "sports & fitness": "Sports & Fitness",
      "sports & outdoors": "Sports & Plein air",
      "sports": "Sports",
      // Textiles
      "textiles": "Textiles",
      "textiles & clothing": "Textiles & Vêtements",
      // Tools & Hardware
      "tools & hardware": "Outils & Quincaillerie",
      // Traditional Crafts
      "traditional crafts": "Artisanat traditionnel",
      // Watches
      "watches": "Montres",
    }
    return map[key] || name
  }
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { addToWishlist, isInWishlist } = useWishlist()

  const [showAgeGate, setShowAgeGate] = useState(false)
  const [pendingAdultsCategoryId, setPendingAdultsCategoryId] = useState<string | null>(null)

  const isAdultsCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId)
    if (!cat) return false
    const name = (cat.name || "").toLowerCase()
    return name.includes("18+") || name.includes("adult") || name.includes("adulte") || name.includes("adultes")
  }

  const hasVerifiedAge = useMemo(() => {
    return localStorage.getItem("ageVerified18") === "true"
  }, [])

  useEffect(() => {
    // If we already verified in a previous session, proceed with pending selection
    if (hasVerifiedAge && pendingAdultsCategoryId) {
      setSelectedCategory(pendingAdultsCategoryId)
      setPendingAdultsCategoryId(null)
      setShowAgeGate(false)
    }
  }, [hasVerifiedAge, pendingAdultsCategoryId])

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const handleAddToWishlist = async (productId: string) => {
    await addToWishlist(productId)
  }

  const handleViewProduct = (productId: string) => {
    // Use our mock ids for now if missing
    const idToUse = productId || 'p1'
    window.location.assign(`/product/${idToUse}`)
  }

  if (productsLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
          <p className="text-muted-foreground">Browse all available products</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t('featured_products')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Categories Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            size="sm"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => {
                if (isAdultsCategory(category.id)) {
                  if (localStorage.getItem("ageVerified18") === "true") {
                    setSelectedCategory(category.id)
                  } else {
                    setPendingAdultsCategoryId(category.id)
                    setShowAgeGate(true)
                  }
                } else {
                  setSelectedCategory(category.id)
                }
              }}
              size="sm"
              className="whitespace-nowrap"
            >
              {translateCategoryName(category.name)}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gradient-card rounded-xl border border-border/50">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p className="text-muted-foreground">
              {products.length === 0 
                ? "No products are available yet"
                : "Try adjusting your search or filters"
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              description={product.description || ""}
              price={product.price}
              imageUrl={product.image_url || "/placeholder.svg"}
              seller={{
                name: product.seller?.name || "Unknown Seller",
                avatar: "",
                phoneNumber: product.seller?.phone_number || null
              }}
              onAddToWishlist={handleAddToWishlist}
              onViewProduct={handleViewProduct}
              isInWishlist={isInWishlist(product.id)}
            />
          ))}
        </div>
      )}
    </div>
    <AlertDialog open={showAgeGate} onOpenChange={setShowAgeGate}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Age Verification</AlertDialogTitle>
          <AlertDialogDescription>
            This category contains adult-only products (18+), including items like vaping and other age-restricted goods.
            Please confirm you are at least 18 years old to continue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setShowAgeGate(false)
            setPendingAdultsCategoryId(null)
          }}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => {
            localStorage.setItem("ageVerified18", "true")
            if (pendingAdultsCategoryId) {
              setSelectedCategory(pendingAdultsCategoryId)
            }
            setPendingAdultsCategoryId(null)
            setShowAgeGate(false)
          }}>I am 18 or older</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}