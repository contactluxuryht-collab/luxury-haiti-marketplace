import { SearchIcon, Filter, TrendingUp, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/marketplace/ProductCard"
// Hero image served from /public. Save your image as public/lht-hero.jpg
import { useProducts } from "@/hooks/useProducts"

// We now use real products from Supabase via useProducts

const categories = ["Tous", "Électronique", "Téléphones & Accessoires", "Ordinateurs & Portables", "Audio & Casques", "Jeux", "18+ (Adultes)"]

export default function Home() {
  const { products, loading } = useProducts()
  const featured = (products || []).filter((p: any) => p?.is_featured === true).slice(0, 4)
  const best = (products || []).filter((p: any) => p?.is_best_seller === true).slice(0, 8)
  
  // Debug logging
  console.log('Home page - Total products:', products?.length)
  console.log('Home page - Featured products:', featured.length, featured.map(p => p.title))
  console.log('Home page - Best seller products:', best.length, best.map(p => p.title))
  const handleAddToWishlist = (id: string) => {
    window.location.assign(`/product/${id}`)
  }

  const handleViewProduct = (id: string) => {
    window.location.assign(`/product/${id}`)
  }

  const handleSearch = () => {
    window.location.assign('/search')
  }

  const handleOpenFilters = () => {
    window.location.assign('/search')
  }

  const handleCategoryClick = (category: string) => {
    window.location.assign(`/marketplace?category=${category}`)
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-luxury">
        <div className="absolute inset-0">
          <img
            src={"/lht-hero.jpg.png"}
            alt="Luxury Haiti Marketplace"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative px-4 md:px-8 py-12 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight drop-shadow-lg whitespace-nowrap">
                Découvrez Luxury Haiti
              </h1>
            <p className="text-base md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed drop-shadow-md">
              Un marché moderne où vous trouvez tout : mode, électronique, maison et plus encore—with un accent fort sur les produits haïtiens.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button variant="hero" size="hero" className="shadow-elevated bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.location.assign('/marketplace')}>
            <TrendingUp className="mr-2 h-5 w-5" />
            Voir le Marché
          </Button>
          <Button variant="outline" size="hero" className="border-foreground/30 text-foreground hover:bg-foreground/10 backdrop-blur-sm" onClick={() => window.location.assign('/about')}>
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AliExpress-style Search Bar */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-3 md:gap-4 items-stretch">
          {/* All Categories Button */}
          <div className="lg:w-48">
            <Button 
              variant="default" 
              className="w-full h-12 justify-between bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                Toutes les catégories
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 flex gap-3 md:gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Rechercher des produits, marques et plus…"
                className="pl-10 h-11 md:h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <Button variant="default" className="h-11 md:h-12 px-6 md:px-8 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSearch}>
              Rechercher
            </Button>
          </div>
          
          <div className="flex gap-2 items-center">
            <Button variant="outline" className="gap-2 h-12 border-border text-foreground hover:bg-accent" onClick={handleOpenFilters}>
              <Filter className="h-4 w-4" />
              Filtres
            </Button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "Tous" ? "default" : "ghost"}
              className={`whitespace-nowrap border-b-2 rounded-none ${
                category === "Tous" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              size="sm"
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Produits en vedette</h2>
            <p className="text-muted-foreground">Sélection d’articles de nos meilleurs vendeurs</p>
          </div>
          <Button variant="luxury" onClick={() => window.location.assign('/marketplace')}>Tout voir</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {(loading ? [] : featured).map((product) => (
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
            />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Meilleures ventes</h2>
            <p className="text-muted-foreground">Nos produits les plus populaires cette semaine</p>
          </div>
          <Button variant="luxury" onClick={() => window.location.assign('/marketplace')}>Tout voir</Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {(loading ? [] : best).map((product) => (
            <ProductCard
              key={`best-${product.id}`}
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
            />
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50">
          <div className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">500+</div>
          <div className="text-muted-foreground">Produits premium</div>
        </div>
        <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50">
          <div className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">10+</div>
          <div className="text-muted-foreground">Vendeurs vérifiés</div>
        </div>
        <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50">
          <div className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">98%</div>
          <div className="text-muted-foreground">Satisfaction client</div>
        </div>
      </section>
    </div>
  )
}