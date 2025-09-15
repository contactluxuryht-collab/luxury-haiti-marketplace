import { Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/marketplace/ProductCard"
import { useWishlist } from "@/hooks/useWishlist"

export default function Wishlist() {
  const { wishlist, loading, removeFromWishlist } = useWishlist()

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId)
  }

  const handleViewProduct = (productId: string) => {
    console.log("View product:", productId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Wishlist</h1>
          <p className="text-muted-foreground">Your saved favorite products</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wishlist...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          <p className="text-muted-foreground">
            {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {wishlist.length > 0 && (
          <Button variant="outline" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Add All to Cart
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gradient-card rounded-xl border border-border/50">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
            <p className="text-muted-foreground mb-4">
              Start exploring products and save your favorites here
            </p>
            <Button asChild>
              <a href="/marketplace">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Browse Products
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div key={item.id} className="relative">
              <ProductCard
                id={item.product.id}
                title={item.product.title}
                description={item.product.description || ""}
                price={item.product.price}
                imageUrl={item.product.image_url || "/placeholder.svg"}
                seller={{
                  name: item.product.seller?.name || "Unknown Seller",
                  avatar: ""
                }}
                onAddToWishlist={handleRemoveFromWishlist}
                onViewProduct={handleViewProduct}
                isInWishlist={true}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 gap-1 bg-background/80 backdrop-blur-sm"
                onClick={() => handleRemoveFromWishlist(item.product.id)}
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}