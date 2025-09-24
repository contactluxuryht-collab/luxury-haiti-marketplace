import { useState } from "react"
import { SearchIcon, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useWishlist } from "@/hooks/useWishlist"

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { addToWishlist, isInWishlist } = useWishlist()

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory
    
    const matchesPrice = !priceRange || 
      (product.price >= priceRange.min && product.price <= priceRange.max)
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  const handleAddToWishlist = async (productId: string) => {
    await addToWishlist(productId)
  }

  const handleViewProduct = (productId: string) => {
    console.log("View product:", productId)
  }

  const setPriceFilter = (min: number, max: number) => {
    setPriceRange({ min, max })
  }

  if (productsLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recherche</h1>
          <p className="text-muted-foreground">Trouvez exactement ce que vous cherchez</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des produits…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Recherche avancée</h1>
        <p className="text-muted-foreground">Trouvez exactement ce que vous cherchez</p>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            placeholder="Rechercher des produits, vendeurs, descriptions…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
        <Button variant="outline" className="gap-2 h-12">
          <Filter className="h-4 w-4" />
          Filtres avancés
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="space-y-4">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Catégories</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              Tous
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                size="sm"
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Price Ranges */}
        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Tranche de prix</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={priceRange === null ? "default" : "outline"}
              onClick={() => setPriceRange(null)}
              size="sm"
            >
              Tout prix
            </Button>
            <Button
              variant={priceRange?.min === 0 && priceRange?.max === 50 ? "default" : "outline"}
              onClick={() => setPriceFilter(0, 50)}
              size="sm"
              className="whitespace-nowrap"
            >
              Moins de $50
            </Button>
            <Button
              variant={priceRange?.min === 50 && priceRange?.max === 200 ? "default" : "outline"}
              onClick={() => setPriceFilter(50, 200)}
              size="sm"
              className="whitespace-nowrap"
            >
              $50 - $200
            </Button>
            <Button
              variant={priceRange?.min === 200 && priceRange?.max === 500 ? "default" : "outline"}
              onClick={() => setPriceFilter(200, 500)}
              size="sm"
              className="whitespace-nowrap"
            >
              $200 - $500
            </Button>
            <Button
              variant={priceRange?.min === 500 && priceRange?.max === 99999 ? "default" : "outline"}
              onClick={() => setPriceFilter(500, 99999)}
              size="sm"
              className="whitespace-nowrap"
            >
              Plus de $500
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gradient-card rounded-xl border border-border/50">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground">Essayez d’ajuster vos termes de recherche ou vos filtres</p>
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
  )
}