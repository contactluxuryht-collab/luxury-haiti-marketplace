import { useParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"

const mockProducts = {
  "p1": {
    id: "p1",
    title: "Signature Leather Tote",
    description: "Premium full‑grain leather tote with reinforced handles and interior pocket.",
    price: 249,
    imageUrl: "/placeholder.svg"
  },
  "p2": {
    id: "p2",
    title: "Wireless ANC Headphones",
    description: "Over‑ear headphones with active noise cancelling and 35h battery life.",
    price: 179,
    imageUrl: "/placeholder.svg"
  }
} as const

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const product = (id && (mockProducts as any)[id]) || mockProducts.p1

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Back</Button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-xl overflow-hidden border border-border/50 bg-gradient-card">
          <img src={product.imageUrl} alt={product.title} className="w-full h-auto" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
          <div className="text-2xl font-semibold bg-gradient-luxury bg-clip-text text-transparent">
            ${product.price.toLocaleString()}
          </div>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="flex gap-3 pt-2">
            <Button variant="luxury">Add to Cart</Button>
            <Button variant="outline">Add to Wishlist</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

