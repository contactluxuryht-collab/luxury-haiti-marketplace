import { Heart, ShoppingCart } from "lucide-react"
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

  const extractOffer = (text: string) => {
    try {
      const lines = (text || "").split(/\n+/)
      const offerLine = lines.find((l) => l.trim().toUpperCase().startsWith("[OFFER]:"))
      if (!offerLine) return null
      const m1 = offerLine.match(/amount\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
      const m2 = offerLine.match(/threshold\s*=\s*([0-9]+(?:\.[0-9]+)?)/i)
      const amount = m1 ? parseFloat(m1[1]) : NaN
      const threshold = m2 ? parseFloat(m2[1]) : NaN
      if (isNaN(amount) || isNaN(threshold)) return null
      return { amount, threshold }
    } catch {
      return null
    }
  }
  const offer = extractOffer(description)
  
  // Calculate discounted price if there's a valid offer
  const discountedPrice = offer && offer.threshold <= price ? price - offer.amount : null
  
  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-lg bg-background border border-border cursor-pointer"
      onClick={() => onViewProduct?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onViewProduct?.(id) }}
    >
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
          onClick={(e) => { e.stopPropagation(); onAddToWishlist?.(id) }}
        >
          <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute bottom-2 right-2 bg-background/90 hover:bg-background shadow-md"
          onClick={(e) => { e.stopPropagation(); onViewProduct?.(id) }}
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </div>
      
      <CardContent className="p-3 space-y-2">
        <h3 className="font-normal text-sm line-clamp-2 text-foreground min-h-[40px]">{title}</h3>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            {discountedPrice ? (
              <>
                <span className="text-2xl font-bold text-foreground">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(price)}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-foreground">
                {formatPrice(price)}
              </span>
            )}
          </div>
          
          <div className="space-y-1 pt-1">
            {offer && offer.threshold <= price && (
              <div className="flex items-center gap-1 text-xs text-red-500">
                <span className="font-medium">Save ${offer.amount}</span>
              </div>
            )}
            {offer && offer.threshold > price && (
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <span className="font-medium">Spend ${offer.threshold - price} more to save ${offer.amount}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}