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
  const waLink = seller.phoneNumber
    ? `https://wa.me/${seller.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi ${seller.name}, I'm interested in your product: ${title} (ID: ${id}).`
      )}`
    : null
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-elevated hover:scale-105 bg-gradient-card backdrop-blur-sm border-border/50">
      <div className="relative overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-3 right-3 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ${
            isInWishlist 
              ? "bg-red-500/20 hover:bg-red-500/30 text-red-500" 
              : "bg-white/20 hover:bg-white/30 text-white"
          }`}
          onClick={() => onAddToWishlist?.(id)}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
        </Button>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {description}
          </p>
          
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">
                {formatPrice(price)}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-5 h-5 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs font-semibold">
                    {seller.name.charAt(0)}
                  </span>
                </div>
                <span>{seller.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {waLink && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(waLink, '_blank')}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              )}
              <Button
                variant="luxury"
                size="sm"
                onClick={() => onViewProduct?.(id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <ShoppingCart className="h-4 w-4" />
                View
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}