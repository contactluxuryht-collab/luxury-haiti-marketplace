import { useAuth } from "@/hooks/useAuth"
import { Navigate } from "react-router-dom"

export default function SellerDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Seller Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and sales</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gradient-card rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold mb-2">Products</h3>
          <div className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">0</div>
          <p className="text-sm text-muted-foreground">Active listings</p>
        </div>
        <div className="p-6 bg-gradient-card rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold mb-2">Sales</h3>
          <div className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">$0</div>
          <p className="text-sm text-muted-foreground">Total revenue</p>
        </div>
        <div className="p-6 bg-gradient-card rounded-xl border border-border/50">
          <h3 className="text-lg font-semibold mb-2">Orders</h3>
          <div className="text-2xl font-bold bg-gradient-luxury bg-clip-text text-transparent">0</div>
          <p className="text-sm text-muted-foreground">Pending orders</p>
        </div>
      </div>
      
      <div className="flex items-center justify-center h-32 bg-gradient-card rounded-xl border border-border/50">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Connect to Supabase to Start Selling</h3>
          <p className="text-muted-foreground">Enable authentication and database features</p>  
        </div>
      </div>
    </div>
  )
}