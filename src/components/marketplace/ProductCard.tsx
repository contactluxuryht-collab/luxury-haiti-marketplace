import { Heart, ShoppingCart, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSettings } from "@/hooks/useSettings"

interface ProductCardProps {
  id: string
  title: string
  description: string
  price: number
  imageUrl: string
  seller: {
    name: string
    avatar?: string
    phoneNumber?: string | null
  }
  onAddToWishlist?: (id: string) => void
  onViewProduct?: (id: string) => void
  isInWishlist?: boolean
}

export function ProductCard({
  id,
  title,
  description,
  price,
  imageUrl,
  seller,
  onAddToWishlist,
  onViewProduct,
  isInWishlist = false,
}: ProductCardProps) {
  const { formatPrice } = useSettings()
  const originalPrice = price * 1.2 // Mock original price (20% higher)
  const rating = 4.6 + Math.random() * 0.5 // Mock rating between 4.6-5.1
  const soldCount = Math.floor(Math.random() * 10) * 1000 + Math.floor(Math.random() * 1000) // Mock sold count
  
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg bg-background border border-border">
      <div className="relative overflow-hidden bg-muted/30">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 backdrop-blur-sm bg-background/80 hover:bg-background ${
            isInWishlist 
              ? "text-red-500" 
              : "text-muted-foreground hover:text-red-500"
          }`}
          onClick={() => onAddToWishlist?.(id)}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 bg-background/90 hover:bg-background shadow-md"
          onClick={() => onViewProduct?.(id)}
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
      
      <CardContent className="p-3 space-y-2">
        <h3 className="font-normal text-sm line-clamp-2 text-foreground min-h-[40px]">
          {title}
        </h3>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < Math.floor(rating) ? "" : "opacity-30"}>★</span>
                ))}
              </div>
              <span className="text-foreground">{rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <span className="text-muted-foreground">{(soldCount/1000).toFixed(0)}k+ sold</span>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-center gap-1 text-xs text-red-500">
              <span>-</span>
              <span className="font-medium">$2 off on $15</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-primary">
              <span>⚡</span>
              <span>New shoppers save</span>
              <span className="font-medium">${(price * 0.1).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}