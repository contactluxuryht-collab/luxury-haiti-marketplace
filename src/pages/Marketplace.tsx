import { useState } from "react"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { useProducts } from "@/hooks/useProducts"
import { useCategories } from "@/hooks/useCategories"
import { useWishlist } from "@/hooks/useWishlist"

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { products, loading: productsLoading } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()
  const { addToWishlist, isInWishlist } = useWishlist()

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
    console.log("View product:", productId)
    // Navigate to product detail page
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
        <p className="text-muted-foreground">Browse all available products</p>
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
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
              className="whitespace-nowrap"
            >
              {category.name}
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
                avatar: ""
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