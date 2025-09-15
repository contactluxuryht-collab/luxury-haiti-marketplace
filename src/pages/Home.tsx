import { SearchIcon, Filter, TrendingUp, Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/marketplace/ProductCard"
import heroImage from "@/assets/hero-image.jpg"
import productJewelry from "@/assets/product-jewelry.jpg"
import productTextile from "@/assets/product-textile.jpg"
import productCoffee from "@/assets/product-coffee.jpg"

// Sample data - will be replaced with real data from Supabase
const sampleProducts = [
  {
    id: "1",
    title: "Handcrafted Coral Necklace",
    description: "Exquisite handmade jewelry featuring traditional Haitian coral patterns with gold accents",
    price: 299,
    imageUrl: productJewelry,
    seller: { name: "Marie Artisan", avatar: "" }
  },
  {
    id: "2", 
    title: "Traditional Woven Textile",
    description: "Beautiful artisan textile with authentic Haitian patterns, perfect for luxury home decor",
    price: 199,
    imageUrl: productTextile,
    seller: { name: "Jean Baptiste", avatar: "" }
  },
  {
    id: "3",
    title: "Premium Mountain Coffee",
    description: "Single-origin coffee beans from Haiti's mountain regions, roasted to perfection",
    price: 45,
    imageUrl: productCoffee,
    seller: { name: "Café Haiti", avatar: "" }
  },
  {
    id: "4",
    title: "Handcrafted Coral Necklace",
    description: "Exquisite handmade jewelry featuring traditional Haitian coral patterns with gold accents",
    price: 299,
    imageUrl: productJewelry,
    seller: { name: "Marie Artisan", avatar: "" }
  },
  {
    id: "5", 
    title: "Traditional Woven Textile",
    description: "Beautiful artisan textile with authentic Haitian patterns, perfect for luxury home decor",
    price: 199,
    imageUrl: productTextile,
    seller: { name: "Jean Baptiste", avatar: "" }
  },
  {
    id: "6",
    title: "Premium Mountain Coffee",
    description: "Single-origin coffee beans from Haiti's mountain regions, roasted to perfection",
    price: 45,
    imageUrl: productCoffee,
    seller: { name: "Café Haiti", avatar: "" }
  },
]

const categories = ["All", "Jewelry", "Textiles", "Coffee", "Art", "Crafts"]

export default function Home() {
  const handleAddToWishlist = (id: string) => {
    console.log("Add to wishlist:", id)
  }

  const handleViewProduct = (id: string) => {
    console.log("View product:", id)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-luxury">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury Haiti Marketplace"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent" />
        </div>
        
        <div className="relative px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight drop-shadow-lg">
              Discover 
              <span className="block bg-gradient-sunset bg-clip-text text-transparent">
                Luxury Haiti
              </span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-8 leading-relaxed drop-shadow-md">
              Explore premium handcrafted products from talented Haitian artisans. 
              From exquisite jewelry to traditional textiles, discover the beauty of Haiti's craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
          <Button variant="hero" size="hero" className="shadow-elevated bg-primary text-primary-foreground hover:bg-primary/90">
            <TrendingUp className="mr-2 h-5 w-5" />
            Explore Marketplace
          </Button>
          <Button variant="outline" size="hero" className="border-foreground/30 text-foreground hover:bg-foreground/10 backdrop-blur-sm">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AliExpress-style Search Bar */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          {/* All Categories Button */}
          <div className="lg:w-48">
            <Button 
              variant="default" 
              className="w-full h-12 justify-between bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <div className="flex items-center gap-2">
                <Menu className="h-4 w-4" />
                All Categories
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search for products, brands and more..."
                className="pl-10 h-12 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            
            <Button variant="default" className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Search
            </Button>
          </div>
          
          <div className="flex gap-2 items-center">
            <Button variant="outline" className="gap-2 h-12 border-border text-foreground hover:bg-accent">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === "All" ? "default" : "ghost"}
              className={`whitespace-nowrap border-b-2 rounded-none ${
                category === "All" 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-transparent"
              }`}
              size="sm"
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
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Featured Products</h2>
            <p className="text-muted-foreground">Handpicked luxury items from our best artisans</p>
          </div>
          <Button variant="luxury">View All</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
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
          <div className="text-muted-foreground">Premium Products</div>
        </div>
        <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50">
          <div className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">100+</div>
          <div className="text-muted-foreground">Verified Artisans</div>
        </div>
        <div className="text-center p-6 rounded-xl bg-gradient-card backdrop-blur-sm border border-border/50">
          <div className="text-3xl font-bold bg-gradient-luxury bg-clip-text text-transparent mb-2">98%</div>
          <div className="text-muted-foreground">Customer Satisfaction</div>
        </div>
      </section>
    </div>
  )
}