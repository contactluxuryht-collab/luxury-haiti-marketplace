export default function Wishlist() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wishlist</h1>
        <p className="text-muted-foreground">Your saved favorite products</p>
      </div>
      
      <div className="flex items-center justify-center h-64 bg-gradient-card rounded-xl border border-border/50">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Your Wishlist is Empty</h3>
          <p className="text-muted-foreground">Start exploring products and save your favorites here</p>  
        </div>
      </div>
    </div>
  )
}